import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  RiDashboard2Line, RiDashboard2Fill,
  RiCheckboxMultipleLine, RiCheckboxMultipleFill,
  RiGroupLine, RiGroupFill,
  RiUserLine, RiUserFill,
  RiCalendar2Line, RiCalendar2Fill,
  RiBellLine, RiBellFill,
  RiSettings4Line, RiSettings4Fill,
  RiStackLine, RiLogoutBoxRLine, RiSearchLine
} from 'react-icons/ri'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import '../styles/sidebar.css'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
}

export default function Sidebar() {
  const { profile, isAdmin, signOut } = useAuth()
  const { unreadCount } = useNotifications()
  const location = useLocation()
  const p = location.pathname

  const mainLinks = [
    { path: '/', label: 'Dashboard', icon: RiDashboard2Line, activeIcon: RiDashboard2Fill },
    { path: '/tasks', label: 'Tasks', icon: RiCheckboxMultipleLine, activeIcon: RiCheckboxMultipleFill },
    { path: '/team', label: 'Team', icon: RiGroupLine, activeIcon: RiGroupFill },
  ]

  const mgmtLinks = []
  if (isAdmin) {
    mgmtLinks.push({ path: '/members', label: 'Members', icon: RiUserLine, activeIcon: RiUserFill })
    mgmtLinks.push({ path: '/meetings', label: 'Meetings', icon: RiCalendar2Line, activeIcon: RiCalendar2Fill })
  }
  mgmtLinks.push({ path: '/notifications', label: 'Alerts', icon: RiBellLine, activeIcon: RiBellFill, badge: unreadCount })
  mgmtLinks.push({ path: '/settings', label: 'Settings', icon: RiSettings4Line, activeIcon: RiSettings4Fill })

  const NavLink = ({ item }) => {
    const isActive = p === item.path
    const Icon = isActive ? item.activeIcon : item.icon
    return (
      <Link to={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
        <Icon className="nav-icon" />
        {item.label}
        {item.badge > 0 && <div className="nav-badge">{item.badge}</div>}
      </Link>
    )
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <RiStackLine size={24} className="sidebar-logo-icon" />
        <span className="sidebar-logo-text">Taskpholio</span>
      </div>

      <div className="sidebar-search">
        <RiSearchLine size={14} color="var(--text-muted)" />
        <input type="text" placeholder="Search..." />
      </div>

      <div style={{ marginTop: 14 }}>
        <div className="sidebar-section-label">Main Menu</div>
        {mainLinks.map(n => <NavLink key={n.path} item={n} />)}
      </div>

      <div style={{ marginTop: 24 }}>
        <div className="sidebar-section-label">Management</div>
        {mgmtLinks.map(n => <NavLink key={n.path} item={n} />)}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-footer-avatar">
          {getInitials(profile?.full_name)}
        </div>
        <div className="sidebar-footer-info">
          <div className="sidebar-footer-name" title={profile?.full_name}>
            {profile?.full_name || 'Loading...'}
          </div>
          <div className="sidebar-footer-role">
            {profile?.role || 'MEMBER'}
          </div>
        </div>
        <button className="sidebar-logout" onClick={() => signOut()} title="Sign out">
          <RiLogoutBoxRLine size={18} />
        </button>
      </div>
    </aside>
  )
}
