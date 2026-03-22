"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { AlertTriangle, CheckCircle, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/analytics")
      .then((res) => {
        setData(res.data.data);
      })
      .catch((err) => console.error("Analytics fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-secondary rounded-lg mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-secondary rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-secondary rounded-2xl" />
      </div>
    );
  }

  if (!data) return <div className="text-muted-foreground p-8">Failed to load analytics data.</div>;

  const totalCompleted = data.completionTrends.reduce((sum: number, item: any) => sum + item.completedTasks, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Advanced Analytics</h2>
        <p className="text-sm text-muted-foreground">Insights and team performance metrics</p>
      </div>

      {/* Top Value Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-xl text-red-500"><AlertTriangle className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Overdue Tasks</p>
            <h3 className="text-2xl font-bold text-foreground">{data.overdueTasks}</h3>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><CheckCircle className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Completed (30d)</p>
            <h3 className="text-2xl font-bold text-foreground">{totalCompleted}</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary"><Users className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Teams Tracked</p>
            <h3 className="text-2xl font-bold text-foreground">{data.teamMetrics.length}</h3>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Trends Chart */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-6 h-[400px] flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Completion Trends</h3>
          </div>
          <div className="flex-1 min-h-[300px]">
            {data.completionTrends.length === 0 ? (
               <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No task completions in the last 30 days.</div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.completionTrends} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="_id" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "hsl(var(--background))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                      itemStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Area type="monotone" dataKey="completedTasks" name="Completed" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCompleted)" />
                  </AreaChart>
                </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Team Performance Bar Chart */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 h-[400px] flex flex-col">
           <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-semibold text-foreground">Team Completion Rates</h3>
          </div>
          <div className="flex-1 min-h-[300px]">
             {data.teamMetrics.length === 0 ? (
               <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No team metrics available.</div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.teamMetrics} margin={{ top: 5, right: 0, left: -20, bottom: 0 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="teamName" tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} width={120} axisLine={false} tickLine={false} />
                    <Tooltip 
                      formatter={(value: any) => [`${Math.round(Number(value))}%`, 'Completion Rate']}
                      contentStyle={{ backgroundColor: "hsl(var(--background))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                      itemStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Bar dataKey="completionRate" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
