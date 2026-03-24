import React, { useState, useEffect } from 'react'
import { RiCloseLine, RiTaskLine } from 'react-icons/ri'
import { getAllProfiles } from '../lib/profileService'

const TEAMS = ['Technical Team', 'Cybersecurity Team', 'Social Media Team']

export default function TaskModal({ task, onClose, onSubmit, onDelete, loading, isAdmin }) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [status, setStatus] = useState(task?.status || 'pending')
  const [visibility, setVisibility] = useState(task?.visibility || 'public')
  const [team, setTeam] = useState(task?.team || TEAMS[0])
  const [assignedTo, setAssignedTo] = useState(task?.assigned_to || '')
  
  const [members, setMembers] = useState([])

  useEffect(() => {
    getAllProfiles().then(({ data }) => { if (data) setMembers(data) })
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({ id: task?.id, title, description, status, visibility, team, assignedTo })
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            <RiTaskLine size={18} color="var(--accent)" />
            {task ? 'Edit Task' : 'Create New Task'}
          </div>
          <button className="modal-close" onClick={onClose}><RiCloseLine size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            
            <div className="wizard-steps">
              <div className="wizard-step done">
                <div className="wizard-step-circle">1</div>
                <div className="wizard-step-label">Details</div>
              </div>
              <div className="wizard-connector" />
              <div className="wizard-step active">
                <div className="wizard-step-circle">2</div>
                <div className="wizard-step-label">Assignment</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="input-label">Task Title</label>
                <input className="input-field" value={title} onChange={e => setTitle(e.target.value)} required placeholder="E.g., Update firewall rules" />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="input-label">Description</label>
                <textarea className="input-field" style={{ height: 80, padding: 12, resize: 'none' }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Task details and expectations..." />
              </div>

              <div className="form-group">
                <label className="input-label">Status</label>
                <select className="input-field" value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label className="input-label">Visibility</label>
                <select className="input-field" value={visibility} onChange={e => setVisibility(e.target.value)}>
                  <option value="public">Public (Workspace)</option>
                  <option value="private">Private (Team only)</option>
                </select>
              </div>

              {isAdmin && (
                <>
                  <div className="form-group">
                    <label className="input-label">Target Team</label>
                    <select className="input-field" value={team} onChange={e => setTeam(e.target.value)}>
                      {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="input-label">Assign To Member</label>
                    <select className="input-field" value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
                      <option value="">-- Unassigned --</option>
                      {members.filter(m => m.team === team).map(m => (
                        <option key={m.id} value={m.id}>{m.full_name} ({m.role})</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="modal-footer">
            {task && isAdmin && (
              <button type="button" className="btn btn-danger" style={{ marginRight: 'auto' }} onClick={() => onDelete(task.id)}>
                Delete Task
              </button>
            )}
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
