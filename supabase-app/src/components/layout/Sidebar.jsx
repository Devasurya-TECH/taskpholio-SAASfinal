import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  RiStackLine,
  RiDashboard2Line, RiTaskLine, RiTeamLine, RiUserLine,
  RiBellLine, RiSettings4Line, RiSearchLine, RiLogoutBoxRLine
} from 'react-icons/ri'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { useRole } from '../../hooks/useRole'
import Avatar from '../ui/Avatar'
import '../../styles/sidebar.css'

const NAV_MAIN = [
  { to: '/dashboard', label: 'Dashboard', Icon: RiDashboard2Line },
  { to: '/tasks',     label: 'Tasks',      Icon: RiTaskLine },
  { to: '/team',      label: 'Team',       Icon: RiTeamLine },
]

const NAV_ADMIN = [
  { to: '/members', label: 'Members', Icon: RiUserLine },
]

const NAV_BOTTOM = [
  { to: '/alerts',   label: 'Alerts',    Icon: RiBellLine, badge: true },
  { to: '/settings', label: 'Settings',  Icon: RiSettings4Line },
]

export default function Sidebar() {
  const { profile, signOut } = useAuth()
  const { unreadCount } = useNotifications()
  const { isAdmin } = useRole()

  const allNav = [...NAV_MAIN, ...(isAdmin ? NAV_ADMIN : []), ...NAV_BOTTOM]

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <RiStackLine size={16} />
        </div>
        <span className="sidebar__logo-text">Taskpholio</span>
      </div>

      <div className="sidebar__search">
        <RiSearchLine size={13} />
        <input type="text" placeholder="Search..." readOnly />
      </div>

      <div className="sidebar__section-label">Workspace</div>

      {allNav.map(({ to, label, Icon, badge }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `sidebar__nav-item ${isActive ? 'active' : ''}`}
        >
          <Icon size={15} />
          {label}
          {badge && unreadCount > 0 && (
            <span className="sidebar__badge">{unreadCount}</span>
          )}
        </NavLink>
      ))}

      <div className="sidebar__user">
        <Avatar name={profile?.full_name} team={profile?.team} size={32} />
        <div className="sidebar__user-info">
          <div className="sidebar__user-name">{profile?.full_name ?? 'Loading...'}</div>
          <div className="sidebar__user-role">{profile?.role ?? ''}</div>
        </div>
        <button className="sidebar__logout" onClick={signOut} title="Sign out">
          <RiLogoutBoxRLine size={16} />
        </button>
      </div>
    </aside>
  )
}
