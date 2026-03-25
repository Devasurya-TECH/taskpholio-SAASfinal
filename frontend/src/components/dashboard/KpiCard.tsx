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
      className="saas-glass saas-kpi-card"
    >
      <div className="saas-kpi-card-head">
        <div className="saas-kpi-icon">{icon}</div>
        <p className="saas-kpi-label">{label}</p>
      </div>
      <p className="saas-kpi-value">{value}</p>
      <p className="saas-kpi-subtext">{description}</p>
    </motion.div>
  );
}
