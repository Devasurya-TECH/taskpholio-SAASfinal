"use client";
import { useState, useEffect } from "react";
import { 
  Bell, Check, Trash2, X, AlertCircle, 
  Play, ShieldCheck, CheckCircle2, MessageSquare, Tag,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotificationStore } from "@/store/notificationStore";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, unreadCount, fetchNotifications, 
    markAsRead, markAllAsRead, deleteNotification 
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getIcon = (type: string) => {
    const kind = (type || "").toUpperCase();
    switch (kind) {
      case 'TASK_ASSIGNED': return <Calendar className="w-4 h-4 text-blue-400" />;
      case 'TASK_UPDATED': return <Play className="w-4 h-4 text-amber-400" />;
      case 'TASK_COMPLETED': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'TASK_COMMENT': return <MessageSquare className="w-4 h-4 text-primary" />;
      case 'MEMBER_ADDED': return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'MEETING_READY': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'MEETING_SCHEDULED': return <Calendar className="w-4 h-4 text-purple-400" />;
      default: return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="topbar-bell-btn"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="topbar-bell-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 mt-3 w-96 glass rounded-3xl border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] z-50 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 bg-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-black text-foreground tracking-tight">Intelligence Feed</h3>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Real-time Briefing Updates</p>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:text-primary/80 transition-colors"
                  >
                    Acknowledge All Updates
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center px-10">
                    <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                        <Bell className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <h4 className="font-black text-sm text-foreground mb-2">Comms Line Clear</h4>
                    <p className="text-xs text-muted-foreground font-medium">No tactical updates or mission alerts at this time.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {notifications.map((notif: any) => (
                      <div
                        key={notif._id}
                        className={cn(
                          "p-6 transition-all hover:bg-white/5 group relative cursor-pointer",
                          !notif.read && "bg-primary/5 shadow-inner shadow-primary/5"
                        )}
                      >
                        <div className="flex gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110",
                            !notif.read ? "bg-primary/20 border border-primary/20" : "bg-white/5 border border-white/10"
                          )}>
                            {getIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0" onClick={() => notif.link && setIsOpen(false)}>
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h5 className="text-sm font-black text-foreground line-clamp-1">{notif.title}</h5>
                              {!notif.read && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />}
                            </div>
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-3 line-clamp-2">
                              {notif.message}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                  {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                </span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!notif.read && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); markAsRead(notif._id); }}
                                            className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-400 transition-all"
                                            title="Acknowledge"
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); deleteNotification(notif._id); }}
                                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-500 transition-all"
                                        title="Purge"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-white/5 border-t border-white/5 text-center">
                  <button className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] hover:text-foreground transition-all">
                      Access Strategic Archive
                  </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
