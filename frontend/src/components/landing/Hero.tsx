"use client";
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Terminal } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center justify-center text-center px-6">
      
      {/* Subtle Aurora Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 max-w-4xl mx-auto space-y-8"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-primary tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(57,255,20,0.15)]">
          <Terminal className="w-3.5 h-3.5" />
          Taskpholio v2.0 Live
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight">
          Tactical Operations <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Command Center.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
          The ultimate real-time SaaS platform for elite teams. Monitor intelligence feeds, assemble tactical squads, and execute missions with unprecedented speed.
        </p>

        <div className="flex items-center justify-center gap-4 pt-6">
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-8 py-4 bg-primary text-black font-black uppercase tracking-widest text-sm rounded-xl overflow-hidden shadow-[0_0_40px_rgba(57,255,20,0.3)] hover:shadow-[0_0_60px_rgba(57,255,20,0.5)] transition-all flex items-center gap-3"
            >
              Deploy Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
          
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold tracking-widest uppercase text-sm rounded-xl hover:bg-white/10 transition-all flex items-center gap-2"
            >
              Access Dashboard
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Embedded Dashboard Preview (Glassmorphism Mockup) */}
      <motion.div
        initial={{ opacity: 0, y: 100, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        style={{ perspective: "1000px" }}
        className="mt-20 w-full max-w-6xl relative z-10"
      >
        <div className="rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-xl p-2 md:p-4 shadow-2xl">
          <div className="rounded-[1.5rem] overflow-hidden border border-white/5 relative bg-[#0a0a0a] aspect-[16/9] flex items-center justify-center">
            {/* Minimalist Dashboard Skeleton representation */}
            <div className="absolute inset-0 grid grid-cols-12 gap-0 opacity-20 pointer-events-none">
                <div className="col-span-2 border-r border-white/10 bg-white/[0.02]" />
                <div className="col-span-10 grid grid-rows-6">
                    <div className="border-b border-white/10 bg-white/[0.01]" />
                    <div className="row-span-5 p-8 grid grid-cols-3 gap-6">
                        <div className="bg-white/5 rounded-2xl border border-white/10" />
                        <div className="bg-white/5 rounded-2xl border border-white/10" />
                        <div className="bg-white/5 rounded-2xl border border-white/10" />
                    </div>
                </div>
            </div>
            
            <div className="relative text-center opacity-40">
                <Terminal className="w-16 h-16 mx-auto mb-4 text-primary" />
                <p className="font-black text-xl tracking-widest uppercase">System Online</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
