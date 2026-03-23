"use client";
import { create } from "zustand";
import { Task } from "@/lib/types";
import api from "@/lib/api";

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
  fetchTasks: (force?: boolean, filters?: Record<string, string>) => Promise<void>;
  fetchTask: (id: string) => Promise<void>;
  createTask: (data: any) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTaskStatus: (id: string, status: Task["status"]) => Promise<void>;
  setFilters: (filters: Partial<TaskState["filters"]>) => void;
  getFilteredTasks: () => Task[];
  // Live socket actions
  addLiveTask: (task: Task) => void;
  updateLiveTask: (task: Task) => void;
  removeLiveTask: (id: string) => void;
  addLiveProgress: (taskId: string, newProgress: number) => void;
}

export const useTaskStore = create<TaskState>()((set, get) => ({
  tasks: [],
  currentTask: null,
  isLoading: false,
  lastFetch: null,
  filters: {
    status: 'all',
    priority: 'all',
    search: ''
  },

  fetchTasks: async (force = false, additionalFilters = {}) => {
    const { lastFetch, isLoading } = get();
    if (!force && lastFetch && Date.now() - lastFetch < 30000) return;
    
    set({ isLoading: true });
    try {
      const res = await api.get("tasks", { params: additionalFilters });
      set({ 
        tasks: res.data.data.tasks, 
        isLoading: false,
        lastFetch: Date.now()
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  fetchTask: async (id) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`tasks/${id}`);
      set({ currentTask: res.data.data.task, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  createTask: async (data) => {
    const res = await api.post("tasks", data);
    const newTask = res.data.data.task;
    set((state) => ({ tasks: [newTask, ...state.tasks] }));
    return newTask;
  },

  updateTask: async (id, data) => {
    const res = await api.patch(`tasks/${id}`, data);
    const updated = res.data.data.task;
    
    set((state) => {
      const currentTaskInList = state.tasks.find(t => t._id === id);
      if (JSON.stringify(currentTaskInList) === JSON.stringify(updated)) return state;
      
      return {
        tasks: state.tasks.map((t) => (t._id === id ? updated : t)),
        currentTask: state.currentTask?._id === id ? updated : state.currentTask,
      };
    });
  },

  updateTaskStatus: async (id, status) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === id ? { ...t, status } : t)),
    }));
    try {
      await api.patch(`tasks/${id}`, { status });
    } catch (err) {
      get().fetchTasks(true);
      throw err;
    }
  },

  deleteTask: async (id) => {
    await api.delete(`tasks/${id}`);
    set((state) => ({ tasks: state.tasks.filter((t) => t._id !== id) }));
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters }
    }));
  },

  getFilteredTasks: () => {
    const { tasks, filters } = get();
    return tasks.filter(task => {
      const matchesStatus = filters.status === 'all' || task.status === filters.status;
      const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
      const matchesSearch = !filters.search || 
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.search.toLowerCase());
      return matchesStatus && matchesPriority && matchesSearch;
    });
  },

  // --- Live Socket Actions ---
  addLiveTask: (task) => {
    set((state) => {
      if (state.tasks.some((t) => t._id === task._id)) return state;
      return { tasks: [task, ...state.tasks] };
    });
  },

  updateLiveTask: (task) => {
    set((state) => {
      const currentTaskInList = state.tasks.find(t => t._id === task._id);
      if (JSON.stringify(currentTaskInList) === JSON.stringify(task)) return state;
      
      return {
        tasks: state.tasks.map((t) => (t._id === task._id ? task : t)),
        currentTask: state.currentTask?._id === task._id ? task : state.currentTask,
      };
    });
  },

  removeLiveTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t._id !== id),
      currentTask: state.currentTask?._id === id ? null : state.currentTask,
    }));
  },

  addLiveProgress: (taskId, newProgress) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t._id === taskId
          ? {
              ...t,
              progress: newProgress,
              status: newProgress >= 100 ? "completed" : newProgress > 0 ? "in-progress" : t.status as any,
            }
          : t
      ),
      currentTask:
        state.currentTask?._id === taskId
          ? {
              ...state.currentTask,
              progress: newProgress,
              status: newProgress >= 100 ? "completed" : newProgress > 0 ? "in-progress" : state.currentTask.status as any,
            }
          : state.currentTask,
    }));
  },
}));
