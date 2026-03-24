import React from 'react'
import { RiArrowUpLine, RiArrowDownLine, RiSubtractLine } from 'react-icons/ri'

export default function MetricCard({ title, value, trend, icon: Icon }) {
  const isUp = trend > 0
  const isDown = trend < 0
  const trendCls = isUp ? 'up' : isDown ? 'down' : 'flat'
  
  return (
    <div className="metric-card">
      <div className="metric-card-top">
        <div className="metric-icon" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
          <Icon size={20} />
        </div>
        <div className={`metric-trend ${trendCls}`}>
          {isUp ? <RiArrowUpLine size={12} /> : isDown ? <RiArrowDownLine size={12} /> : <RiSubtractLine size={12} />}
          {Math.abs(trend || 0)}%
        </div>
      </div>
      <div>
        <div className="metric-value">{value}</div>
        <div className="metric-label">{title}</div>
      </div>
    </div>
  )
}
