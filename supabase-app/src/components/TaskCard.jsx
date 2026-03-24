import React from 'react'
import { RiMore2Fill, RiCalendar2Line, RiUserSmileLine } from 'react-icons/ri'
import StatusBadge from './StatusBadge'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(ds) {
  const d = new Date(ds)
  if (isNaN(d.getTime())) return 'No date'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default React.memo(function TaskCard({ task, onEdit, onDelete, isAdmin }) {
  const tClass = task.team?.toLowerCase().includes('tech') ? 'technical' 
               : task.team?.toLowerCase().includes('cyber') ? 'cybersecurity'
               : task.team?.toLowerCase().includes('social') ? 'social' : ''

  return (
    <div className={`task-card ${tClass}`}>
      <div className="task-card-header">
        <StatusBadge status={task.status} />
        {isAdmin && (
          <div style={{ position: 'relative' }}>
            <button className="btn-ghost" style={{ padding: 4, height: 'auto' }} onClick={() => onEdit(task)}>
              <RiMore2Fill size={16} />
            </button>
          </div>
        )}
      </div>

      <div>
        <div className="task-title">{task.title}</div>
        <div className="task-desc">{task.description}</div>
      </div>

      <div className="task-footer">
        <div className="task-date">
          <RiCalendar2Line size={13} /> {formatDate(task.created_at)}
        </div>
        
        {task.assignee?.full_name ? (
          <div className="team-avatar-chip" title={task.assignee.full_name}>
            {getInitials(task.assignee.full_name)}
          </div>
        ) : (
          <div className="team-avatar-chip" title="Unassigned">
            <RiUserSmileLine size={12} />
          </div>
        )}
      </div>
    </div>
  )
})
