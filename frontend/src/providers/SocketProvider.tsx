'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import io, { Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";
import { useTaskStore } from "@/store/taskStore";
import { Task, ProgressUpdate } from "@/lib/types";

interface SocketContextProps {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[]; // array of user IDs
}

const SocketContext = createContext<SocketContextProps>({
  socket: null,
  isConnected: false,
  onlineUsers: [],
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  
  const { user } = useAuthStore();

  useEffect(() => {
    // Only connect if user is authenticated and token exists
    const token = typeof window !== "undefined" ? localStorage.getItem("taskpholio_token") : null;
    
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers([]);
      }
      return;
    }

    const { addLiveTask, updateLiveTask, removeLiveTask, addLiveProgress } = useTaskStore.getState();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;
    const socketUrl = apiUrl.split('/api')[0];

    const socketInstance = io(socketUrl, {
      auth: { token },
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("[Socket] Connected to realtime server");
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("[Socket] Disconnected from realtime server");
    });

    socketInstance.on("online_users", (users: string[]) => {
      setOnlineUsers(users);
    });

    socketInstance.on("user_status", ({ userId, status }: { userId: string; status: "online" | "offline" }) => {
      setOnlineUsers((prev) => {
        if (status === "online" && !prev.includes(userId)) return [...prev, userId];
        if (status === "offline") return prev.filter((id) => id !== userId);
        return prev;
      });
    });

    // Task Events
    socketInstance.on("NEW_TASK", (task: Task) => addLiveTask(task));
    socketInstance.on("TASK_UPDATED", (task: Task) => updateLiveTask(task));
    socketInstance.on("TASK_DELETED", (id: string) => removeLiveTask(id));
    socketInstance.on("PROGRESS_UPDATE", ({ task, newProgress }: { task: string; newProgress: number }) => {
      addLiveProgress(task, newProgress);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.off("NEW_TASK");
      socketInstance.off("TASK_UPDATED");
      socketInstance.off("TASK_DELETED");
      socketInstance.off("PROGRESS_UPDATE");
      socketInstance.disconnect();
    };
  }, [user]); // Re-run if user logs in/out

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
