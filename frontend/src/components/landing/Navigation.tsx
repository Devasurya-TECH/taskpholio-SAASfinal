"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-[#0d0d12]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-105 transition-all shadow-primary/20">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-black text-lg tracking-tight text-foreground">
            Task<span className="text-primary">pholio</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Log In
          </Link>
          <Link href="/register">
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="text-sm font-semibold bg-primary text-primary-foreground px-5 py-2 rounded-lg hover:bg-primary/90 transition-all shadow-[0_8px_20px_rgba(99,102,241,0.35)]"
            >
              Get Started
            </motion.button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
