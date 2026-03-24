import React from 'react'

const Badge = React.memo(({ type, value, icon: Icon }) => {
  const cls = `badge badge-${value ?? type}`
  return (
    <span className={cls}>
      {Icon && <Icon size={10} />}
      {value ?? type}
    </span>
  )
})

export const PriorityBadge = React.memo(({ priority }) => (
  <span className={`badge badge-${priority}`}>{priority}</span>
))

export const StatusBadge = React.memo(({ status }) => (
  <span className={`badge badge-${status}`}>{status.replace('_', ' ')}</span>
))

export const RoleBadge = React.memo(({ role }) => (
  <span className={`badge badge-${role}`}>{role}</span>
))

export default Badge
