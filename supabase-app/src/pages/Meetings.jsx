import React, { useState, useEffect } from 'react'
import { RiAddLine, RiCalendar2Line, RiVideoChatLine } from 'react-icons/ri'
import { useAuth } from '../context/AuthContext'
import { getMeetings, createMeeting, deleteMeeting } from '../lib/meetingService'
import MeetingModal from '../components/MeetingModal'
import RoleGuard from '../components/RoleGuard'
import '../styles/meetings.css'

function getCountdown(dateStr) {
  const ms = new Date(dateStr) - Date.now()
  if (ms < 0) return null
  const h = Math.floor(ms / 3600000)
  const d = Math.floor(h / 24)
  if (h < 1) return { label: 'Starting Soon', cls: 'countdown-soon' }
  if (h < 24) return { label: `In ${h}h`, cls: 'countdown-today' }
  return { label: `In ${d}d`, cls: 'countdown-future' }
}

export default function Meetings() {
  const { profile, isAdmin } = useAuth()
  const [meetings, setMeetings] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const { data } = await getMeetings()
      if (data) setMeetings(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(fields) {
    setSubmitting(true)
    await createMeeting({ ...fields, created_by: profile.id })
    setSubmitting(false)
    setModalOpen(false)
    load()
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Meetings</h1>
          <p className="page-subtitle">Syncs, recaps, and strategic planning</p>
        </div>
        <RoleGuard allowed={['ceo', 'cto']} fallback={null}>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <RiAddLine size={18} /> Schedule Meeting
          </button>
        </RoleGuard>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>
      ) : meetings.length === 0 ? (
        <div className="empty-state" style={{ minHeight: 400 }}>
          <div style={{ padding: 24, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-xl)' }}>
            <RiCalendar2Line size={48} color="var(--text-muted)" />
          </div>
          <h3 style={{ fontSize: 16, color: 'var(--text-display)', fontWeight: 600 }}>No upcoming meetings</h3>
          <p>Schedule a new team sync to get started</p>
        </div>
      ) : (
        <div className="meetings-grid">
          {meetings.map(m => {
            const cd = getCountdown(m.scheduled_at)
            const d = new Date(m.scheduled_at)
            return (
              <div key={m.id} className="meeting-card">
                <div className="meeting-title">{m.title}</div>
                <div className="meeting-row">
                  <RiCalendar2Line className="meeting-row-icon" /> 
                  <span className="meeting-time">
                    {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {' at '}
                    {d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
                
                <div className="meeting-footer">
                  {cd && <div className={`countdown-badge ${cd.cls}`}>{cd.label}</div>}
                  {m.meeting_link && (
                    <a href={m.meeting_link} target="_blank" rel="noreferrer" className="meeting-join-btn">
                      <RiVideoChatLine size={14} /> Join Call
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modalOpen && (
        <MeetingModal onClose={() => setModalOpen(false)} onSubmit={handleSubmit} loading={submitting} />
      )}
    </>
  )
}
