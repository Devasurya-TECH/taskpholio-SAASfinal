import React from 'react'

const StatCard = React.memo(({ label, value, delta, deltaPositive, icon: Icon, accentColor = 'var(--accent)' }) => (
  <div className="stat-card">
    <div className="stat-card__left">
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
      {delta && (
        <div className={`stat-card__delta ${deltaPositive ? 'stat-card__delta--pos' : 'stat-card__delta--neg'}`}>
          {delta}
        </div>
      )}
    </div>
    {Icon && (
      <div className="stat-card__icon" style={{ background: `${accentColor}18` }}>
        <Icon size={18} color={accentColor} />
      </div>
    )}
  </div>
))

export default StatCard
