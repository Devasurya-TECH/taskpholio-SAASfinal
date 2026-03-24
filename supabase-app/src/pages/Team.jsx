import React, { useState, useEffect } from 'react'
import { RiCodeSSlashLine, RiShieldCheckLine, RiGlobalLine } from 'react-icons/ri'
import { fetchTeamStats } from '../lib/teamService'
import TeamCompletionRadar from '../components/charts/TeamCompletionRadar'
import Spinner from '../components/ui/Spinner'
import '../styles/team.css'

const TEAM_CONFIG = {
  technical_engine: { label: 'Technical Engine', Icon: RiCodeSSlashLine, iconBg: 'var(--blue-dim)', color: '#f97316', chipBg: '#f9731644' },
  security_auth:    { label: 'Security & Auth',  Icon: RiShieldCheckLine, iconBg: 'var(--danger-dim)', color: '#60a5fa', chipBg: '#60a5fa44' },
  social_marketing: { label: 'Social & Marketing', Icon: RiGlobalLine,   iconBg: 'var(--lime-dim)',   color: '#a3e635', chipBg: '#a3e63544' },
}

function buildRadarData(stats) {
  return [
    { metric: 'Completed',   technical_engine: stats.technical_engine?.completed ?? 0, security_auth: stats.security_auth?.completed ?? 0, social_marketing: stats.social_marketing?.completed ?? 0 },
    { metric: 'In Progress', technical_engine: stats.technical_engine?.in_progress ?? 0, security_auth: stats.security_auth?.in_progress ?? 0, social_marketing: stats.social_marketing?.in_progress ?? 0 },
    { metric: 'Pending',     technical_engine: stats.technical_engine?.tasks?.pending ?? 0, security_auth: stats.security_auth?.tasks?.pending ?? 0, social_marketing: stats.social_marketing?.tasks?.pending ?? 0 },
    { metric: 'Blocked',     technical_engine: stats.technical_engine?.tasks?.blocked ?? 0, security_auth: stats.security_auth?.tasks?.blocked ?? 0, social_marketing: stats.social_marketing?.tasks?.blocked ?? 0 },
  ]
}

export default function Team() {
  const [teams, setTeams] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeamStats()
      .then(setTeams)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner fullscreen />

  const radarData = buildRadarData(teams)

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 className="page-title">Workspace Teams</h1>
      </div>

      <div className="team-cards-grid">
        {Object.entries(TEAM_CONFIG).map(([key, cfg]) => {
          const team = teams[key] ?? { members: [], tasks: { total: 0, completed: 0, in_progress: 0 } }
          const pct = team.tasks.total > 0 ? Math.round((team.tasks.completed / team.tasks.total) * 100) : 0

          return (
            <div key={key} className="team-card">
              <div className="team-card__icon" style={{ background: cfg.iconBg }}>
                <cfg.Icon size={22} color={cfg.color} />
              </div>
              <div className="team-card__name">{cfg.label}</div>
              <div className="team-card__subline">{team.members.length} active members</div>

              <div className="team-card__avatars">
                {team.members.slice(0, 5).map((m, i) => (
                  <div key={m.id} className="team-avatar-chip" style={{ background: cfg.chipBg, color: cfg.color }}>
                    {m.full_name?.[0] ?? '?'}
                  </div>
                ))}
                {team.members.length > 5 && (
                  <div className="team-avatar-chip" style={{ background: 'var(--bg-card-alt)', color: 'var(--text-secondary)' }}>
                    +{team.members.length - 5}
                  </div>
                )}
              </div>

              <div className="team-card__progress-bar">
                <div className="team-card__progress-fill" style={{ width: `${pct}%`, background: cfg.color }} />
              </div>
              <div className="team-card__stats">
                <span className="team-card__stat"><strong>{pct}%</strong> complete</span>
                <span className="team-card__stat"><strong>{team.tasks.total}</strong> tasks</span>
                <span className="team-card__stat"><strong>{team.tasks.in_progress}</strong> active</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="team-radar-wrap">
        <div className="section-header">Team Performance Radar</div>
        <TeamCompletionRadar data={radarData} />
      </div>
    </>
  )
}
