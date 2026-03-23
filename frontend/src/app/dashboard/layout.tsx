"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
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

  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        router.replace("/login");
        return;
      }
      
      // If we already have a user, we don't necessarily need to fetch again immediately
      // unless we want to ensure freshness.
      await fetchMe();
    };

    checkAuth();
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated && !token) {
      router.replace("/login");
    }
  }, [isAuthenticated, token, router]);

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
