import React from 'react'

const TEAM_COLORS = {
  technical_engine: '#f97316',
  security_auth: '#60a5fa',
  social_marketing: '#a3e635',
  default: '#888',
}

const Avatar = React.memo(({ name, team, size = 32 }) => {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'
  const color = TEAM_COLORS[team] ?? TEAM_COLORS.default

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: `${color}22`,
      border: `1px solid ${color}55`,
      color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'IBM Plex Mono, monospace',
      fontWeight: 700,
      fontSize: size * 0.35,
      flexShrink: 0,
      userSelect: 'none',
    }}>
      {initials}
    </div>
  )
})

export default Avatar
