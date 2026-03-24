import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const tooltipStyle = {
  background: '#1a1a1a',
  border: '1px solid #2e2e2e',
  borderRadius: '10px',
  fontFamily: 'IBM Plex Mono, monospace',
  fontSize: 12,
  color: '#f0f0f0',
}

const tickStyle = { fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, fill: '#888' }

const TaskVelocityBar = React.memo(({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3a3a3a', fontSize: 13 }}>
        No velocity data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
        <XAxis dataKey="date" tick={tickStyle} tickLine={false} axisLine={false} />
        <YAxis tick={tickStyle} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="completed" name="Completed" fill="#f97316" radius={[3, 3, 0, 0]} maxBarSize={20} />
        <Bar dataKey="created" name="Created" fill="#2e2e2e" radius={[3, 3, 0, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  )
})

export default TaskVelocityBar
