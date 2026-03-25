"use client";

import { useEffect, useMemo } from "react";
import { Users } from "lucide-react";
import { useAdminStore } from "@/store/adminStore";
import { getDisplayName, getInitial } from "@/lib/utils";

type TeamSection = {
  key: "technical" | "social" | "cybersecurity";
  title: string;
  aliases: string[];
};

const TEAM_SECTIONS: TeamSection[] = [
  {
    key: "technical",
    title: "Technical Team",
    aliases: ["technical", "tech", "engineering", "developer", "development"],
  },
  {
    key: "social",
    title: "Social Media Team",
    aliases: ["social", "media", "marketing", "content"],
  },
  {
    key: "cybersecurity",
    title: "Cybersecurity Team",
    aliases: ["cyber", "security", "infosec"],
  },
];

const normalize = (value: string | undefined | null) => (value || "").toLowerCase().trim();

export default function TeamsPage() {
  const { teams, fetchTeams, isLoading } = useAdminStore();

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const membersBySection = useMemo(() => {
    const result: Record<TeamSection["key"], any[]> = {
      technical: [],
      social: [],
      cybersecurity: [],
    };

    TEAM_SECTIONS.forEach((section) => {
      const matchedTeams = (teams || []).filter((team: any) => {
        const name = normalize(team?.name);
        return section.aliases.some((alias) => name.includes(alias));
      });

      const members = matchedTeams.flatMap((team: any) => team?.members || []);
      const deduped = Array.from(
        new Map(members.map((member: any) => [member?._id || member?.email, member])).values()
      );

      result[section.key] = deduped;
    });

    return result;
  }, [teams]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 pb-20">
        <div className="h-8 w-40 animate-pulse rounded-xl bg-secondary" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TEAM_SECTIONS.map((section) => (
            <div key={section.key} className="h-64 animate-pulse rounded-2xl border border-border/50 bg-secondary/20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">Teams</h1>
        <p className="mt-2 text-sm text-muted-foreground">Technical, Social Media, and Cybersecurity team members</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {TEAM_SECTIONS.map((section) => {
          const members = membersBySection[section.key] || [];
          return (
            <div key={section.key} className="glass rounded-2xl border border-border/60 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-black text-foreground">{section.title}</h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                  <Users className="h-3 w-3" />
                  {members.length}
                </span>
              </div>

              {members.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/60 bg-secondary/20 px-3 py-4 text-xs text-muted-foreground">
                  No members in this team yet.
                </div>
              ) : (
                <ul className="space-y-2">
                  {members.map((member: any) => (
                    <li
                      key={member?._id || member?.email}
                      className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/40 px-3 py-2.5"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-xs font-black text-primary">
                        {getInitial(member?.name, member?.email)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {getDisplayName(member?.name, member?.email)}
                        </p>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          {member?.role || "Member"}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

