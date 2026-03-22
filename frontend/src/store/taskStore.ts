"use client";
import { create } from "zustand";
import { Task } from "@/lib/types";
import api from "@/lib/api";

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  isLoading: boolean;
  fetchTasks: (filters?: Record<string, string>) => Promise<void>;
  fetchTask: (id: string) => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTaskStatus: (id: string, status: Task["status"]) => Promise<void>;
  acknowledgeTask: (id: string, status: "seen" | "accepted") => Promise<void>;
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

  fetchTasks: async (filters = {}) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/tasks${params ? `?${params}` : ""}`);
      set({ tasks: res.data.data.tasks, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  fetchTask: async (id) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/tasks/${id}`);
      set({ currentTask: res.data.data.task, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  createTask: async (data) => {
    const res = await api.post("/tasks", data);
    const newTask = res.data.data.task;
    set((state) => ({ tasks: [newTask, ...state.tasks] }));
    return newTask;
  },

  updateTask: async (id, data) => {
    const res = await api.patch(`/tasks/${id}`, data);
    const updated = res.data.data.task;
    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === id ? updated : t)),
      currentTask: state.currentTask?._id === id ? updated : state.currentTask,
    }));
  },

  updateTaskStatus: async (id, status) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === id ? { ...t, status } : t)),
    }));
    try {
      await api.patch(`/tasks/${id}`, { status });
    } catch (err) {
      get().fetchTasks();
      throw err;
    }
  },

  deleteTask: async (id) => {
    await api.delete(`/tasks/${id}`);
    set((state) => ({ tasks: state.tasks.filter((t) => t._id !== id) }));
  },

  acknowledgeTask: async (id, status) => {
    const res = await api.post(`/tasks/${id}/acknowledge`, { status });
    const acks = res.data.data.acknowledgements;
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t._id === id ? { ...t, acknowledgements: acks } : t
      ),
      currentTask:
        state.currentTask?._id === id
          ? { ...state.currentTask, acknowledgements: acks }
          : state.currentTask,
    }));
  },

  // --- Live Socket Actions ---
  addLiveTask: (task) => {
    set((state) => {
      if (state.tasks.some((t) => t._id === task._id)) return state;
      return { tasks: [task, ...state.tasks] };
    });
  },

  updateLiveTask: (task) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === task._id ? task : t)),
      currentTask: state.currentTask?._id === task._id ? task : state.currentTask,
    }));
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
              status: newProgress >= 100 ? "Completed" : newProgress > 0 ? "In Progress" : t.status,
            }
          : t
      ),
      currentTask:
        state.currentTask?._id === taskId
          ? {
              ...state.currentTask,
              progress: newProgress,
              status: newProgress >= 100 ? "Completed" : newProgress > 0 ? "In Progress" : state.currentTask.status,
            }
          : state.currentTask,
    }));
  },
}));
