import React, { useState } from 'react'
import { RiCloseLine, RiCalendarEventLine } from 'react-icons/ri'

export default function MeetingModal({ onClose, onSubmit, loading }) {
  const [title, setTitle] = useState('')
  const [meetingLink, setMeetingLink] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({ title, meeting_link: meetingLink, scheduled_at: new Date(scheduledAt).toISOString() })
  }

  // default to tomorrow at 10am
  const tmrw = new Date()
  tmrw.setDate(tmrw.getDate() + 1)
  tmrw.setHours(10, 0, 0, 0)

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            <RiCalendarEventLine size={18} color="var(--info)" />
            Schedule Meeting
          </div>
          <button className="modal-close" onClick={onClose}><RiCloseLine size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="input-label">Meeting Title</label>
              <input className="input-field" value={title} onChange={e => setTitle(e.target.value)} required placeholder="E.g., Weekly Sync" />
            </div>

            <div className="form-group">
              <label className="input-label">Date & Time</label>
              <input className="input-field" type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="input-label">Meeting Link (Zoom, Meet, etc)</label>
              <input className="input-field" type="url" value={meetingLink} onChange={e => setMeetingLink(e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Scheduling...' : 'Confirm Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
