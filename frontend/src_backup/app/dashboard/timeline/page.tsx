"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTaskStore } from "@/store/taskStore";
import { Task } from "@/lib/types";
import { cn, getPriorityColor, formatDate } from "@/lib/utils";
import { differenceInDays, parseISO, format, isValid } from "date-fns";

const STATUS_COLORS: Record<Task["status"], string> = {
  "Not Started": "bg-muted-foreground/20",
  "In Progress": "bg-blue-500/60",
  Completed: "bg-primary/70",
};

export default function TimelinePage() {
  const { tasks, fetchTasks, isLoading } = useTaskStore();

  useEffect(() => { fetchTasks(); }, []);

  const tasksWithDeadline = tasks.filter((t) => t.deadline && isValid(parseISO(t.deadline)));
  const sorted = [...tasksWithDeadline].sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const now = new Date();
  const minDate = sorted.length > 0 ? new Date(sorted[0].createdAt) : now;
  const totalRange = Math.max(
    ...sorted.map((t) => differenceInDays(parseISO(t.deadline!), minDate)),
    30
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Timeline</h2>
        <p className="text-sm text-muted-foreground">Gantt-style view of task deadlines and durations</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="animate-pulse bg-secondary rounded-xl h-14" />)}
        </div>
      ) : sorted.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-muted-foreground text-sm">
          No tasks with deadlines yet. Add a deadline to tasks to see them here.
        </div>
      ) : (
        <div className="glass rounded-2xl p-6 overflow-x-auto">
          {/* Legend */}
          <div className="flex items-center gap-4 mb-6 text-xs text-muted-foreground">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded-sm", color)} />
                {status}
              </div>
            ))}
          </div>

          <div className="space-y-3 min-w-[600px]">
            {sorted.map((task, i) => {
              const start = differenceInDays(new Date(task.createdAt), minDate);
              const end = differenceInDays(parseISO(task.deadline!), minDate);
              const duration = Math.max(end - start, 1);
              const left = `${(start / totalRange) * 100}%`;
              const width = `${Math.min((duration / totalRange) * 100, 100 - (start / totalRange) * 100)}%`;
              const isOverdue = parseISO(task.deadline!) < now && task.status !== "Completed";

              return (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-40 shrink-0">
                    <p className="text-xs font-medium text-foreground truncate">{task.title}</p>
                    <p className={cn("text-[10px]", isOverdue ? "text-red-400" : "text-muted-foreground")}>
                      {isOverdue ? "Overdue · " : ""}{formatDate(task.deadline!)}
                    </p>
                  </div>
                  <div className="flex-1 relative h-8 bg-secondary rounded-lg overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width }}
                      transition={{ duration: 0.6, delay: i * 0.04 }}
                      style={{ left }}
                      className={cn(
                        "absolute top-1 bottom-1 rounded-md flex items-center px-2",
                        STATUS_COLORS[task.status],
                        isOverdue && task.status !== "Completed" && "ring-1 ring-red-400"
                      )}
                    >
                      <span className="text-[10px] font-medium text-foreground whitespace-nowrap truncate">{task.progress}%</span>
                    </motion.div>
                  </div>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium shrink-0", getPriorityColor(task.priority))}>
                    {task.priority}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
