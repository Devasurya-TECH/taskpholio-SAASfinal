"use client";
import { useEffect, useMemo, useState } from "react";
import { Plus, Activity, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { useAuthStore } from "@/store/authStore";
import { isAdmin } from "@/lib/utils";
import { format, subDays } from "date-fns";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import KpiCard from "@/components/dashboard/KpiCard";
import AnalyticsPanel from "@/components/dashboard/AnalyticsPanel";
import ActivityTable from "@/components/dashboard/ActivityTable";
import ActionPanel from "@/components/dashboard/ActionPanel";
import "./dashboard.css";

export default function DashboardPage() {
  const { tasks, fetchTasks } = useTaskStore();
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTasks(true);
  }, [fetchTasks]);

  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === "completed").length;
    const inProgress = tasks.filter((task) => task.status === "in-progress").length;
    const pending = tasks.filter((task) => task.status === "pending").length;
    const blocked = tasks.filter((task) => task.status === "blocked").length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, pending, blocked, completionRate };
  }, [tasks]);

  const trendData = useMemo(() => {
    const points = Array.from({ length: 7 }, (_, index) => {
      const date = subDays(new Date(), 6 - index);
      const key = date.toISOString().slice(0, 10);
      return {
        key,
        day: format(date, "EEE"),
        created: 0,
        completed: 0,
      };
    });

    const pointMap = new Map(points.map((point) => [point.key, point]));
    tasks.forEach((task) => {
      const createdKey = new Date(task.createdAt).toISOString().slice(0, 10);
      if (pointMap.has(createdKey)) pointMap.get(createdKey)!.created += 1;
      if (task.status === "completed") {
        const completedKey = new Date(task.updatedAt || task.createdAt).toISOString().slice(0, 10);
        if (pointMap.has(completedKey)) pointMap.get(completedKey)!.completed += 1;
      }
    });

    return points;
  }, [tasks]);

  const throughputData = useMemo(() => {
    let cumulative = 0;
    return trendData.map((point) => {
      cumulative += point.created;
      return {
        day: point.day,
        throughput: cumulative,
        completionPulse: point.completed,
      };
    });
  }, [trendData]);

  return (
    <div className="premium-dashboard-shell">
      <div className="ambient-glow ambient-glow-a" />
      <div className="ambient-glow ambient-glow-b" />
      <div className="noise-layer" />

      <div className="premium-dashboard-content">
        <div className="dashboard-hero">
          <div>
            <p className="hero-eyebrow">Realtime Command Center</p>
            <h1 className="hero-title">
              Welcome back, <span>{user?.name?.split(" ")[0] || "Operator"}</span>
            </h1>
            <p className="hero-subtitle">
              Premium task intelligence with team-wide execution visibility and status telemetry.
            </p>
          </div>
          {isAdmin(user?.role || "") && (
            <button onClick={() => setIsModalOpen(true)} className="hero-cta">
              <Plus size={16} /> Create Task
            </button>
          )}
        </div>

        <section className="kpi-grid-premium">
          <KpiCard
            label="TOTAL TASKS"
            value={metrics.total.toString()}
            description="Live objectives tracked"
            icon={<Activity size={18} />}
          />
          <KpiCard
            label="COMPLETION RATE"
            value={`${metrics.completionRate}%`}
            description="Operational success ratio"
            icon={<TrendingUp size={18} />}
          />
          <KpiCard
            label="IN PROGRESS"
            value={metrics.inProgress.toString()}
            description="Actively being executed"
            icon={<Clock size={18} />}
          />
          <KpiCard
            label="COMPLETED"
            value={metrics.completed.toString()}
            description="Resolved outcomes"
            icon={<CheckCircle2 size={18} />}
          />
        </section>

        <section className="analytics-grid-premium">
          <AnalyticsPanel
            title="Task Flow (7D)"
            subtitle="Created vs completed momentum"
            data={trendData}
            xKey="day"
            lineKey="created"
            areaKey="completed"
            mode="line"
          />
          <AnalyticsPanel
            title="Throughput Curve"
            subtitle="Cumulative workload with completion pulses"
            data={throughputData}
            xKey="day"
            lineKey="throughput"
            areaKey="completionPulse"
            mode="area"
          />
        </section>

        <section className="content-grid-premium">
          <ActivityTable tasks={tasks} />
          <ActionPanel completed={metrics.completed} inProgress={metrics.inProgress} pending={metrics.pending + metrics.blocked} />
        </section>
      </div>

      {isModalOpen && <CreateTaskModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
