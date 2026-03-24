"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCorners } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Search, Users } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { useAuthStore } from "@/store/authStore";
import { Task } from "@/lib/types";
import { cn, getPriorityColor, formatDate, getDisplayName, getInitial, isMemberRole } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";

const KANBAN_COLUMNS: { id: Task["status"]; label: string; color: string }[] = [
  { id: "pending", label: "Not Started", color: "border-muted-foreground/30" },
  { id: "in-progress", label: "In Progress", color: "border-blue-500/40" },
  { id: "blocked", label: "Blocked", color: "border-amber-500/40" },
  { id: "completed", label: "Completed", color: "border-primary/40" },
];

const STATUS_OPTIONS: Task["status"][] = ["pending", "in-progress", "completed"];

function TaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Link href={`/dashboard/tasks/${task._id}`}>
        <motion.div
          whileHover={{ y: -2, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
          className="glass rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-sm font-semibold text-foreground line-clamp-2">{task.title}</h4>
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium shrink-0", getPriorityColor(task.priority))}>
              {task.priority}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary border border-border text-muted-foreground uppercase font-semibold">
              {task.assignmentType === "team" ? "Team" : task.assignmentType === "hybrid" ? "Team + Member" : "Individual"}
            </span>
            {task.team?.name && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary font-semibold">
                {task.team.name}
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
          )}

          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">{task.progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${task.progress}%` }} className="h-full bg-primary rounded-full" />
            </div>
          </div>

            <div className="flex items-center justify-between">
              <div className="flex -space-x-1.5">
                {task.assignedTo && (
                  <div
                    title={getDisplayName(task.assignedTo.name, task.assignedTo.email)}
                    className="w-6 h-6 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-primary text-[10px] font-bold"
                  >
                    {getInitial(task.assignedTo.name, task.assignedTo.email)}
                  </div>
                )}
              </div>
            {task.dueDate && <span className="text-[10px] text-muted-foreground">{formatDate(task.dueDate)}</span>}
          </div>
        </motion.div>
      </Link>
    </div>
  );
}

function Column({ label, color, tasks }: { id: Task["status"]; label: string; color: string; tasks: Task[] }) {
  return (
    <div className={cn("flex-1 min-w-72 glass rounded-xl border-t-2 p-4 flex flex-col gap-3", color)}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{label}</h3>
          <span className="w-5 h-5 rounded-full bg-secondary text-muted-foreground text-xs flex items-center justify-center font-medium">{tasks.length}</span>
        </div>
      </div>
      <SortableContext items={tasks.map((task) => task._id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 flex-1">
          {tasks.map((task) => <TaskCard key={task._id} task={task} />)}
          {tasks.length === 0 && <div className="py-8 text-center text-xs text-muted-foreground border-2 border-dashed border-border rounded-xl">Drop tasks here</div>}
        </div>
      </SortableContext>
    </div>
  );
}

function memberStepLabel(status: Task["status"]) {
  if (status === "in-progress") return "In Progress";
  if (status === "completed") return "Completed";
  return "Started";
}

export default function TasksPage() {
  const { user } = useAuthStore();
  const { tasks, fetchTasks, updateTaskStatus } = useTaskStore();
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const isMember = isMemberRole(user?.role);
  const myTeamId = typeof user?.team === "string" ? user.team : user?.team?._id;

  useEffect(() => {
    fetchTasks(true);
  }, [fetchTasks]);

  const filtered = useMemo(() => {
    return tasks.filter((task) => {
      const matchSearch = task.title.toLowerCase().includes(search.toLowerCase());
      const matchPriority = !priorityFilter || task.priority === priorityFilter;
      return matchSearch && matchPriority;
    });
  }, [tasks, search, priorityFilter]);

  const directTasks = useMemo(() => {
    if (!isMember || !user?._id) return filtered;
    return filtered.filter((task) => task.assignedToId === user._id);
  }, [filtered, isMember, user]);

  const directTaskIds = useMemo(() => new Set(directTasks.map((task) => task._id)), [directTasks]);

  const teamTasks = useMemo(() => {
    if (!isMember || !myTeamId) return [];
    return filtered.filter((task) => task.teamId === myTeamId && task.assignmentType !== "individual" && !directTaskIds.has(task._id));
  }, [filtered, isMember, myTeamId, directTaskIds]);

  const publicTasks = useMemo(() => {
    if (!isMember || !user?._id) return [];
    return filtered.filter(
      (task) =>
        task.assignmentType === "individual" &&
        task.visibility === "all" &&
        task.assignedToId !== user._id
    );
  }, [filtered, isMember, user]);

  const byStatus = (status: Task["status"]) => filtered.filter((task) => task.status === status);
  const activeTask = tasks.find((task) => task._id === activeId);

  const getMyTeamProgressStatus = (task: Task): Task["status"] => {
    if (!user?._id) return task.status;
    const mine = task.teamProgress?.find((entry) => entry.userId === user._id);
    return mine?.status || "pending";
  };

  const getTeamProgressSummary = (task: Task): string => {
    const entries = task.teamProgress || [];
    if (entries.length === 0) return "0/0 completed";
    const completed = entries.filter((entry) => entry.status === "completed").length;
    return `${completed}/${entries.length} completed`;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const task = tasks.find((value) => value._id === active.id);
    const targetColumn = KANBAN_COLUMNS.find((column) => column.id === over.id);
    if (task && targetColumn && task.status !== targetColumn.id) {
      try {
        await updateTaskStatus(task._id, targetColumn.id);
        toast.success(`Task moved to ${targetColumn.label}`);
      } catch {
        toast.error("Failed to update task status.");
      }
    }
  };

  const handleTeamTaskStatusChange = async (taskId: string, status: Task["status"]) => {
    try {
      await updateTaskStatus(taskId, status);
      toast.success("Team task status updated.");
    } catch {
      toast.error("Failed to update team task status.");
    }
  };

  return (
    <div className="max-w-7xl w-full min-w-0 mx-auto px-2 md:px-4 xl:px-6 flex flex-col gap-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Tasks</h2>
          <p className="text-sm text-muted-foreground">
            {isMember
              ? `${directTasks.length} direct, ${teamTasks.length} team, ${publicTasks.length} public`
              : `${tasks.length} tasks total`}
          </p>
        </div>
        {(user?.role === "CEO" || user?.role === "CTO") && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Task
          </motion.button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full bg-secondary border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <select
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value)}
          className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {!isMember ? (
        <div className="w-full min-w-0">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={(event: DragStartEvent) => setActiveId(event.active.id as string)}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-5 overflow-x-auto pb-4 px-1">
              {KANBAN_COLUMNS.map((column) => (
                <Column key={column.id} {...column} tasks={byStatus(column.id)} />
              ))}
            </div>
            <DragOverlay>{activeTask && <div className="opacity-90 rotate-1"><TaskCard task={activeTask} /></div>}</DragOverlay>
          </DndContext>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="glass rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Directly Assigned to You</h3>
            {directTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground border border-dashed border-border rounded-lg p-4">No direct tasks assigned.</p>
            ) : (
              <div className="space-y-3">
                {directTasks.map((task) => (
                  <div key={task._id} className="border border-border rounded-lg p-3 bg-secondary/20">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{task.title}</p>
                      <span className="text-[10px] px-2 py-1 rounded border border-border text-muted-foreground uppercase">
                        {task.visibility === "all" ? "Public" : "Private"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{memberStepLabel(task.status)}</p>
                    {task.dueDate && <p className="text-xs text-muted-foreground mt-1">Deadline: {formatDate(task.dueDate)}</p>}
                    <div className="mt-3">
                      <Link href={`/dashboard/tasks/${task._id}`} className="text-xs font-semibold text-primary hover:underline">
                        Open Task
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Team-wide Tasks</h3>
            </div>
            {teamTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground border border-dashed border-border rounded-lg p-4">No team tasks assigned.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase text-muted-foreground">
                      <th className="py-2">Task</th>
                      <th className="py-2">Deadline</th>
                      <th className="py-2">Priority</th>
                      <th className="py-2">Status Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamTasks.map((task) => (
                      <tr key={task._id} className="border-t border-border/50">
                        <td className="py-2 pr-3">
                          <p className="font-medium text-foreground">{task.title}</p>
                          {task.team?.name && <p className="text-xs text-muted-foreground">{task.team.name}</p>}
                          <Link href={`/dashboard/tasks/${task._id}`} className="text-[11px] font-semibold text-primary hover:underline">
                            Open Task
                          </Link>
                        </td>
                        <td className="py-2 pr-3 text-xs text-muted-foreground">{task.dueDate ? formatDate(task.dueDate) : "No deadline"}</td>
                        <td className="py-2 pr-3 text-xs">
                          <span className={cn("px-2 py-1 rounded border text-[10px] uppercase", getPriorityColor(task.priority))}>{task.priority}</span>
                        </td>
                        <td className="py-2">
                          <select
                            value={getMyTeamProgressStatus(task)}
                            onChange={(event) => handleTeamTaskStatusChange(task._id, event.target.value as Task["status"])}
                            className="bg-secondary border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>{memberStepLabel(status)}</option>
                            ))}
                          </select>
                          <p className="mt-1 text-[10px] text-muted-foreground">{getTeamProgressSummary(task)}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="glass rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Public Member Tasks</h3>
            {publicTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground border border-dashed border-border rounded-lg p-4">No public member tasks available.</p>
            ) : (
              <div className="space-y-3">
                {publicTasks.map((task) => (
                  <div key={task._id} className="border border-border rounded-lg p-3 bg-secondary/20">
                    <p className="text-sm font-semibold text-foreground">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">Assigned to: {task.assignedTo?.name || "Member"}</p>
                    <p className="text-xs text-muted-foreground mt-1">Status: {memberStepLabel(task.status)}</p>
                    {task.dueDate && <p className="text-xs text-muted-foreground mt-1">Deadline: {formatDate(task.dueDate)}</p>}
                    <div className="mt-3">
                      <Link href={`/dashboard/tasks/${task._id}`} className="text-xs font-semibold text-primary hover:underline">
                        Open Task
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>{showModal && <CreateTaskModal onClose={() => setShowModal(false)} />}</AnimatePresence>
    </div>
  );
}
