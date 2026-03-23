"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useTaskStore } from "@/store/taskStore";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/tasks": "Tasks",
  "/dashboard/timeline": "Timeline",
  "/dashboard/teams": "Teams",
  "/dashboard/meetings": "Meetings",
  "/dashboard/notifications": "Notifications",
  "/dashboard/analytics": "Advanced Analytics",
  "/dashboard/profile": "Profile Settings",
  "/dashboard/settings": "Settings",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, fetchMe, token } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { fetchTasks } = useTaskStore();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const localToken = localStorage.getItem("taskpholio_token") || sessionStorage.getItem("taskpholio_token");
    
    if (!localToken) {
      router.replace("/login");
      return;
    }
    
    // Fetch fresh user data on mount
    fetchMe();
  }, []);

  useEffect(() => {
    if (isMounted && !isAuthenticated && !token) {
      router.replace("/login");
    }
  }, [isMounted, isAuthenticated, token, router]);

  // 10-second silent background polling
  useEffect(() => {
    if (!isAuthenticated) return;
    const intervalId = setInterval(() => {
      fetchTasks(true, true);
    }, 10000);
    return () => clearInterval(intervalId);
  }, [isAuthenticated, fetchTasks]);

  if (!isMounted) return null; // Prevent hydration flash

  const title = pageTitles[pathname] || "Taskpholio";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
