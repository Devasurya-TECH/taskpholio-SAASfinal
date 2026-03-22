"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCheck } from "lucide-react";
import api from "@/lib/api";
import { Notification } from "@/lib/types";
import { cn, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";

const TYPE_ICONS: Record<string, string> = {
  TASK_ASSIGNED: "📋",
  PROGRESS_UPDATE: "📈",
  DEADLINE_ALERT: "⚠️",
  MEETING_SCHEDULED: "📅",
  GENERAL: "🔔",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.get("/notifications").then((res) => {
      setNotifications(res.data.data.notifications || []);
      setUnreadCount(res.data.data.unreadCount || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read.");
    } catch { toast.error("Failed to mark as read."); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Notifications</h2>
          {unreadCount > 0 && <p className="text-sm text-muted-foreground">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={markAllRead}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </motion.button>
        )}
      </div>

      <div className="space-y-2">
        {loading
          ? [...Array(5)].map((_, i) => <div key={i} className="animate-pulse bg-secondary rounded-xl h-16" />)
          : notifications.length === 0
          ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground text-sm">You're all caught up!</p>
            </div>
          )
          : notifications.map((notif, i) => (
              <motion.div
                key={notif._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  "glass rounded-xl px-4 py-3 flex items-start gap-3 transition-colors",
                  !notif.read && "border-primary/30 bg-primary/5"
                )}
              >
                <span className="text-lg shrink-0">{TYPE_ICONS[notif.type] || "🔔"}</span>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm", notif.read ? "text-muted-foreground" : "text-foreground font-medium")}>
                    {notif.message}
                  </p>
                  {notif.relatedTask && (
                    <p className="text-xs text-primary mt-0.5 truncate">
                      Task: {(notif.relatedTask as any)?.title}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(notif.createdAt)}</p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                )}
              </motion.div>
            ))
        }
      </div>
    </div>
  );
}
