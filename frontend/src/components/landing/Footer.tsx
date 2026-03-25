"use client";
import React from "react";
import Link from "next/link";
import { Activity, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[#1e1e28] bg-[#0d0d12] pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Logo & Intro */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center text-primary shadow-primary/20">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-black text-lg tracking-tight text-foreground">
                Task<span className="text-primary">pholio</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground font-medium max-w-sm leading-relaxed">
              A clean and modern operating system for company tasks, teams, meetings, and analytics.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <a href="#" className="p-2 rounded-lg bg-[#1a1a24] border border-[#2a2a35] text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-[#1a1a24] border border-[#2a2a35] text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-[#1a1a24] border border-[#2a2a35] text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="font-black text-white text-sm tracking-widest uppercase mb-6">Product</h4>
            <ul className="space-y-4 font-medium text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Changelog</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="font-black text-white text-sm tracking-widest uppercase mb-6">Company</h4>
            <ul className="space-y-4 font-medium text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-[#1e1e28] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-muted-foreground">
          <p>© 2026 Taskpholio. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
