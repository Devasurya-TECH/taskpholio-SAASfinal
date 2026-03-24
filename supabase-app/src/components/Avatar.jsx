import React from 'react'

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  return h;
}

const AVATAR_COLORS = [
  { bg: 'var(--accent-dim)', color: 'var(--accent)', border: 'var(--accent-border)' },
  { bg: 'var(--neon-dim)', color: 'var(--neon)', border: 'rgba(132,204,22,0.25)' },
  { bg: 'var(--info-dim)', color: 'var(--info)', border: 'rgba(59,130,246,0.25)' },
  { bg: 'var(--danger-dim)', color: 'var(--danger)', border: 'rgba(239,68,68,0.25)' },
]

export default function Avatar({ name, size = 'md' }) {
  const dName = name || '?'
  const initials = dName.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
  const idx = Math.abs(hashCode(dName)) % AVATAR_COLORS.length
  const theme = AVATAR_COLORS[idx]

  let s = 32; let f = 11;
  if (size === 'sm') { s = 24; f = 9; }
  if (size === 'lg') { s = 48; f = 16; }
  if (size === 'xl') { s = 64; f = 20; }

  return (
    <div style={{
      width: s, height: s, borderRadius: 'var(--radius-full)',
      background: theme.bg, color: theme.color, border: `1px solid ${theme.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-mono)', fontSize: f, fontWeight: 700,
      flexShrink: 0
    }} title={dName}>
      {initials}
    </div>
  )
}
