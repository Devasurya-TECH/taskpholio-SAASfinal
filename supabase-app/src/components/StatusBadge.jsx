import React from 'react'
import { RiTimeLine, RiLoader4Line, RiCheckboxCircleLine } from 'react-icons/ri'
import '../styles/components.css'

export default function StatusBadge({ status }) {
  const normalized = (status || 'pending').toLowerCase()
  if (normalized === 'completed') {
    return (
      <div className="status-badge status-done">
        <RiCheckboxCircleLine size={13} /> Completed
      </div>
    )
  }
  if (normalized === 'in-progress' || normalized === 'progress') {
    return (
      <div className="status-badge status-progress">
        <RiLoader4Line size={13} /> In Progress
      </div>
    )
  }
  return (
    <div className="status-badge status-pending">
      <RiTimeLine size={13} /> Pending
    </div>
  )
}
