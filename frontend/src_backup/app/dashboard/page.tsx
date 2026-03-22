"use client";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  CheckSquare, Clock, AlertCircle, TrendingUp, Zap, Activity,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid,
} from "recharts";
import { useTaskStore } from "@/store/taskStore";
import { useAuthStore } from "@/store/authStore";
import { cn, getPriorityColor, getStatusColor, formatDate, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

const COLORS = ["#22c55e", "#3b82f6", "#a855f7", "#f59e0b"];
const TEAM_COLORS = ["#06b6d4", "#8b5cf6", "#f43f5e", "#10b981", "#f59e0b", "#3b82f6"];

// ── Animated Counter ──
function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    const start = ref.current;
    const duration = 800;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(start + (value - start) * eased);
      setDisplay(current);
      if (t < 1) requestAnimationFrame(tick);
      else ref.current = value;
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <>{display}</>;
}

const StatCard = ({ icon: Icon, label, value, sub, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.08, duration: 0.4 }}
    whileHover={{ y: -2, transition: { duration: 0.15 } }}
    className="glass rounded-xl p-5 flex items-start gap-4 hover:border-primary/30 transition-colors cursor-default"
  >
    <div className={cn("p-2.5 rounded-lg", color)}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-2xl font-bold text-foreground"><AnimatedCounter value={value} /></p>
      <p className="text-sm font-medium text-foreground">{label}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  </motion.div>
);

const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-secondary rounded-lg", className)} />
);

export default function DashboardPage() {
  const { tasks, fetchTasks, isLoading } = useTaskStore();
  const { user } = useAuthStore();

  useEffect(() => { fetchTasks(); }, []);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const todo = tasks.filter((t) => t.status === "Not Started").length;
  const overdue = tasks.filter(
    (t) => t.deadline && new Date(t.deadline) < new Date() && t.status !== "Completed"
  ).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const statusData = [
    { name: "Not Started", value: todo },
    { name: "In Progress", value: inProgress },
    { name: "Completed", value: completed },
  ];

  const priorityData = [
    { name: "High", value: tasks.filter((t) => t.priority === "High").length },
    { name: "Medium", value: tasks.filter((t) => t.priority === "Medium").length },
    { name: "Low", value: tasks.filter((t) => t.priority === "Low").length },
  ];

  // Activity data for 7 days
  const activityData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("en-US", { weekday: "short" });
    const created = tasks.filter((t) => new Date(t.createdAt).toDateString() === d.toDateString()).length;
    const done = tasks.filter(
      (t) => t.status === "Completed" && t.updatedAt && new Date(t.updatedAt).toDateString() === d.toDateString()
    ).length;
    return { day: label, created, completed: done };
  });

  // Team performance: tasks assigned per team (grouped by team field or assignee clusters)
  const teamPerf = (() => {
    const map = new Map<string, { total: number; done: number }>();
    tasks.forEach((t) => {
      const teamName = (t as any).team?.name || "Unassigned";
      const entry = map.get(teamName) || { total: 0, done: 0 };
      entry.total++;
      if (t.status === "Completed") entry.done++;
      map.set(teamName, entry);
    });
    return Array.from(map.entries()).map(([name, v]) => ({ name, total: v.total, completed: v.done }));
  })();

  // Activity timeline: sorted recent tasks
  const timeline = [...tasks]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 8)
    .map((t) => ({
      id: t._id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      time: formatRelativeTime(t.updatedAt || t.createdAt),
      creator: t.creator?.name || "Unknown",
      action: t.status === "Completed" ? "completed" : t.status === "In Progress" ? "started" : "created",
    }));

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 17) return "afternoon";
    return "evening";
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Good {greeting},{" "}
          <span className="gradient-text">{user?.name?.split(" ")[0]}</span> 👋
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your team today.
        </p>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard delay={0} icon={CheckSquare} label="Total Tasks" value={total} sub="All assigned tasks" color="bg-primary/10 text-primary" />
          <StatCard delay={1} icon={Zap} label="In Progress" value={inProgress} sub="Currently active" color="bg-blue-500/10 text-blue-400" />
          <StatCard delay={2} icon={TrendingUp} label="Completed" value={completed} sub={`${completionRate}% completion rate`} color="bg-emerald-500/10 text-emerald-400" />
          <StatCard delay={3} icon={AlertCircle} label="Overdue" value={overdue} sub="Needs attention" color="bg-red-500/10 text-red-400" />
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Task Activity (7 days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 18%)" />
              <XAxis dataKey="day" tick={{ fill: "hsl(0 0% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(0 0% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(220 13% 11%)", border: "1px solid hsl(220 13% 18%)", borderRadius: "8px", color: "hsl(0 0% 95%)" }} />
              <Area type="monotone" dataKey="created" name="Created" stroke="#22c55e" fill="url(#colorCreated)" strokeWidth={2} />
              <Area type="monotone" dataKey="completed" name="Done" stroke="#3b82f6" fill="url(#colorDone)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status Pie */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Task Status</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {statusData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(220 13% 11%)", border: "1px solid hsl(220 13% 18%)", borderRadius: "8px", color: "hsl(0 0% 95%)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {statusData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2: Team Perf + Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Team Performance</h3>
          {teamPerf.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={teamPerf}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 18%)" />
                <XAxis dataKey="name" tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(0 0% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(220 13% 11%)", border: "1px solid hsl(220 13% 18%)", borderRadius: "8px", color: "hsl(0 0% 95%)" }} />
                <Bar dataKey="total" name="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No team data yet</p>
          )}
        </motion.div>

        {/* Priority Breakdown */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Tasks by Priority</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={priorityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 18%)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "hsl(0 0% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "hsl(0 0% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(220 13% 11%)", border: "1px solid hsl(220 13% 18%)", borderRadius: "8px", color: "hsl(0 0% 95%)" }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {priorityData.map((_, i) => <Cell key={i} fill={["#ef4444", "#f59e0b", "#22c55e"][i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Activity Timeline + Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Timeline */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Activity Timeline</h3>
          </div>
          <div className="space-y-0">
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            ) : (
              timeline.map((item, i) => (
                <Link key={item.id} href={`/dashboard/tasks/${item.id}`}>
                  <div className="flex gap-3 py-2.5 hover:bg-secondary/50 rounded-lg px-2 transition-colors cursor-pointer group">
                    {/* Timeline dot + line */}
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full shrink-0 mt-1.5",
                        item.action === "completed" ? "bg-emerald-400" : item.action === "started" ? "bg-blue-400" : "bg-primary"
                      )} />
                      {i < timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <p className="text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        <span className="font-medium">{item.creator}</span>{" "}
                        <span className="text-muted-foreground">{item.action}</span>{" "}
                        <span className="font-medium">&quot;{item.title}&quot;</span>
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{item.time}</span>
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", getPriorityColor(item.priority))}>{item.priority}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Tasks */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Recent Tasks</h3>
            <Link href="/dashboard/tasks" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {isLoading
              ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12" />)
              : recentTasks.length === 0
              ? <p className="text-sm text-muted-foreground text-center py-4">No tasks yet.</p>
              : recentTasks.map((task) => (
                  <Link key={task._id} href={`/dashboard/tasks/${task._id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(task.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2 shrink-0">
                        <span className={cn("text-xs px-2 py-0.5 rounded border font-medium", getPriorityColor(task.priority))}>
                          {task.priority}
                        </span>
                        <span className={cn("text-xs px-2 py-0.5 rounded border font-medium", getStatusColor(task.status))}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
