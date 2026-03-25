"use client";

import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import { Activity, Clock3, TrendingUp, Users, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

interface AnalyticsTaskRow {
  id: string;
  title: string;
  status: string;
  priority: string;
  assigned_team: string | null;
  assigned_to: string | null;
  due_date: string | null;
}

interface AnalyticsTeamRow {
  id: string;
  name: string;
}

const STATUS_COLORS = ["#6366f1", "#22c55e", "#9ca3af"];

const normalizeStatus = (status: string): "completed" | "in-progress" | "pending" => {
  const value = (status || "").toLowerCase();
  if (value === "completed") return "completed";
  if (value === "in_progress" || value === "in-progress") return "in-progress";
  return "pending";
};

export default function AnalyticsPage() {
  const [tasks, setTasks] = useState<AnalyticsTaskRow[]>([]);
  const [teams, setTeams] = useState<AnalyticsTeamRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: taskRows, error: taskError } = await supabase
          .from("tasks")
          .select("id,title,status,priority,assigned_team,assigned_to,due_date")
          .order("created_at", { ascending: false });
        if (taskError) throw taskError;

        const { data: teamRows, error: teamError } = await supabase.from("teams").select("id,name");
        if (teamError) throw teamError;

        setTasks((taskRows || []) as AnalyticsTaskRow[]);
        setTeams((teamRows || []) as AnalyticsTeamRow[]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const completionRate = useMemo(() => {
    if (!tasks.length) return 0;
    const completed = tasks.filter((task) => normalizeStatus(task.status) === "completed").length;
    return Math.round((completed / tasks.length) * 100);
  }, [tasks]);

  const activeMembers = useMemo(() => {
    const members = new Set(tasks.map((task) => task.assigned_to).filter(Boolean));
    return members.size;
  }, [tasks]);

  const pendingCount = useMemo(
    () => tasks.filter((task) => normalizeStatus(task.status) !== "completed").length,
    [tasks]
  );

  const statusData = useMemo(() => {
    const completed = tasks.filter((task) => normalizeStatus(task.status) === "completed").length;
    const inProgress = tasks.filter((task) => normalizeStatus(task.status) === "in-progress").length;
    const pending = tasks.filter((task) => normalizeStatus(task.status) === "pending").length;
    return [
      { name: "In Progress", value: inProgress },
      { name: "Completed", value: completed },
      { name: "Not Started", value: pending },
    ];
  }, [tasks]);

  const teamPerformance = useMemo(() => {
    if (!teams.length) return [];
    return teams.map((team) => {
      const teamTasks = tasks.filter((task) => task.assigned_team === team.id);
      const completed = teamTasks.filter((task) => normalizeStatus(task.status) === "completed").length;
      return {
        name: team.name.replace(" Team", ""),
        completed,
        total: teamTasks.length,
      };
    });
  }, [tasks, teams]);

  const visibleTasks = useMemo(() => tasks.slice(0, 8), [tasks]);

  return (
    <div className="saas-page">
      <header className="saas-header">
        <div>
          <p className="saas-heading-eyebrow">Advanced Analytics</p>
          <h1 className="saas-heading-title">Analytics</h1>
          <p className="saas-heading-subtitle">Strategic analytics & performance metrics</p>
        </div>
        <div className="saas-pill-row">
          <button type="button" className="saas-btn-primary">Live Ops</button>
          <button type="button" className="saas-btn-secondary">Archive</button>
        </div>
      </header>

      <section className="saas-kpi-grid">
        <article className="saas-glass saas-kpi-card">
          <div className="saas-kpi-card-head">
            <span className="saas-kpi-icon" style={{ color: "#34d399" }}><TrendingUp size={16} /></span>
            <p className="saas-kpi-label">Completion Rate</p>
          </div>
          <p className="saas-kpi-value">{completionRate}%</p>
          <p className="saas-kpi-subtext">Overall task success</p>
        </article>
        <article className="saas-glass saas-kpi-card">
          <div className="saas-kpi-card-head">
            <span className="saas-kpi-icon"><Users size={16} /></span>
            <p className="saas-kpi-label">Active Members</p>
          </div>
          <p className="saas-kpi-value">{activeMembers}</p>
          <p className="saas-kpi-subtext">Across all squads</p>
        </article>
        <article className="saas-glass saas-kpi-card">
          <div className="saas-kpi-card-head">
            <span className="saas-kpi-icon" style={{ color: "#fbbf24" }}><Clock3 size={16} /></span>
            <p className="saas-kpi-label">Pending Tasks</p>
          </div>
          <p className="saas-kpi-value">{pendingCount}</p>
          <p className="saas-kpi-subtext">Requiring attention</p>
        </article>
        <article className="saas-glass saas-kpi-card">
          <div className="saas-kpi-card-head">
            <span className="saas-kpi-icon"><Zap size={16} /></span>
            <p className="saas-kpi-label">System Velocity</p>
          </div>
          <p className="saas-kpi-value">{tasks.length ? (tasks.length / Math.max(activeMembers, 1)).toFixed(1) : "0.0"}</p>
          <p className="saas-kpi-subtext">Tasks per member</p>
        </article>
      </section>

      <section className="saas-chart-grid">
        <article className="saas-glass saas-chart-card">
          <div className="saas-card-head">
            <div>
              <h3 className="saas-card-title">Task Status Distribution</h3>
              <p className="saas-card-sub">Real-time objective states</p>
            </div>
          </div>
          <div className="saas-chart-wrap">
            {loading ? (
              <p className="saas-empty">Loading chart data...</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={3}>
                    {statusData.map((_, index) => (
                      <Cell key={`status-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#161b2f",
                      border: "1px solid rgba(99,102,241,0.28)",
                      borderRadius: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="saas-pill-row">
            {statusData.map((status, index) => (
              <span key={status.name} className="saas-chip muted" style={{ display: "inline-flex", gap: "0.25rem" }}>
                <span style={{ width: "0.42rem", height: "0.42rem", borderRadius: "999px", background: STATUS_COLORS[index] }} />
                {status.name}
              </span>
            ))}
          </div>
        </article>

        <article className="saas-glass saas-chart-card">
          <div className="saas-card-head">
            <div>
              <h3 className="saas-card-title">Team Performance</h3>
              <p className="saas-card-sub">Efficiency vs objective volume</p>
            </div>
            <Activity size={16} style={{ color: "#34d399" }} />
          </div>
          <div className="saas-chart-wrap">
            {teamPerformance.length === 0 ? (
              <p className="saas-empty">No team data available yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "rgba(156,166,198,0.88)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(156,166,198,0.88)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#161b2f",
                      border: "1px solid rgba(99,102,241,0.28)",
                      borderRadius: "12px",
                    }}
                  />
                  <Bar dataKey="total" fill="rgba(99,102,241,0.25)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="completed" fill="#22c55e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>
      </section>

      <section className="saas-glass saas-table-card">
        <div className="saas-card-head">
          <div>
            <h3 className="saas-card-title">Task Breakdown</h3>
            <p className="saas-card-sub">Detailed task-level metrics</p>
          </div>
        </div>
        <div className="saas-table-wrap">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Team</th>
                <th>Priority</th>
                <th>Deadline</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleTasks.map((task) => {
                const normalized = normalizeStatus(task.status);
                return (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td className="muted">{teams.find((team) => team.id === task.assigned_team)?.name || "—"}</td>
                    <td>
                      <span className={`saas-chip ${task.priority === "critical" ? "danger" : task.priority === "high" ? "warning" : "muted"}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="muted">{task.due_date ? formatDate(task.due_date) : "No deadline"}</td>
                    <td>
                      <span className={`saas-chip ${normalized === "completed" ? "success" : normalized === "in-progress" ? "primary" : "muted"}`}>
                        {normalized === "in-progress" ? "In Progress" : normalized === "completed" ? "Completed" : "Not Started"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
