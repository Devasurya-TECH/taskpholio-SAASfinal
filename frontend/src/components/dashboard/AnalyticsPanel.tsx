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
    <div className="premium-glass analytics-panel">
      <div className="panel-head">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          {mode === "area" ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="kpiAreaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(34,197,94,0.65)" />
                  <stop offset="100%" stopColor="rgba(34,197,94,0.02)" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <XAxis dataKey={xKey} stroke="rgba(229,231,235,0.6)" tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(229,231,235,0.6)" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#0b1014", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "14px" }} />
              <Area type="monotone" dataKey={areaKey || lineKey} stroke="#22C55E" fill="url(#kpiAreaFill)" strokeWidth={2.5} />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <XAxis dataKey={xKey} stroke="rgba(229,231,235,0.6)" tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(229,231,235,0.6)" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#0b1014", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "14px" }} />
              <Line
                type="monotone"
                dataKey={lineKey}
                stroke="#22C55E"
                strokeWidth={2.8}
                dot={{ r: 3, fill: "#22C55E", stroke: "rgba(34,197,94,0.25)", strokeWidth: 6 }}
                activeDot={{ r: 5, fill: "#10B981" }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
