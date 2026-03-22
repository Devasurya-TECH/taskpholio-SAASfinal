"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, ChevronRight } from "lucide-react";
import api from "@/lib/api";
import { Team, User } from "@/lib/types";
import { cn, getRoleColor } from "@/lib/utils";

interface Hierarchy {
  ceo: User[];
  ctos: User[];
  managers: User[];
  teams: Team[];
}

const Skeleton = () => <div className="animate-pulse bg-secondary rounded-xl h-24" />;

const UserBadge = ({ user }: { user: User }) => (
  <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
      {user.name[0]}
    </div>
    <div>
      <p className="text-xs font-semibold text-foreground">{user.name}</p>
      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", getRoleColor(user.role))}>
        {user.role}
      </span>
    </div>
  </div>
);

export default function TeamsPage() {
  const [hierarchy, setHierarchy] = useState<Hierarchy | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/teams/hierarchy"),
      api.get("/teams"),
    ]).then(([h, t]) => {
      setHierarchy(h.data.data.hierarchy);
      setTeams(t.data.data.teams);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">Organization Hierarchy</h2>
        <p className="text-sm text-muted-foreground">Team structure and reporting lines</p>
      </div>

      {loading ? (
        <div className="grid gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} />)}</div>
      ) : hierarchy ? (
        <div className="space-y-6">
          {/* CEO Level */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-purple-400" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">CEO</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {hierarchy.ceo.map((u) => <UserBadge key={u._id} user={u} />)}
              {hierarchy.ceo.length === 0 && <p className="text-sm text-muted-foreground">No CEOs registered.</p>}
            </div>
          </div>

          {/* CTO Level */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-border" />
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">CTOs</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {hierarchy.ctos.map((u) => <UserBadge key={u._id} user={u} />)}
              {hierarchy.ctos.length === 0 && <p className="text-sm text-muted-foreground">No CTOs registered.</p>}
            </div>
          </div>

          {/* Manager Level */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-border" />
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-orange-400" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Managers</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {hierarchy.managers.map((u) => <UserBadge key={u._id} user={u} />)}
              {hierarchy.managers.length === 0 && <p className="text-sm text-muted-foreground">No managers registered.</p>}
            </div>
          </div>
        </div>
      ) : null}

      {/* Teams Grid */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Teams</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {loading
            ? [...Array(3)].map((_, i) => <Skeleton key={i} />)
            : teams.map((team) => (
                <motion.div
                  key={team._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-5 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{team.name}</h3>
                      {team.description && <p className="text-xs text-muted-foreground">{team.description}</p>}
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-2">Manager</p>
                    <UserBadge user={team.manager} />
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">{team.members.length} members</p>
                    <div className="flex -space-x-2">
                      {team.members.slice(0, 5).map((m) => (
                        <div key={m._id} title={m.name}
                          className="w-7 h-7 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-primary text-xs font-bold"
                        >
                          {m.name[0]}
                        </div>
                      ))}
                      {team.members.length > 5 && (
                        <div className="w-7 h-7 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-muted-foreground text-xs font-medium">
                          +{team.members.length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
          }
        </div>
      </div>
    </div>
  );
}
