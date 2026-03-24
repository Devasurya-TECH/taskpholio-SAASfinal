"use client";
import { useAuthStore } from "@/store/authStore";
import { getRoleColor, cn, getDisplayName, getInitial } from "@/lib/utils";
import { motion } from "framer-motion";
import { Shield, Zap, Settings as SettingsIcon, Info, Cpu, Globe, Lock, Clock } from "lucide-react";

const SettingItem = ({ icon: Icon, label, value, sub }: any) => (
  <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 hover:bg-white/5 px-4 rounded-xl transition-all group">
    <div className="flex items-center gap-4">
      <div className="p-2 rounded-lg bg-secondary/50 group-hover:bg-primary/20 transition-all">
        <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="text-sm font-bold text-foreground mt-0.5">{value}</p>
      </div>
    </div>
    <p className="text-[9px] font-medium text-muted-foreground italic">{sub}</p>
  </div>
);

export default function SettingsPage() {
  const { user } = useAuthStore();
  const displayName = getDisplayName(user?.name, user?.email);
  const initial = getInitial(user?.name, user?.email);

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-black text-foreground tracking-tight uppercase">Base Configuration</h1>
        <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px] mt-2">Manage tactical preferences & Operational parameters</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Briefing */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1 space-y-6">
          <div className="glass rounded-[2rem] p-8 border border-white/10 shadow-2xl text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-24 h-24 rounded-[2rem] bg-primary/20 border border-primary/30 mx-auto flex items-center justify-center text-primary text-4xl font-black shadow-lg shadow-primary/20">
                {initial}
              </div>
              <h3 className="text-xl font-black text-foreground mt-6 tracking-tight">{displayName}</h3>
              <p className="text-xs text-muted-foreground font-medium mt-1">{user?.email}</p>
              <div className={cn("mt-4 inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border", getRoleColor(user?.role || "Member"))}>
                {user?.role} STATUS
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
             <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Security Clearance</h4>
             </div>
             <p className="text-[10px] text-muted-foreground leading-relaxed">Your account is secured with RSA-2048 encryption and multi-factor intelligence protocols.</p>
          </div>
        </motion.div>

        {/* Tactical Settings */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 space-y-8">
          <section className="glass rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
               <SettingsIcon className="w-6 h-6 text-primary" />
               <h3 className="font-black text-xl text-foreground uppercase tracking-tight">System Parameters</h3>
            </div>
            <div className="space-y-2">
              <SettingItem icon={Globe} label="Operational Language" value="English (Unified)" sub="Standard Intelligence Format" />
              <SettingItem icon={Clock} label="Timezone Sync" value="UTC-05:00 (EST)" sub="Automatic Tactical Sync" />
              <SettingItem icon={Zap} label="Interface Velocity" value="High Performance" sub="Optimized for Mission Speed" />
              <SettingItem icon={Lock} label="Data Privacy" value="Strict Encryption" sub="Metadata Redacted by Default" />
            </div>
          </section>

          <section className="glass rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
               <Info className="w-6 h-6 text-emerald-400" />
               <h3 className="font-black text-xl text-foreground uppercase tracking-tight">Intelligence Matrix</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Matrix Code", val: "v1.4.2-PROD", icon: Cpu },
                { label: "Core Protocol", val: "NextFS-Elite", icon: Zap },
                { label: "Data Sink", val: "Taskpholio-Cloud", icon: Globe },
                { label: "Security Level", val: "Lvl 5 Admin", icon: Shield },
              ].map((item, idx) => (
                <div key={idx} className="bg-secondary/20 p-4 rounded-2xl border border-white/5">
                   <item.icon className="w-4 h-4 text-muted-foreground mb-2" />
                   <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</p>
                   <p className="text-xs font-black text-foreground mt-0.5">{item.val}</p>
                </div>
              ))}
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
