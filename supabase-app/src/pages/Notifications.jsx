import React, { useState } from 'react'
import {
  RiCheckDoubleLine, RiFileList3Line, RiCalendarEventLine, RiInformationLine, RiNotification3Line
} from 'react-icons/ri'
import { useNotifications } from '../context/NotificationContext'

function getIcon(type) {
  switch (type) {
    case 'task': return <RiFileList3Line size={18} color="var(--info)" />
    case 'meeting': return <RiCalendarEventLine size={18} color="var(--accent)" />
    default: return <RiInformationLine size={18} color="var(--text-secondary)" />
  }
}

function getBg(type) {
  switch (type) {
    case 'task': return 'var(--info-dim)'
    case 'meeting': return 'var(--accent-dim)'
    default: return 'var(--bg-elevated)'
  }
}

function timeAgo(dateString) {
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return ''
  const s = Math.floor((new Date() - d) / 1000)
  if (s < 60) return 'Just now'
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

export default function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications()
  const [filter, setFilter] = useState('all')

  const filtered = notifications.filter(n => {
    if (filter === 'all') return true
    return n.type === filter
  })

  return (
    <>
      <div className="page-header" style={{ alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">
            Alerts & History
            {unreadCount > 0 && (
              <span style={{ marginLeft: 12, background: 'var(--accent)', color: 'white', padding: '2px 8px', borderRadius: 99, fontSize: 13, display: 'inline-flex', verticalAlign: 'middle' }}>
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="page-subtitle">Workspace activity, mentions, and updates</p>
        </div>
        
        {unreadCount > 0 && (
          <button className="btn-ghost" onClick={markAllRead}>
            <RiCheckDoubleLine size={16} /> Mark all read
          </button>
        )}
      </div>

      <div className="filter-tabs">
        <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Alerts</button>
        <button className={`filter-tab ${filter === 'task' ? 'active' : ''}`} onClick={() => setFilter('task')}>Tasks</button>
        <button className={`filter-tab ${filter === 'meeting' ? 'active' : ''}`} onClick={() => setFilter('meeting')}>Meetings</button>
        <button className={`filter-tab ${filter === 'system' ? 'active' : ''}`} onClick={() => setFilter('system')}>General</button>
      </div>

      <div className="dashboard-card" style={{ maxWidth: 860 }}>
        <div style={{ padding: '0 20px' }}>
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ minHeight: 300 }}>
              <div style={{ padding: 20, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-xl)' }}>
                <RiNotification3Line size={40} color="var(--text-muted)" />
              </div>
              <h3 style={{ fontSize: 16, color: 'var(--text-secondary)', fontWeight: 600 }}>All caught up</h3>
              <p>You have no notifications in this category</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filtered.map(n => (
                <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`} onClick={() => { if (!n.read) markAsRead(n.id) }}>
                  <div className="notif-icon-box" style={{ background: getBg(n.type) }}>
                    {getIcon(n.type)}
                  </div>
                  <div className="notif-content">
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-message">{n.message}</div>
                    <div className="notif-time">{timeAgo(n.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
