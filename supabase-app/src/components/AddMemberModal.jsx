import React, { useState } from 'react'
import { RiCloseLine, RiUserAddLine } from 'react-icons/ri'

const ROLES = ['Member', 'CTO', 'CEO']
const TEAMS = ['Technical Team', 'Cybersecurity Team', 'Social Media Team']

export default function AddMemberModal({ onClose, onSubmit, loading }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Member')
  const [team, setTeam] = useState(TEAMS[0])

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({ fullName, email, password, role, team })
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            <RiUserAddLine size={18} color="var(--accent)" />
            Add Workspace Member
          </div>
          <button className="modal-close" onClick={onClose}><RiCloseLine size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="input-label">Full Name</label>
              <input className="input-field" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="E.g., Jane Doe" />
            </div>

            <div className="form-group">
              <label className="input-label">Email Address</label>
              <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required placeholder="jane@company.com" />
            </div>

            <div className="form-group">
              <label className="input-label">Temporary Password</label>
              <input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Minimum 6 characters" minLength={6} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="input-label">Workspace Role</label>
                <select className="input-field" value={role} onChange={e => setRole(e.target.value)}>
                  {ROLES.map(r => <option key={r} value={r.toLowerCase()}>{r}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="input-label">Assign Team</label>
                <select className="input-field" value={team} onChange={e => setTeam(e.target.value)}>
                  {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding Member...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
