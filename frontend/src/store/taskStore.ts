"use client";
import { create } from "zustand";
import { Task, User } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { RealtimeChannel } from "@supabase/supabase-js";
import { sendPushToUsers } from "@/lib/pushNotifications";

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  isLoading: boolean;
  lastFetch: number | null;
  filters: {
    status: string;
    priority: string;
    search: string;
  };
  fetchTasks: (force?: boolean, silent?: boolean, filters?: Record<string, string>) => Promise<void>;
  fetchTask: (id: string) => Promise<void>;
  createTask: (data: any) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTaskStatus: (id: string, status: Task["status"]) => Promise<void>;
  setFilters: (filters: Partial<TaskState["filters"]>) => void;
  getFilteredTasks: () => Task[];
  initRealtimeTasks: () => void;
}

let taskRealtimeChannel: RealtimeChannel | null = null;

const roleMap: Record<string, User["role"]> = {
  ceo: "CEO",
  cto: "CTO",
  member: "Member",
};

const normalizeStatusFromDb = (status: string): Task["status"] => {
  const value = (status || "").toLowerCase();
  if (value === "in_progress") return "in-progress";
  if (value === "blocked") return "blocked";
  if (value === "completed") return "completed";
  if (value === "cancelled") return "cancelled";
  return "pending";
};

const toDbStatus = (status: string): string => {
  const value = (status || "").toLowerCase();
  if (value === "in-progress") return "in_progress";
  if (value === "blocked") return "blocked";
  if (value === "completed") return "completed";
  if (value === "cancelled") return "blocked";
  return "pending";
};

const normalizePriorityFromDb = (priority: string): Task["priority"] => {
  const value = (priority || "").toLowerCase();
  if (value === "critical") return "urgent";
  if (value === "high") return "high";
  if (value === "low") return "low";
  return "medium";
};

const toDbPriority = (priority: string): string => {
  const value = (priority || "").toLowerCase();
  if (value === "urgent") return "critical";
  if (value === "high") return "high";
  if (value === "low") return "low";
  return "medium";
};

const progressFromStatus = (status: Task["status"]): number => {
  if (status === "completed") return 100;
  if (status === "in-progress") return 50;
  if (status === "blocked") return 20;
  return 0;
};

const statusLabel = (status: Task["status"]): string => {
  if (status === "in-progress") return "In Progress";
  if (status === "completed") return "Completed";
  if (status === "blocked") return "Blocked";
  if (status === "cancelled") return "Cancelled";
  return "Not Started";
};

const buildAssignee = (profile: any): User | null => {
  if (!profile) return null;
  return {
    _id: profile.id,
    name: profile.full_name,
    email: profile.email,
    role: roleMap[(profile.role || "").toLowerCase()] || "Member",
    avatar: profile.avatar_url || undefined,
    team: profile.team || null,
    status: profile.is_active === false ? "away" : "active",
    lastActive: new Date().toISOString(),
    createdAt: profile.created_at || new Date().toISOString(),
  };
};

const resolveTeamId = (team: User["team"]): string | null => {
  if (!team) return null;
  if (typeof team === "string") return team;
  if (typeof team === "object") {
    return team._id || team.id || null;
  }
  return null;
};

const buildTaskVisibilityFilter = (user: User | null): string | null => {
  if (!user?._id) return null;

  const filters = [
    `assigned_to.eq.${user._id}`,
    `created_by.eq.${user._id}`,
    "visibility.eq.all",
  ];

  if (user.role === "Member") {
    const teamId = resolveTeamId(user.team);
    if (teamId) {
      filters.push(`assigned_team.eq.${teamId}`);
    }
  } else {
    filters.push("visibility.eq.team");
  }

  return filters.join(",");
};

const hydrateTasks = async (rows: any[]): Promise<Task[]> => {
  if (!rows?.length) return [];

  const assigneeIds = Array.from(new Set(rows.map((row) => row.assigned_to).filter(Boolean)));
  const creatorIds = Array.from(new Set(rows.map((row) => row.created_by).filter(Boolean)));
  const teamIds = Array.from(new Set(rows.map((row) => row.assigned_team).filter(Boolean)));

  const profileMap = new Map<string, any>();
  const profileIds = Array.from(new Set([...assigneeIds, ...creatorIds]));
  if (profileIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, team, avatar_url, is_active, created_at")
      .in("id", profileIds);
    (profiles || []).forEach((profile: any) => profileMap.set(profile.id, profile));
  }

  const teamMap = new Map<string, { _id: string; name: string }>();
  if (teamIds.length > 0) {
    const { data: teams } = await supabase.from("teams").select("id, name").in("id", teamIds);
    (teams || []).forEach((team: any) => teamMap.set(team.id, { _id: team.id, name: team.name }));
  }

  return rows.map((row) => {
    const status = normalizeStatusFromDb(row.status);
    const priority = normalizePriorityFromDb(row.priority);
    const assignee = buildAssignee(profileMap.get(row.assigned_to));
    const creator = buildAssignee(profileMap.get(row.created_by));
    const teamRef = row.assigned_team ? teamMap.get(row.assigned_team) || { _id: row.assigned_team, name: "Team" } : null;
    const assignmentType: Task["assignmentType"] = row.assigned_to && row.assigned_team
      ? "hybrid"
      : row.assigned_team
        ? "team"
        : "individual";

    return {
      _id: row.id,
      title: row.title || "",
      description: row.description || "",
      status,
      priority,
      assignedTo: assignee,
      assignedToId: row.assigned_to || null,
      team: teamRef,
      teamId: row.assigned_team || null,
      assignmentType,
      createdBy: creator,
      dueDate: row.due_date || undefined,
      attachments: Array.isArray(row.attachments) ? row.attachments : [],
      subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
      comments: Array.isArray(row.comments) ? row.comments : [],
      activity: Array.isArray(row.activity) ? row.activity : [],
      tags: Array.isArray(row.tags) ? row.tags : [],
      isArchived: Boolean(row.is_archived),
      progress: typeof row.progress === "number" ? row.progress : progressFromStatus(status),
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
      visibility: row.visibility || "team",
    };
  });
};

const createAssignmentNotifications = async (task: Task) => {
  const rows: any[] = [];

  if (task.assignedToId) {
    rows.push({
      user_id: task.assignedToId,
      type: "task_assigned",
      title: "New personal task assigned",
      body: `${task.title} (${statusLabel(task.status)})`,
      ref_id: task._id,
    });
  }

  if (task.teamId) {
    const { data: members } = await supabase.from("profiles").select("id").eq("team", task.teamId);
    (members || []).forEach((member: any) => {
      if (member.id !== task.assignedToId) {
        rows.push({
          user_id: member.id,
          type: "task_assigned",
          title: "New team task assigned",
          body: `${task.title} was assigned to your team`,
          ref_id: task._id,
        });
      }
    });
  }

  if (rows.length > 0) {
    await supabase.from("notifications").insert(rows);
    await sendPushToUsers({
      userIds: rows.map((row) => row.user_id),
      title: task.teamId ? "New team task assigned" : "New task assigned",
      body: `${task.title} (${statusLabel(task.status)})`,
      url: `/dashboard/tasks/${task._id}`,
      tag: `task-assigned-${task._id}`,
    });
  }
};

const createTaskStatusNotifications = async (task: Task, status: Task["status"]) => {
  const actor = useAuthStore.getState().user;
  const recipientIds = new Set<string>();

  if (task.teamId) {
    const { data: members } = await supabase.from("profiles").select("id").eq("team", task.teamId);
    (members || []).forEach((member: any) => recipientIds.add(member.id));
  }

  if (task.createdBy?._id) {
    recipientIds.add(task.createdBy._id);
  }

  if (task.assignedToId) {
    recipientIds.add(task.assignedToId);
  }

  if (actor?._id) {
    recipientIds.delete(actor._id);
  }

  if (recipientIds.size === 0) return;

  const rows = Array.from(recipientIds).map((userId) => ({
    user_id: userId,
    type: "task_updated",
    title: "Task status updated",
    body: `${actor?.name || "A teammate"} marked "${task.title}" as ${statusLabel(status)}`,
    ref_id: task._id,
  }));

  await supabase.from("notifications").insert(rows);
  await sendPushToUsers({
    userIds: rows.map((row) => row.user_id),
    title: "Task status updated",
    body: `${actor?.name || "A teammate"} marked "${task.title}" as ${statusLabel(status)}`,
    url: `/dashboard/tasks/${task._id}`,
    tag: `task-status-${task._id}`,
  });
};

export const useTaskStore = create<TaskState>()((set, get) => ({
  tasks: [],
  currentTask: null,
  isLoading: false,
  lastFetch: null,
  filters: {
    status: "all",
    priority: "all",
    search: "",
  },

  fetchTasks: async (force = false, silent = false, additionalFilters = {}) => {
    const { lastFetch } = get();
    if (!force && lastFetch && Date.now() - lastFetch < 10000) return;

    if (!silent) set({ isLoading: true });
    try {
      const me = useAuthStore.getState().user;
      let query = supabase.from("tasks").select("*").order("created_at", { ascending: false });

      const visibilityFilter = buildTaskVisibilityFilter(me);
      if (visibilityFilter) {
        query = query.or(visibilityFilter);
      }

      if (additionalFilters.team) query = query.eq("assigned_team", additionalFilters.team);
      if (additionalFilters.status && additionalFilters.status !== "all") {
        query = query.eq("status", toDbStatus(additionalFilters.status));
      }
      if (additionalFilters.search) query = query.ilike("title", `%${additionalFilters.search}%`);

      const { data, error } = await query;
      if (error) throw error;

      const mappedTasks = await hydrateTasks(data || []);
      set({
        tasks: mappedTasks,
        isLoading: false,
        lastFetch: Date.now(),
      });
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
    }
  },

  fetchTask: async (id) => {
    set({ isLoading: true, currentTask: null });
    try {
      const me = useAuthStore.getState().user;
      const visibilityFilter = buildTaskVisibilityFilter(me);
      let query = supabase.from("tasks").select("*").eq("id", id);
      if (visibilityFilter) {
        query = query.or(visibilityFilter);
      }

      const { data, error } = await query.single();
      if (error) throw error;
      const [task] = await hydrateTasks([data]);
      set({ currentTask: task || null, isLoading: false });
    } catch (err) {
      console.error(err);
      set({ currentTask: null, isLoading: false });
    }
  },

  createTask: async (data) => {
    const me = useAuthStore.getState().user;
    const assignedToId = data.assignedTo || data.assigned_to || null;
    const assignedTeamId = data.team || data.assigned_team || null;

    if (!assignedToId && !assignedTeamId) {
      throw new Error("Please assign this task to a member or a team.");
    }

    const memberVisibility = data.memberVisibility === "public" ? "all" : "personal";
    const visibility = assignedTeamId && !assignedToId ? "team" : memberVisibility;

    const payload = {
      title: data.title,
      description: data.description || null,
      status: "pending",
      priority: toDbPriority(data.priority || "medium"),
      due_date: data.dueDate || data.due_date || null,
      assigned_to: assignedToId,
      assigned_team: assignedTeamId,
      visibility,
      created_by: me?._id || null,
    };

    const { data: inserted, error } = await supabase.from("tasks").insert(payload).select("*").single();
    if (error) throw error;

    const [task] = await hydrateTasks([inserted]);
    if (!task) throw new Error("Task created but could not be mapped.");

    set((state) => ({ tasks: [task, ...state.tasks] }));
    await createAssignmentNotifications(task);
    return task;
  },

  updateTask: async (id, data) => {
    const updates: Record<string, any> = {};
    if (data.title !== undefined) updates.title = data.title;
    if (data.description !== undefined) updates.description = data.description;
    if (data.priority !== undefined) updates.priority = toDbPriority(data.priority);
    if (data.status !== undefined) updates.status = toDbStatus(data.status);
    if ((data as any).dueDate !== undefined) updates.due_date = (data as any).dueDate || null;
    if ((data as any).assignedToId !== undefined) updates.assigned_to = (data as any).assignedToId || null;
    if ((data as any).teamId !== undefined) updates.assigned_team = (data as any).teamId || null;

    if (Object.keys(updates).length === 0) return;

    const { data: updated, error } = await supabase.from("tasks").update(updates).eq("id", id).select("*").single();
    if (error) throw error;

    const [task] = await hydrateTasks([updated]);
    if (!task) return;

    set((state) => ({
      tasks: state.tasks.map((existing) => (existing._id === id ? task : existing)),
      currentTask: state.currentTask?._id === id ? task : state.currentTask,
    }));
  },

  updateTaskStatus: async (id, status) => {
    const previousTask = get().tasks.find((task) => task._id === id);

    set((state) => ({
      tasks: state.tasks.map((task) =>
        task._id === id
          ? { ...task, status, progress: progressFromStatus(status), updatedAt: new Date().toISOString() }
          : task
      ),
    }));

    try {
      const { data: updated, error } = await supabase
        .from("tasks")
        .update({ status: toDbStatus(status) })
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;

      const [task] = await hydrateTasks([updated]);
      if (task) {
        set((state) => ({
          tasks: state.tasks.map((existing) => (existing._id === id ? task : existing)),
          currentTask: state.currentTask?._id === id ? task : state.currentTask,
        }));

        if (previousTask?.status !== status) {
          await createTaskStatusNotifications(task, status);
        }
      }
    } catch (err) {
      if (previousTask) {
        set((state) => ({
          tasks: state.tasks.map((task) => (task._id === id ? previousTask : task)),
        }));
      }
      throw err;
    }
  },

  deleteTask: async (id) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
    set((state) => ({
      tasks: state.tasks.filter((task) => task._id !== id),
      currentTask: state.currentTask?._id === id ? null : state.currentTask,
    }));
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  getFilteredTasks: () => {
    const { tasks, filters } = get();
    return tasks.filter((task) => {
      const matchesStatus = filters.status === "all" || task.status === filters.status;
      const matchesPriority = filters.priority === "all" || task.priority === filters.priority;
      const matchesSearch =
        !filters.search ||
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.search.toLowerCase());
      return matchesStatus && matchesPriority && matchesSearch;
    });
  },

  initRealtimeTasks: () => {
    if (taskRealtimeChannel) {
      supabase.removeChannel(taskRealtimeChannel);
    }

    taskRealtimeChannel = supabase
      .channel("public:tasks")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "tasks" }, () => {
        get().fetchTasks(true, true);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "tasks" }, () => {
        get().fetchTasks(true, true);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "tasks" }, () => {
        get().fetchTasks(true, true);
      });

    taskRealtimeChannel.subscribe();
  },
}));
