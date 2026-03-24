import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const tooltipStyle = {
  background: '#1a1a1a',
  border: '1px solid #2e2e2e',
  borderRadius: '10px',
  fontFamily: 'IBM Plex Mono, monospace',
  fontSize: 12,
  color: '#f0f0f0',
}

const tickStyle = { fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, fill: '#888' }

const DailyProgressChart = React.memo(({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3a3a3a', fontSize: 13 }}>
        No activity data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="gOrange" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gLime" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a3e635" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#a3e635" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
        <XAxis dataKey="date" tick={tickStyle} tickLine={false} axisLine={false} />
        <YAxis tick={tickStyle} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#2e2e2e', strokeWidth: 1 }} />
        <Area type="monotone" dataKey="technical_engine" name="Technical Engine" stroke="#f97316" fill="url(#gOrange)" strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="security_auth" name="Security & Auth" stroke="#60a5fa" fill="url(#gBlue)" strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="social_marketing" name="Social Marketing" stroke="#a3e635" fill="url(#gLime)" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
})

export default DailyProgressChart
