"use client";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface ActionPanelProps {
  completed: number;
  inProgress: number;
  pending: number;
  showTeamWorkspace?: boolean;
  upcomingMeetings?: Array<{
    id: string;
    title: string;
    scheduledAt: string;
    attendees?: number;
  }>;
}

export default function ActionPanel({
  completed,
  inProgress,
  pending,
  showTeamWorkspace = false,
  upcomingMeetings = [],
}: ActionPanelProps) {
  return (
    <div className="saas-side-stack">
      <div className="saas-glass saas-side-card">
        <div className="saas-card-head">
          <div>
            <h3 className="saas-card-title">Upcoming Meetings</h3>
            <p className="saas-card-sub">Next team briefings</p>
          </div>
        </div>

        <div className="saas-list">
          {upcomingMeetings.length > 0 ? (
            upcomingMeetings.slice(0, 2).map((meeting) => (
              <div key={meeting.id} className="saas-list-item">
                <p className="saas-list-title">{meeting.title}</p>
                <span className="saas-list-meta">
                  {format(new Date(meeting.scheduledAt), "MMM dd, hh:mm a")} • {meeting.attendees || 0} attendees
                </span>
              </div>
            ))
          ) : (
            <p className="saas-empty">No meetings scheduled.</p>
          )}
        </div>
      </div>

      <div className="saas-glass saas-side-card">
        <div className="saas-card-head">
          <div>
            <h3 className="saas-card-title">Quick Actions</h3>
            <p className="saas-card-sub">Operational shortcuts</p>
          </div>
        </div>

        <motion.div whileHover={{ y: -3 }} className="saas-quick-link" style={{ marginTop: "0.8rem" }}>
          <div>
            <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#e7e9ff" }}>Automation Ready</p>
            <span style={{ fontSize: "0.68rem", color: "rgba(160,168,198,0.9)" }}>
              Realtime analytics & routing active
            </span>
          </div>
          <Sparkles size={15} />
        </motion.div>

        <div style={{ marginTop: "0.62rem" }}>
          <Link href="/dashboard/tasks" className="saas-quick-link">
            View all tasks <ArrowRight size={14} />
          </Link>
        </div>

        <div className="saas-pending-stats" style={{ marginTop: "0.66rem" }}>
          <div className="saas-glass saas-stat-card">
            <span className="saas-stat-label">Completed</span>
            <strong className="saas-stat-value" style={{ fontSize: "1.2rem" }}>{completed}</strong>
          </div>
          <div className="saas-glass saas-stat-card">
            <span className="saas-stat-label">In Progress</span>
            <strong className="saas-stat-value" style={{ fontSize: "1.2rem" }}>{inProgress}</strong>
          </div>
          <div className="saas-glass saas-stat-card">
            <span className="saas-stat-label">Pending</span>
            <strong className="saas-stat-value" style={{ fontSize: "1.2rem" }}>{pending}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
