"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Trash2, MailOpen, Clock, Zap, ShieldAlert, Rocket } from "lucide-react";
import api from "@/lib/api";
import { Notification } from "@/lib/types";
import { cn, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    let mounted = true;
    let channel: any = null;

    const subscribeRealtime = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId || !mounted) return;

      channel = supabase
        .channel(`notifications-page-${userId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
          () => fetchNotifications()
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
          () => fetchNotifications()
        )
        .subscribe();
    };

    subscribeRealtime();

    return () => {
      mounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) {
        setNotifications([]);
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq("user_id", userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      const mapped = (data || []).map(n => ({
        _id: n.id,
        type: n.type,
        title: n.title,
        message: n.body,
        read: n.read,
        createdAt: n.created_at
      }));
      setNotifications(mapped);
    } catch (err) {
      toast.error("Failed to intercept system alerts");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
      if (error) throw error;
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      toast.error("Protocol update failed");
    }
  };

  const clearAll = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('notifications').delete().eq('user_id', session.user.id);
      }
      setNotifications([]);
      toast.success("Intelligence cleared");
    } catch (err) {
      toast.error("Wipe operation failed");
    }
  };

  const getIcon = (type: string) => {
    const kind = (type || "").toUpperCase();
    switch (kind) {
      case "TASK_ASSIGNED": return <Rocket className="w-4 h-4 text-blue-400" />;
      case "TASK_UPDATED": return <Clock className="w-4 h-4 text-amber-400" />;
      case "COMMENT_ADDED": return <Zap className="w-4 h-4 text-yellow-400" />;
      case "SUBTASK_UPDATED": return <Check className="w-4 h-4 text-emerald-400" />;
      case "MEETING_READY": return <Clock className="w-4 h-4 text-purple-400" />;
      case "MEETING_SCHEDULED": return <Clock className="w-4 h-4 text-purple-400" />;
      case "MEMBER_ADDED": return <ShieldAlert className="w-4 h-4 text-emerald-400" />;
      default: return <ShieldAlert className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Intelligence Feed</h1>
          <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">Real-time System Updates & Notifications</p>
        </div>
        <div className="flex gap-4">
           {notifications.length > 0 && (
             <button 
              onClick={clearAll}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors py-2 px-4 rounded-xl border border-border/50 bg-secondary/30"
            >
              <Trash2 className="w-3.5 h-3.5" /> Wipe Intel
            </button>
           )}
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="h-24 bg-secondary/30 animate-pulse rounded-3xl" />)
        ) : notifications.length === 0 ? (
          <div className="glass rounded-[2.5rem] p-20 text-center border-dashed">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-10" />
            <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-xs">No active intelligence detected</p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.map((n, idx) => (
              <motion.div 
                key={n._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "glass rounded-3xl p-6 flex items-start gap-6 group hover:border-primary/20 transition-all shadow-xl shadow-black/5",
                  !n.read ? "bg-primary/[0.03] border-primary/20" : "opacity-70"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-border group-hover:bg-secondary/50 transition-all",
                  !n.read ? "bg-primary/10 border-primary/20" : "bg-secondary/30"
                )}>
                  {getIcon(n.type)}
                </div>
                
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-foreground truncate uppercase text-sm tracking-tight">{n.title}</h4>
                    <span className="text-[10px] font-black text-muted-foreground uppercase">{formatRelativeTime(n.createdAt)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{n.message}</p>
                </div>

                <div className="flex flex-col gap-2">
                   {!n.read && (
                     <button 
                      onClick={() => markAsRead(n._id)}
                      className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/10 hover:bg-primary transition-all hover:text-white"
                      title="Mark as Read"
                     >
                       <MailOpen className="w-4 h-4" />
                     </button>
                   )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
