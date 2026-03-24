import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { RiNotification3Line, RiMenuLine, RiMore2Fill } from 'react-icons/ri'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import NotificationPanel from './NotificationPanel'
import '../styles/topbar.css'

export default function TopBar() {
  const { profile } = useAuth()
  const { unreadCount } = useNotifications()
  const location = useLocation()
  const navigate = useNavigate()
  const [showNotif, setShowNotif] = useState(false)

  const titles = {
    '/': 'Dashboard Overview',
    '/tasks': 'Task Management',
    '/team': 'Teams',
    '/members': 'Workspace Members',
    '/meetings': 'Meetings',
    '/notifications': 'Alerts',
    '/settings': 'Account Settings'
  }
  const currentTitle = titles[location.pathname] || 'Workspace'
  const isCeo = profile?.role === 'ceo'
  const isCto = profile?.role === 'cto'

  return (
    <div className="topbar">
      <div className="topbar-breadcrumb">
        Taskpholio
        <RiMore2Fill size={10} color="var(--border-hover)" />
        <span className="topbar-breadcrumb-current">{currentTitle}</span>
      </div>

      <div className="topbar-spacer" />

      {profile && (
        <div className={`role-badge ${isCeo ? 'ceo' : isCto ? 'cto' : 'member'}`}>
          {profile.role}
        </div>
      )}

      <div className="topbar-divider" />

      <button className="topbar-icon-btn" onClick={() => setShowNotif(!showNotif)}>
        <RiNotification3Line size={18} />
        {unreadCount > 0 && <div className="topbar-notif-dot" />}
      </button>

      {showNotif && (
        <NotificationPanel onClose={() => setShowNotif(false)} />
      )}

      <div className="topbar-avatar" onClick={() => navigate('/settings')}>
        {profile?.full_name ? profile.full_name[0].toUpperCase() : '?'}
      </div>
    </div>
  )
}
