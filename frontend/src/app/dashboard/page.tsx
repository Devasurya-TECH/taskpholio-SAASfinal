"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare, Clock, AlertCircle, TrendingUp, Zap, Activity,
  Search, Filter, LayoutGrid, List, Plus, MoreHorizontal,
  ChevronRight, Calendar, Users
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid,
} from "recharts";
import { useTaskStore } from "@/store/taskStore";
import { useAuthStore } from "@/store/authStore";
import { cn, getPriorityColor, getStatusColor, formatDate, formatRelativeTime, isAdmin } from "@/lib/utils";
import Link from "next/link";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import TaskCard from "@/components/tasks/TaskCard";

const COLORS = ["#22c55e", "#3b82f6", "#a855f7", "#f59e0b"];

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
    transition={{ delay: delay * 0.1, duration: 0.5 }}
    className="glass rounded-2xl p-5 flex items-start gap-4 min-w-[240px] md:min-w-0 flex-1 hover:border-primary/30 transition-all group cursor-default"
  >
    <div className={cn("p-3 rounded-xl transition-transform group-hover:scale-110", color)}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-3xl font-bold text-foreground tracking-tight"><AnimatedCounter value={value} /></p>
      <p className="text-sm font-semibold text-foreground/80">{label}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1 opacity-70">{sub}</p>}
    </div>
  </motion.div>
);

const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-secondary/50 rounded-xl", className)} />
);

export default function DashboardPage() {
  const { tasks, fetchTasks, isLoading } = useTaskStore();
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { fetchTasks(); }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const overdue = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "completed"
    ).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, overdue, rate };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "all" || t.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [tasks, search, filter]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl md:text-4xl font-black text-foreground tracking-tight"
          >
            {greeting},{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-blue-400 animate-gradient">
              {user?.name?.split(" ")[0]}
            </span> 👋
          </motion.h1>
          <p className="text-muted-foreground mt-2 font-medium">
            You have <span className="text-foreground">{stats.inProgress} active tasks</span> representing {stats.rate}% overall completion.
          </p>
        </div>
        {isAdmin(user?.role || "") && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Create New Task
          </motion.button>
        )}
      </div>

      {/* Stats - Responsive Scroll */}
      <div className="flex overflow-x-auto pb-4 md:pb-0 md:grid md:grid-cols-4 gap-4 scrollbar-hide">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 min-w-[240px] md:min-w-0" />)
        ) : (
          <>
            <StatCard delay={0} icon={CheckSquare} label="Total Tasks" value={stats.total} sub="Assigned to your teams" color="bg-primary/10 text-primary" />
            <StatCard delay={1} icon={Zap} label="In Progress" value={stats.inProgress} sub="Currently active" color="bg-blue-500/10 text-blue-400" />
            <StatCard delay={2} icon={TrendingUp} label="Completion" value={stats.rate} sub="Across all projects" color="bg-emerald-500/10 text-emerald-400" />
            <StatCard delay={3} icon={AlertCircle} label="Overdue" value={stats.overdue} sub="Needs immediate action" color="bg-red-500/10 text-red-500" />
          </>
        )}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          {/* Advanced Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks, descriptions, or tags..."
                className="w-full bg-secondary/50 border border-border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">All Status</option>
                <option value="pending">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <div className="bg-secondary/50 border border-border rounded-xl p-1 flex">
                <button 
                  onClick={() => setView("grid")}
                  className={cn("p-2 rounded-lg transition-all", view === "grid" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setView("list")}
                  className={cn("p-2 rounded-lg transition-all", view === "list" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Tasks Display */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("grid gap-4", view === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
                {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-48" />)}
              </motion.div>
            ) : filteredTasks.length > 0 ? (
              <motion.div 
                key={view} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn("grid gap-4", view === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}
              >
                {filteredTasks.map((task) => (
                  <TaskCard key={task._id} task={task} view={view} />
                ))}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 glass rounded-2xl border-dashed border-2">
                <p className="text-muted-foreground font-medium">No tasks found matching your criteria</p>
                <button onClick={() => { setSearch(""); setFilter("all"); }} className="text-primary text-sm mt-2 hover:underline">Clear all filters</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* Progress Widget */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" /> Weekly Progress
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-400/20 border-t-emerald-400 flex items-center justify-center font-bold">
                    {stats.rate}%
                  </div>
                  <div>
                    <p className="font-bold">Team Productivity</p>
                    <p className="text-xs text-muted-foreground">+5% from last week</p>
                  </div>
                </div>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${stats.rate}%` }} 
                  className="h-full bg-emerald-400" 
                />
              </div>
            </div>
          </motion.div>

          {/* Activity Widget */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Recent Activity
            </h3>
            <div className="space-y-4">
              {tasks.slice(0, 5).map((task, i) => (
                <div key={task._id} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    {i < 4 && <div className="w-px flex-1 bg-border my-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors cursor-pointer">
                      {task.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{formatRelativeTime(task.updatedAt || task.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {isModalOpen && <CreateTaskModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
