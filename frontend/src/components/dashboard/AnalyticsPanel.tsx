"use client";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface AnalyticsPanelProps {
  title: string;
  subtitle: string;
  data: Array<Record<string, string | number>>;
  xKey: string;
  lineKey: string;
  areaKey?: string;
  mode?: "line" | "area";
}

export default function AnalyticsPanel({
  title,
  subtitle,
  data,
  xKey,
  lineKey,
  areaKey,
  mode = "line",
}: AnalyticsPanelProps) {
  return (
    <div className="saas-glass saas-chart-card">
      <div className="saas-card-head">
        <div>
          <h3 className="saas-card-title">{title}</h3>
          <p className="saas-card-sub">{subtitle}</p>
        </div>
        <span className="saas-card-side-label">{mode === "area" ? "cumulative" : "created vs completed"}</span>
      </div>
      <div className="saas-chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          {mode === "area" ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="kpiAreaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(99,102,241,0.48)" />
                  <stop offset="100%" stopColor="rgba(99,102,241,0.03)" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <XAxis dataKey={xKey} stroke="rgba(229,231,235,0.6)" tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(229,231,235,0.6)" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#161b2f", border: "1px solid rgba(99,102,241,0.28)", borderRadius: "12px" }} />
              <Area type="monotone" dataKey={areaKey || lineKey} stroke="#6366f1" fill="url(#kpiAreaFill)" strokeWidth={2.4} />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <XAxis dataKey={xKey} stroke="rgba(229,231,235,0.6)" tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(229,231,235,0.6)" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#161b2f", border: "1px solid rgba(99,102,241,0.28)", borderRadius: "12px" }} />
              <Line
                type="monotone"
                dataKey={lineKey}
                stroke="#6366f1"
                strokeWidth={2.7}
                dot={{ r: 2.5, fill: "#6366f1", stroke: "rgba(99,102,241,0.22)", strokeWidth: 5 }}
                activeDot={{ r: 4, fill: "#818cf8" }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
