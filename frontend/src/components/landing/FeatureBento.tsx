"use client";
import React from "react";
import { motion } from "framer-motion";
import { Users, BarChart3, CheckSquare, CalendarDays, Bell } from "lucide-react";

const features = [
  {
    title: "Team Command",
    description: "Organize Technical, Social Media, and Cybersecurity teams with clear ownership.",
    icon: <Users className="w-6 h-6 text-indigo-300" />,
    className: "md:col-span-2",
  },
  {
    title: "Analytics",
    description: "Visualize delivery performance and completion trends across teams.",
    icon: <BarChart3 className="w-6 h-6 text-indigo-300" />,
    className: "md:col-span-1",
  },
  {
    title: "Task Workflows",
    description: "Track Pending, In Progress, and Completed statuses in real time.",
    icon: <CheckSquare className="w-6 h-6 text-indigo-300" />,
    className: "md:col-span-1",
  },
  {
    title: "Meetings & Alerts",
    description: "Plan meetings and notify everyone instantly on task and schedule updates.",
    icon: <CalendarDays className="w-6 h-6 text-indigo-300" />,
    className: "md:col-span-2",
  },
];

export default function FeatureBento() {
  return (
    <div className="py-32 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">
          Built for <span className="text-primary">Modern Operations</span>
        </h2>
        <p className="text-lg text-muted-foreground font-medium leading-relaxed">
          A clean startup-grade UI for teams to plan, assign, and execute work with clarity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className={`group relative overflow-hidden rounded-[2rem] glass p-8 border border-[#2a2a35] hover:border-primary/35 transition-all duration-300 ${feature.className}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 flex flex-col h-full justify-between gap-8">
              <div className="w-14 h-14 rounded-2xl bg-[#1a1a24] border border-[#2a2a35] flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                {feature.icon}
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-white tracking-tight">{feature.title}</h3>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-md">
                  {feature.description}
                </p>
              </div>
            </div>
            
            <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-35 transition-all">
                <Bell className="w-20 h-20 text-indigo-300/30" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
