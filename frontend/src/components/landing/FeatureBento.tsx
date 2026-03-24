"use client";
import React from "react";
import { motion } from "framer-motion";
import { Users, Zap, ShieldAlert, Rocket, Terminal, Layers } from "lucide-react";

const features = [
  {
    title: "Tactical Squads",
    description: "Assemble dynamic operative units and command them with fine-grained access tokens.",
    icon: <Users className="w-6 h-6 text-primary" />,
    className: "md:col-span-2",
  },
  {
    title: "Real-time Intel",
    description: "Supabase WebSockets stream live updates directly to your command console.",
    icon: <Zap className="w-6 h-6 text-emerald-400" />,
    className: "md:col-span-1",
  },
  {
    title: "Mission Directives",
    description: "Kanban matrix tracking operational velocity. Drag, drop, and conquer.",
    icon: <Layers className="w-6 h-6 text-blue-400" />,
    className: "md:col-span-1",
  },
  {
    title: "Threat Monitoring",
    description: "Continuous alerts for mission-critical anomalies and deployment readouts.",
    icon: <ShieldAlert className="w-6 h-6 text-red-500" />,
    className: "md:col-span-2",
  },
];

export default function FeatureBento() {
  return (
    <div className="py-32 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">
          Engineered for <span className="text-primary">Dominance</span>
        </h2>
        <p className="text-lg text-muted-foreground font-medium leading-relaxed">
          The bento grid array of enterprise-grade micro-SaaS architecture. Stop managing. Start commanding.
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
            className={`group relative overflow-hidden rounded-[2rem] glass p-8 border hover:border-primary/30 transition-all duration-300 ${feature.className}`}
          >
            {/* Subtle Inner Glow on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 flex flex-col h-full justify-between gap-8">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                {feature.icon}
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-white tracking-tight">{feature.title}</h3>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-md">
                  {feature.description}
                </p>
              </div>
            </div>
            
            {/* Accent Corner element */}
            <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-30 group-hover:rotate-12 transition-all">
                <Terminal className="w-24 h-24" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
