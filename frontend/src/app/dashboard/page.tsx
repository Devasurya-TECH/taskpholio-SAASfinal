"use client";
import { useEffect, useMemo, useState } from "react";
import { Plus, Activity, CheckCircle2, Clock3, TrendingUp } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { useAuthStore } from "@/store/authStore";
import { isAdmin } from "@/lib/utils";
import { format, subDays } from "date-fns";
import { supabase } from "@/lib/supabase";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import KpiCard from "@/components/dashboard/KpiCard";
import AnalyticsPanel from "@/components/dashboard/AnalyticsPanel";
import ActivityTable from "@/components/dashboard/ActivityTable";
import ActionPanel from "@/components/dashboard/ActionPanel";

const COMPLETED_VISIBILITY_DAYS = 7;
const COMPLETED_VISIBILITY_MS = COMPLETED_VISIBILITY_DAYS * 24 * 60 * 60 * 1000;

const parseTaskDate = (value?: string): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getGreeting = (name: string) => {
  const hour = new Date().getHours();
  const label = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return `${label}, ${name}`;
};

export default function DashboardPage() {
  const { tasks, fetchTasks } = useTaskStore();
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upcomingMeetings, setUpcomingMeetings] = useState<
    Array<{ id: string; title: string; scheduledAt: string; attendees?: number }>
  >([]);

  useEffect(() => {
    fetchTasks(true);
  }, [fetchTasks]);

  useEffect(() => {
    const fetchMeetings = async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("id,title,scheduled_at")
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true })
        .limit(5);

      if (error) return;

      setUpcomingMeetings(
        (data || []).map((meeting: any) => ({
          id: meeting.id,
          title: meeting.title,
          scheduledAt: meeting.scheduled_at,
          attendees: 0,
        }))
      );
    };

    fetchMeetings();
  }, []);

  const dashboardTasks = useMemo(() => {
    const now = Date.now();
    return tasks.filter((task) => {
      if (task.status !== "completed") return true;
      const completedAt = parseTaskDate(task.completedAt || task.updatedAt || task.createdAt);
      if (!completedAt) return false;
      return now - completedAt.getTime() <= COMPLETED_VISIBILITY_MS;
    });
  }, [tasks]);

  const metrics = useMemo(() => {
    const total = dashboardTasks.length;
    const completed = dashboardTasks.filter((task) => task.status === "completed").length;
    const inProgress = dashboardTasks.filter((task) => task.status === "in-progress").length;
    const pending = dashboardTasks.filter((task) => task.status === "pending").length;
    const blocked = dashboardTasks.filter((task) => task.status === "blocked").length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, pending, blocked, completionRate };
  }, [dashboardTasks]);

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
    dashboardTasks.forEach((task) => {
      const createdKey = new Date(task.createdAt).toISOString().slice(0, 10);
      if (pointMap.has(createdKey)) pointMap.get(createdKey)!.created += 1;
      if (task.status === "completed") {
        const completedKey = new Date(task.completedAt || task.updatedAt || task.createdAt).toISOString().slice(0, 10);
        if (pointMap.has(completedKey)) pointMap.get(completedKey)!.completed += 1;
      }
    });

    return points;
  }, [dashboardTasks]);

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
    <div className="saas-page">
      <header className="saas-header">
        <div>
          <p className="saas-heading-eyebrow">Overview</p>
          <h1 className="saas-heading-title">{getGreeting(user?.name?.split(" ")[0] || "Operator")}</h1>
          <p className="saas-heading-subtitle">
            Premium task intelligence with team-wide execution visibility and status telemetry.
          </p>
        </div>
        {isAdmin(user?.role || "") && (
          <button onClick={() => setIsModalOpen(true)} className="saas-btn-primary">
            <Plus size={15} /> Create Task
          </button>
        )}
      </header>

      <section className="saas-kpi-grid">
        <KpiCard
          label="TOTAL TASKS"
          value={metrics.total.toString()}
          description="Live objectives tracked"
          icon={<Activity size={16} />}
        />
        <KpiCard
          label="COMPLETION RATE"
          value={`${metrics.completionRate}%`}
          description="Overall success ratio"
          icon={<TrendingUp size={16} />}
        />
        <KpiCard
          label="IN PROGRESS"
          value={metrics.inProgress.toString()}
          description="Actively being executed"
          icon={<Clock3 size={16} />}
        />
        <KpiCard
          label="COMPLETED"
          value={metrics.completed.toString()}
          description="Resolved outcomes"
          icon={<CheckCircle2 size={16} />}
        />
      </section>

      <section className="saas-chart-grid">
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

      <section className="saas-split-grid">
        <ActivityTable tasks={dashboardTasks} />
        <ActionPanel
          completed={metrics.completed}
          inProgress={metrics.inProgress}
          pending={metrics.pending + metrics.blocked}
          showTeamWorkspace={isAdmin(user?.role || "")}
          upcomingMeetings={upcomingMeetings}
        />
      </section>

      {isModalOpen && <CreateTaskModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
