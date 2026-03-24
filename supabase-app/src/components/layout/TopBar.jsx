import React from 'react'
import { useLocation } from 'react-router-dom'
import { RiStackLine, RiArrowRightSLine } from 'react-icons/ri'
import '../../styles/topbar.css'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/tasks':     'Tasks',
  '/team':      'Team',
  '/members':   'Members',
  '/alerts':    'Alerts',
  '/settings':  'Settings',
}

export default function TopBar() {
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] ?? 'Workspace'
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <header className="topbar">
      <div className="topbar__breadcrumb">
        <RiStackLine size={14} color="var(--accent)" />
        <span>Taskpholio</span>
        <RiArrowRightSLine size={14} />
        <span className="topbar__breadcrumb-current">{title}</span>
      </div>
      <div className="topbar__spacer" />
      <span className="topbar__date">{dateStr}</span>
    </header>
  )
}
