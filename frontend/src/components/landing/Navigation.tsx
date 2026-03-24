"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 bg-black/40 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-all shadow-primary/20">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-black text-lg tracking-tight text-foreground">
            TASK<span className="text-primary">PHOLIO</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
            Log In
          </Link>
          <Link href="/register">
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="text-sm font-bold bg-white text-black px-5 py-2 rounded-lg hover:bg-gray-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              Start Mission
            </motion.button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
