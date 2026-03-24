"use client";
import { motion } from "framer-motion";

interface KpiCardProps {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

export default function KpiCard({ label, value, description, icon }: KpiCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="premium-glass kpi-card"
    >
      <div className="kpi-icon-wrap">{icon}</div>
      <p className="kpi-label">{label}</p>
      <p className="kpi-value">{value}</p>
      <p className="kpi-description">{description}</p>
    </motion.div>
  );
}
