"use client";
import { useState, useEffect } from "react";
import { Bell, Moon, Sun, Search } from "lucide-react";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { useSocket } from "@/providers/SocketProvider";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import NotificationCenter from "../notifications/NotificationCenter";

interface Props {
  title: string;
}

export default function Topbar({ title }: Props) {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-20">
      <h1 className="text-base font-semibold text-foreground">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-muted-foreground w-48">
          <Search className="w-3.5 h-3.5" />
          <span>Search...</span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <NotificationCenter />

        {/* Avatar */}
        {user && (
          <Link href="/dashboard/profile" className="shrink-0 transition-transform hover:scale-105">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm overflow-hidden">
              {user.avatar ? (
                <Image src={user.avatar} alt={user.name} width={32} height={32} className="object-cover w-full h-full" />
              ) : (
                user.name[0].toUpperCase()
              )}
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
