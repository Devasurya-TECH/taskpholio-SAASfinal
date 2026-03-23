"use client";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useTaskStore } from "@/store/taskStore";
import { Task } from "@/lib/types";
import { cn, getPriorityColor, formatDate } from "@/lib/utils";
import { differenceInDays, parseISO, format, isValid, startOfDay, addDays } from "date-fns";
import { Clock, ShieldCheck, Target, Zap } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  "pending": "bg-muted-foreground/20 border-muted-foreground/30",
  "in-progress": "bg-blue-500/30 border-blue-500/50",
  "completed": "bg-emerald-500/30 border-emerald-500/50",
  "cancelled": "bg-red-500/30 border-red-500/50",
};

export default function TimelinePage() {
  const { tasks, fetchTasks, isLoading } = useTaskStore();

  useEffect(() => { fetchTasks(); }, []);

  const timelineTasks = useMemo(() => {
    return tasks
      .filter((t) => t.dueDate && isValid(parseISO(t.dueDate)))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [tasks]);

  const now = startOfDay(new Date());
  const minDate = timelineTasks.length > 0 ? startOfDay(new Date(timelineTasks[0].createdAt)) : now;
  const maxDate = timelineTasks.length > 0 
    ? new Date(Math.max(...timelineTasks.map(t => new Date(t.dueDate).getTime())))
    : addDays(now, 30);
  
  const totalRange = Math.max(differenceInDays(maxDate, minDate), 30);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight uppercase">Strategic Timeline</h1>
          <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px] mt-2">Gantt-style intelligence mapping & Objective trajectories</p>
        </div>
        <div className="flex items-center gap-3 bg-secondary/30 p-2 rounded-2xl border border-border/50">
           {Object.keys(STATUS_COLORS).map(s => (
             <div key={s} className="flex items-center gap-2 px-3 py-1">
                <div className={cn("w-2 h-2 rounded-full", STATUS_COLORS[s].split(" ")[0])} />
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{s}</span>
             </div>
           ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-secondary/30 animate-pulse rounded-2xl" />)}
        </div>
      ) : timelineTasks.length === 0 ? (
        <div className="glass rounded-[3rem] p-24 text-center border-dashed border-2">
          <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-10" />
          <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-xs">No strategic trajectories projected</p>
        </div>
      ) : (
        <div className="glass rounded-[2.5rem] p-10 border border-white/5 shadow-2xl overflow-x-auto">
          <div className="space-y-6 min-w-[800px]">
            {timelineTasks.map((task, i) => {
              const start = differenceInDays(startOfDay(new Date(task.createdAt)), minDate);
              const end = differenceInDays(startOfDay(parseISO(task.dueDate)), minDate);
              const duration = Math.max(end - start, 1);
              const left = `${(start / totalRange) * 100}%`;
              const width = `${Math.min((duration / totalRange) * 100, 100 - (start / totalRange) * 100)}%`;
              const isOverdue = parseISO(task.dueDate) < now && task.status !== "completed";

              return (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-8 group"
                >
                  <div className="w-48 shrink-0 space-y-1">
                    <h4 className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">{task.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border", getPriorityColor(task.priority))}>
                        {task.priority}
                      </span>
                      <span className={cn("text-[9px] font-black uppercase tracking-widest", isOverdue ? "text-red-400" : "text-muted-foreground")}>
                        {format(parseISO(task.dueDate), "MMM dd")}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 relative h-10 bg-secondary/20 rounded-2xl border border-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width }}
                      transition={{ duration: 0.8, delay: i * 0.05 + 0.2 }}
                      style={{ left }}
                      className={cn(
                        "absolute top-1 bottom-1 rounded-xl flex items-center justify-center border transition-all shadow-lg shadow-black/20",
                        STATUS_COLORS[task.status] || STATUS_COLORS["pending"],
                        isOverdue && "ring-1 ring-red-500/50"
                      )}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                      <span className="text-[10px] font-black text-foreground z-10">{task.progress}%</span>
                    </motion.div>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-secondary/30 flex items-center justify-center shrink-0 border border-border group-hover:border-primary/20 transition-all cursor-help" title={`Operative: ${task.assignedTo?.name || "Unassigned"}`}>
                    <span className="text-xs font-black text-primary uppercase">{task.assignedTo?.name?.[0] || "?"}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Strategic Legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass p-8 rounded-3xl border-primary/10">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-4" />
            <h5 className="font-black text-xs uppercase tracking-widest text-foreground">Operational Safety</h5>
            <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">Trajectories are projected based on current intake and operative velocity. Monitor closely for slippage.</p>
          </div>
          <div className="glass p-8 rounded-3xl border-blue-400/10">
            <Target className="w-6 h-6 text-blue-400 mb-4" />
            <h5 className="font-black text-xs uppercase tracking-widest text-foreground">Mission Targeting</h5>
            <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">Deadlines are strictly locked. Resource allocation must match trajectory gradients.</p>
          </div>
          <div className="glass p-8 rounded-3xl border-yellow-400/10">
            <Zap className="w-6 h-6 text-yellow-400 mb-4" />
            <h5 className="font-black text-xs uppercase tracking-widest text-foreground">System Velocity</h5>
            <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">Real-time sync ensures operative data matches high-command projections instantaneously.</p>
          </div>
      </div>
    </div>
  );
}
