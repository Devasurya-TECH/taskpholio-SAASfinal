"use client";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, Users, Target, Zap, 
  BarChart3, PieChart as PieIcon, Activity,
  Calendar, CheckCircle2, AlertCircle
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, Legend
} from "recharts";
import api from "@/lib/api";
import { Task, Team } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const COLORS = ["#3b82f6", "#22c55e", "#a855f7", "#f59e0b", "#ef4444"];

const StatCard = ({ label, value, sub, icon: Icon, color }: any) => (
  <motion.div whileHover={{ y: -5 }} className="glass rounded-[2rem] p-8 border border-white/5 shadow-2xl space-y-4">
    <div className={cn("p-4 rounded-2xl w-fit", color)}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="text-4xl font-black text-foreground tracking-tight mt-1">{value}</p>
      <p className="text-xs text-muted-foreground mt-2 font-medium">{sub}</p>
    </div>
  </motion.div>
);

export default function AnalyticsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("tasks"), api.get("teams")])
      .then(([tasksRes, teamsRes]) => {
        setTasks(tasksRes.data.data.tasks || []);
        setTeams(teamsRes.data.data.teams || []);
      })
      .catch(() => toast.error("Failed to sync intelligence data"))
      .finally(() => setLoading(false));
  }, []);

  const taskStats = useMemo(() => {
    const statusData = [
      { name: "Completed", value: tasks.filter(t => t.status === "completed").length },
      { name: "In Progress", value: tasks.filter(t => t.status === "in-progress").length },
      { name: "Pending", value: tasks.filter(t => t.status === "pending").length },
    ].filter(d => d.value > 0);

    const priorityData = [
      { name: "Urgent", value: tasks.filter(t => t.priority === "urgent").length },
      { name: "High", value: tasks.filter(t => t.priority === "high").length },
      { name: "Medium", value: tasks.filter(t => t.priority === "medium").length },
      { name: "Low", value: tasks.filter(t => t.priority === "low").length },
    ].filter(d => d.value > 0);

    return { statusData, priorityData };
  }, [tasks]);

  const teamPerformance = useMemo(() => {
    return teams.map(t => ({
      name: t.name,
      completed: t.stats?.completedTasks || 0,
      total: t.stats?.totalTasks || 0,
      efficiency: t.stats?.totalTasks ? Math.round((t.stats.completedTasks / t.stats.totalTasks) * 100) : 0
    }));
  }, [teams]);

  if (loading) return (
    <div className="space-y-8 animate-pulse p-8">
      <div className="h-12 w-64 bg-secondary rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-secondary rounded-[2rem]" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-96 bg-secondary rounded-[2rem]" />
        <div className="h-96 bg-secondary rounded-[2rem]" />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Intelligence Dashboard</h1>
          <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px] mt-2">Strategic Analytics & Performance Metrics</p>
        </div>
        <div className="flex items-center gap-4 bg-secondary/30 border border-border/50 p-2 rounded-2xl">
          <button className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">LIVE OPS</button>
          <button className="px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">ARCHIVE</button>
        </div>
      </div>

      {/* High Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        <StatCard label="Operational Completion" value={`${Math.round((tasks.filter(t => t.status === "completed").length / (tasks.length || 1)) * 100)}%`} sub="Overall Mission Success Rate" icon={TrendingUp} color="bg-emerald-500/10 text-emerald-400" />
        <StatCard label="Active Personnel" value={teams.reduce((acc, t) => acc + t.members.length, 0)} sub="Across All Tactical Squads" icon={Users} color="bg-blue-500/10 text-blue-400" />
        <StatCard label="Pending Objectives" value={tasks.filter(t => t.status !== "completed").length} sub="Requiring Immediate Intelligence" icon={Target} color="bg-purple-500/10 text-purple-400" />
        <StatCard label="System Velocity" value="8.4" sub="Tasks Resolved Per Operative" icon={Zap} color="bg-yellow-500/10 text-yellow-400" />
      </div>

      {/* Strategic Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h3 className="font-black text-xl text-foreground">Mission Status Distribution</h3>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Real-time objective states</p>
            </div>
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={taskStats.statusData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                  {taskStats.statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1e1e2e", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                  itemStyle={{ color: "#fff", fontWeight: "bold" }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Squad Comparison */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h3 className="font-black text-xl text-foreground">Tactical Squad Performance</h3>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Efficiency vs Objective Volume</p>
            </div>
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamPerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }} />
                <Tooltip 
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  contentStyle={{ backgroundColor: "#1e1e2e", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                />
                <Bar dataKey="completed" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Completed" />
                <Bar dataKey="total" fill="rgba(59, 130, 246, 0.2)" radius={[6, 6, 0, 0]} name="Total Capacity" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Priority Intelligence */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-red-500/10 rounded-2xl">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="font-black text-2xl text-foreground">Threat Level Analytics</h3>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Objective priority distribution across the operation</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {taskStats.priorityData.map((item, idx) => (
             <div key={idx} className="bg-secondary/20 p-6 rounded-3xl border border-border/50 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.name}</p>
                   <p className="text-2xl font-black text-foreground">{item.value}</p>
                </div>
                <div className={cn("w-2 h-12 rounded-full", 
                  item.name === "Urgent" ? "bg-red-500" : item.name === "High" ? "bg-orange-500" : item.name === "Medium" ? "bg-yellow-500" : "bg-emerald-500"
                )} />
             </div>
           ))}
        </div>
      </motion.div>
    </div>
  );
}
