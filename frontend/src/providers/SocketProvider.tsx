'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import io, { Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";
import { useTaskStore } from "@/store/taskStore";
import { Task, ProgressUpdate } from "@/lib/types";
import { toast } from "sonner";

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

  const isConnecting = useRef(false);
  const socketConnected = useRef(false);

  useEffect(() => {
    // Only connect if user is authenticated and token exists
    const token = typeof window !== "undefined" ? localStorage.getItem("taskpholio_token") : null;
    
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers([]);
        socketConnected.current = false;
      }
      return;
    }

    // Prevent multiple connection attempts
    if (isConnecting.current || socketConnected.current) return;
    isConnecting.current = true;

    const { addLiveTask, updateLiveTask, removeLiveTask, addLiveProgress } = useTaskStore.getState();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      isConnecting.current = false;
      return;
    }
    const socketUrl = apiUrl.split('/api')[0];

    console.log("[Socket] Initializing connection to:", socketUrl);
    const socketInstance = io(socketUrl, {
      auth: { token },
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      socketConnected.current = true;
      isConnecting.current = false;
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
    socketInstance.on("NEW_TASK", (task: Task) => {
      addLiveTask(task);
      toast.info(`New Mission: ${task.title}`);
    });
    socketInstance.on("TASK_UPDATED", (task: Task) => updateLiveTask(task));
    socketInstance.on("TASK_DELETED", (id: string) => removeLiveTask(id));
    socketInstance.on("TASK_COMMENT", ({ taskId, comment }: any) => {
      // Handle live comment update if needed, or just toast
      toast.info("Intelligence Update: New tactical comms received.");
    });
    
    socketInstance.on("PROGRESS_UPDATE", ({ task, newProgress }: { task: string; newProgress: number }) => {
      addLiveProgress(task, newProgress);
    });

    // Meeting & Notification Events
    socketInstance.on("MEETING_ALERT", (meeting: any) => {
      toast.success(`Briefing Alert: ${meeting.title}`);
    });

    socketInstance.on("NOTIFICATION", (notif: any) => {
      toast.info(notif.title, { description: notif.message });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.off("NEW_TASK");
      socketInstance.off("TASK_UPDATED");
      socketInstance.off("TASK_DELETED");
      socketInstance.off("TASK_COMMENT");
      socketInstance.off("PROGRESS_UPDATE");
      socketInstance.off("MEETING_ALERT");
      socketInstance.off("NOTIFICATION");
      socketInstance.disconnect();
    };
  }, [user]); // Re-run if user logs in/out

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
