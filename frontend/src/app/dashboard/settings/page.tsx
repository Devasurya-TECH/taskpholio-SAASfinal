"use client";
import { useAuthStore } from "@/store/authStore";
import { getRoleColor, cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-foreground">Profile</h3>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-2xl font-bold">
            {user?.name[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <span className={cn("text-xs px-2 py-1 rounded font-medium mt-1 inline-block", getRoleColor(user?.role || "Member"))}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-foreground">About</h3>
        <div className="space-y-3">
          {[
            ["Application", "Taskpholio"],
            ["Version", "1.0.0"],
            ["Stack", "Next.js · Express · MongoDB · Cloudinary"],
            ["License", "MIT"],
          ].map(([key, val]) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground">{key}</span>
              <span className="text-sm font-medium text-foreground">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
