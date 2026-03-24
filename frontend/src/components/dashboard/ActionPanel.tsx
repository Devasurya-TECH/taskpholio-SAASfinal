"use client";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface ActionPanelProps {
  completed: number;
  inProgress: number;
  pending: number;
}

export default function ActionPanel({ completed, inProgress, pending }: ActionPanelProps) {
  return (
    <div className="premium-glass action-panel">
      <div className="panel-head">
        <h3>Command Actions</h3>
        <p>Operational controls and quick links</p>
      </div>

      <motion.div whileHover={{ y: -4 }} className="action-hero">
        <Sparkles size={18} />
        <div>
          <p>Automation Ready</p>
          <span>Realtime analytics and routing active</span>
        </div>
      </motion.div>

      <div className="action-buttons">
        <Link href="/dashboard/tasks" className="action-btn">
          Open Task Board <ArrowUpRight size={14} />
        </Link>
        <Link href="/dashboard/teams" className="action-btn secondary">
          Team Workspace <ShieldCheck size={14} />
        </Link>
      </div>

      <div className="action-stats">
        <div>
          <span>Completed</span>
          <strong>{completed}</strong>
        </div>
        <div>
          <span>In Progress</span>
          <strong>{inProgress}</strong>
        </div>
        <div>
          <span>Pending</span>
          <strong>{pending}</strong>
        </div>
      </div>
    </div>
  );
}
