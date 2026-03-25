"use client";
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="relative pt-32 pb-20 lg:pt-44 lg:pb-24 overflow-hidden flex flex-col items-center justify-center text-center px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[680px] h-[520px] bg-primary/20 rounded-full blur-[120px] opacity-55 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 max-w-4xl mx-auto space-y-8"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-xs font-semibold text-primary tracking-widest uppercase mb-4">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Brand Redesign Live
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight">
          Company Operating <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-300">System for Teams.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
          Taskpholio helps CEO/CTO teams assign, track, and deliver work with clarity. One workspace for tasks, teams, meetings, and execution analytics.
        </p>

        <div className="flex items-center justify-center gap-4 pt-6">
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-8 py-4 bg-primary text-primary-foreground font-semibold uppercase tracking-widest text-sm rounded-xl overflow-hidden shadow-[0_12px_28px_rgba(99,102,241,0.35)] hover:shadow-[0_18px_34px_rgba(99,102,241,0.45)] transition-all flex items-center gap-3"
            >
              Start Workspace
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
          
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-[#13131a] border border-[#2a2a35] text-white font-semibold tracking-widest uppercase text-sm rounded-xl hover:bg-[#1a1a24] transition-all flex items-center gap-2"
            >
              Access Dashboard
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
