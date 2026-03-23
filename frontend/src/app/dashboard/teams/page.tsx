"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ChevronRight, ShieldCheck, Zap, Target, MoreHorizontal, UserPlus } from "lucide-react";
import api from "@/lib/api";
import { Team, User } from "@/lib/types";
import { cn, getRoleColor } from "@/lib/utils";
import { toast } from "sonner";

interface Hierarchy {
  ceo: User[];
  ctos: User[];
  leads: User[];
}

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-secondary/30 border border-border/50 rounded-2xl p-4 flex items-center gap-4">
    <div className={cn("p-2.5 rounded-xl bg-opacity-10", color)}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-lg font-black text-foreground">{value}</p>
    </div>
  </div>
);

const UserBadge = ({ user, size = "md" }: { user: User; size?: "sm" | "md" }) => (
  <motion.div whileHover={{ y: -2 }} className={cn("flex items-center gap-3 bg-secondary/40 border border-border/50 rounded-2xl p-3", size === "sm" ? "p-2" : "p-3")}>
    <div className={cn("rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20 shadow-lg shadow-primary/5", size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm")}>
      {user.name[0]}
    </div>
    <div className="flex-1 min-w-0">
      <p className={cn("font-black text-foreground truncate", size === "sm" ? "text-xs" : "text-sm")}>{user.name}</p>
      <div className="flex items-center gap-2">
        <span className={cn("text-[9px] px-1.5 py-0.5 rounded-lg font-black uppercase tracking-tighter border", getRoleColor(user.role))}>
          {user.role}
        </span>
        <span className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_5px]", user.status === "active" ? "bg-emerald-400 shadow-emerald-400/50" : "bg-orange-400 shadow-orange-400/50")} />
      </div>
    </div>
  </motion.div>
);

export default function TeamsPage() {
  const [hierarchy, setHierarchy] = useState<Hierarchy | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("teams/hierarchy"),
      api.get("teams"),
    ]).then(([h, t]) => {
      setHierarchy(h.data.data.hierarchy);
      setTeams(t.data.data.teams);
    }).catch(() => toast.error("Intelligence gathering failed")).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 w-48 bg-secondary rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-secondary rounded-3xl" />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Organization Command</h1>
          <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">Operational Structure & Hierarchy</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-black text-xs hover:scale-105 transition-transform shadow-xl shadow-primary/20 tracking-widest">
           ASSEMBLE TEAM
        </button>
      </div>

      {/* Strategic Hierarchy */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Strategic Leadership</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
           {/* Direct Lines */}
           <div className="hidden md:block absolute top-1/2 left-[30%] right-[30%] h-px bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2 z-0" />

           {/* Executive Tier */}
           <div className="space-y-4">
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block pl-2">Executive Command</span>
              {hierarchy?.ceo.map(u => <UserBadge key={u._id} user={u} />)}
           </div>

           {/* Technical Tier */}
           <div className="space-y-4">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block pl-2">Technical Directorate</span>
              {hierarchy?.ctos.map(u => <UserBadge key={u._id} user={u} />)}
           </div>

           {/* Operational Tier */}
           <div className="space-y-4">
              <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest block pl-2">Field Operations</span>
              {hierarchy?.leads.map(u => <UserBadge key={u._id} user={u} />)}
           </div>
        </div>
      </section>

      {/* Tactical Squads (Teams) */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Tactical Squads</h2>
          </div>
          <div className="text-[10px] font-black text-muted-foreground border border-border/50 px-3 py-1 rounded-full bg-secondary/30">
            {teams.length} ACTIVE SQUADS
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {teams.map((team, idx) => (
            <motion.div
              key={team._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass rounded-[2rem] p-8 space-y-8 border-primary/5 hover:border-primary/20 transition-all group relative overflow-hidden shadow-2xl"
            >
              {/* Squad Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-foreground group-hover:text-primary transition-colors">{team.name}</h3>
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Squad Intelligence Verified</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-secondary rounded-xl transition-colors text-muted-foreground">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Squad Analytics */}
              <div className="grid grid-cols-2 gap-4">
                <StatCard label="Tasks" value={team.stats?.totalTasks || 0} icon={Target} color="text-blue-400 bg-blue-400" />
                <StatCard label="Victory" value={`${Math.round((team.stats?.completedTasks / (team.stats?.totalTasks || 1)) * 100)}%`} icon={ShieldCheck} color="text-emerald-400 bg-emerald-400" />
              </div>

              {/* Squad Commander */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Squad Leader</p>
                <UserBadge user={team.lead} size="sm" />
              </div>

              {/* Squad Members */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between px-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Operatives</p>
                  <span className="text-[10px] font-black text-primary">{team.members.length} VERIFIED</span>
                </div>
                <div className="flex -space-x-3">
                  {team.members.slice(0, 5).map((m) => (
                    <motion.div
                      key={m._id}
                      whileHover={{ scale: 1.2, zIndex: 10, y: -5 }}
                      className="w-10 h-10 rounded-xl bg-secondary border-2 border-background flex items-center justify-center text-primary font-black text-xs shadow-xl cursor-help"
                      title={m.name}
                    >
                      {m.name[0]}
                    </motion.div>
                  ))}
                  {team.members.length > 5 && (
                    <div className="w-10 h-10 rounded-xl bg-background border-2 border-primary/20 flex items-center justify-center text-primary font-black text-xs">
                      +{team.members.length - 5}
                    </div>
                  )}
                  <button className="w-10 h-10 rounded-xl bg-secondary border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all">
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
