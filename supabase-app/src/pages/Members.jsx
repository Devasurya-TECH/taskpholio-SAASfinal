import React, { useState, useEffect, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { RiUserAddLine, RiDeleteBin7Line, RiFileCopyLine, RiRefreshLine } from 'react-icons/ri'
import { useRole } from '../hooks/useRole'
import { useAuth } from '../context/AuthContext'
import { fetchMembersWithTaskCount, createMember, toggleMemberActive } from '../lib/memberService'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/ui/Modal'
import { RoleBadge } from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import '../styles/members.css'

function genPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefghjkmnpqrstwxyz23456789!@#$'
  return Array.from({ length: 14 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const TEAMS = [
  { value: 'technical_engine', label: 'Technical Engine' },
  { value: 'security_auth',    label: 'Security & Auth' },
  { value: 'social_marketing', label: 'Social & Marketing' },
]

export default function Members() {
  const { isAdmin } = useRole()
  const { user } = useAuth()

  if (!isAdmin) return <Navigate to="/dashboard" />

  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successData, setSuccessData] = useState(null)
  const [formError, setFormError] = useState('')
  const [copied, setCopied] = useState('')

  // Form
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState(genPassword())
  const [role, setRole] = useState('member')
  const [team, setTeam] = useState('technical_engine')

  const loadMembers = useCallback(async () => {
    try {
      const data = await fetchMembersWithTaskCount()
      setMembers(data)
    } catch (e) {
      console.error('fetchMembers error', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadMembers() }, [loadMembers])

  const openModal = () => {
    setFullName(''); setEmail(''); setPassword(genPassword())
    setRole('member'); setTeam('technical_engine')
    setFormError(''); setSuccessData(null)
    setModalOpen(true)
  }

  const handleAddMember = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setFormError('All fields are required.'); return
    }
    setFormError('')
    setSubmitting(true)
    try {
      await createMember({ full_name: fullName.trim(), email: email.trim(), password, role, team })
      setSuccessData({ email: email.trim(), password })
      await loadMembers()
    } catch (e) {
      setFormError(e.message ?? 'Failed to create member.')
    } finally {
      setSubmitting(false)
    }
  }

  const copy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const handleToggle = async (member) => {
    try {
      const updated = await toggleMemberActive(member)
      setMembers(prev => prev.map(m => m.id === member.id ? { ...m, is_active: updated.is_active } : m))
    } catch (e) {
      console.error('Toggle active error', e)
    }
  }

  return (
    <>
      <div className="members-header">
        <div>
          <h1 className="page-title">Members</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{members.length} workspace members</p>
        </div>
        <button className="btn-primary" onClick={openModal}>
          <RiUserAddLine size={15} /> Add Member
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Spinner size={24} />
        </div>
      ) : members.length === 0 ? (
        <EmptyState title="No members yet" icon={RiUserAddLine} body="Add your first team member." />
      ) : (
        <div className="member-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Email</th>
                <th>Role</th>
                <th>Team</th>
                <th>Tasks</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={m.full_name} team={m.team} size={30} />
                      <span style={{ fontWeight: 600 }}>{m.full_name}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-data)', fontSize: 12, color: 'var(--text-secondary)' }}>{m.email}</td>
                  <td><RoleBadge role={m.role} /></td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-data)' }}>
                    {m.team?.replace(/_/g, ' ') ?? '—'}
                  </td>
                  <td style={{ fontFamily: 'var(--font-data)', fontSize: 13 }}>{m.taskCount}</td>
                  <td>
                    <span className={`badge ${m.is_active ? 'badge-completed' : 'badge-blocked'}`}>
                      {m.is_active ? 'active' : 'inactive'}
                    </span>
                  </td>
                  <td>
                    {m.id !== user?.id && (
                      <button className="btn-icon" onClick={() => handleToggle(m)} title="Toggle active status">
                        <RiRefreshLine size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={successData ? 'Member Created' : 'Add New Member'}
        width={480}
        footer={!successData ? (
          <>
            <button className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAddMember} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Member'}
            </button>
          </>
        ) : (
          <button className="btn-outline" onClick={() => setModalOpen(false)}>Done</button>
        )}
      >
        {successData ? (
          <div className="credential-reveal">
            <p className="credential-reveal__title">Member Created Successfully</p>
            <p className="credential-reveal__warning">Share these credentials once. They will not be shown again.</p>
            {[{ label: 'Email', value: successData.email, key: 'email' }, { label: 'Password', value: successData.password, key: 'pass' }].map(row => (
              <div key={row.key} className="credential-reveal__row">
                <span className="label">{row.label}</span>
                <span className="value">{row.value}</span>
                <button onClick={() => copy(row.value, row.key)} title="Copy to clipboard">
                  <RiFileCopyLine size={14} color={copied === row.key ? 'var(--lime)' : undefined} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <>
            {formError && <div className="login-error" style={{ marginBottom: 16 }}>{formError}</div>}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@company.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" value={password} onChange={e => setPassword(e.target.value)} />
                <button className="btn-icon" type="button" onClick={() => setPassword(genPassword())} title="Generate new password">
                  <RiRefreshLine size={14} />
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input form-select" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="member">Member</option>
                  <option value="cto">CTO</option>
                  <option value="ceo">CEO</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Team</label>
                <select className="form-input form-select" value={team} onChange={e => setTeam(e.target.value)}>
                  {TEAMS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
          </>
        )}
      </Modal>
    </>
  )
}
