import React from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend, ResponsiveContainer } from 'recharts'

const tickStyle = { fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, fill: '#888' }

const TeamCompletionRadar = React.memo(({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3a3a3a', fontSize: 13 }}>
        No team data yet
      </div>
    )
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data}>
        <PolarGrid stroke="#222" />
        <PolarAngleAxis dataKey="metric" tick={tickStyle} />
        <Radar name="Technical Engine" dataKey="technical_engine" stroke="#f97316" fill="#f97316" fillOpacity={0.15} />
        <Radar name="Security & Auth" dataKey="security_auth" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.15} />
        <Radar name="Social Marketing" dataKey="social_marketing" stroke="#a3e635" fill="#a3e635" fillOpacity={0.15} />
        <Legend wrapperStyle={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#888' }} />
      </RadarChart>
    </ResponsiveContainer>
  )
})

export default TeamCompletionRadar
