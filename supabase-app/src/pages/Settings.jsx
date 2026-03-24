import React, { useState } from 'react'
import { RiSave3Line, RiLockPasswordLine } from 'react-icons/ri'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useRole } from '../hooks/useRole'
import '../styles/settings.css'

const MEMBER_PERMS = [
  { label: 'View assigned tasks', color: 'var(--success)' },
  { label: 'Update task status on own tasks', color: 'var(--success)' },
  { label: 'View upcoming team meetings', color: 'var(--success)' },
]
const ADMIN_PERMS = [
  { label: 'View and manage all tasks', color: 'var(--lime)' },
  { label: 'Invite and configure team members', color: 'var(--lime)' },
  { label: 'Schedule executive meetings', color: 'var(--lime)' },
  { label: 'Access workspace analytics', color: 'var(--lime)' },
  { label: 'Full member management', color: 'var(--lime)' },
]

export default function Settings() {
  const { profile, user, signOut } = useAuth()
  const { isAdmin } = useRole()

  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' })
  const [savingProfile, setSavingProfile] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' })
  const [savingPw, setSavingPw] = useState(false)

  const [deletingAccount, setDeletingAccount] = useState(false)

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!fullName.trim()) { setProfileMsg({ type: 'error', text: 'Name cannot be empty.' }); return }
    setSavingProfile(true)
    setProfileMsg({ type: '', text: '' })
    const { error } = await supabase.from('profiles').update({ full_name: fullName.trim() }).eq('id', user.id)
    setSavingProfile(false)
    if (error) setProfileMsg({ type: 'error', text: error.message })
    else setProfileMsg({ type: 'success', text: 'Profile updated.' })
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPassword.length < 8) { setPwMsg({ type: 'error', text: 'Password must be at least 8 characters.' }); return }
    if (newPassword !== confirmPassword) { setPwMsg({ type: 'error', text: 'Passwords do not match.' }); return }
    setSavingPw(true)
    setPwMsg({ type: '', text: '' })
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPw(false)
    if (error) setPwMsg({ type: 'error', text: error.message })
    else { setPwMsg({ type: 'success', text: 'Password changed successfully.' }); setNewPassword(''); setConfirmPassword('') }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('This cannot be undone. Permanently delete your account?')) return
    setDeletingAccount(true)
    await supabase.from('profiles').delete().eq('id', user.id)
    await signOut()
  }

  const initials = profile?.full_name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? '?'
  const perms = isAdmin ? ADMIN_PERMS : MEMBER_PERMS

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <h1 className="page-title">Settings</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Manage your personal account</p>
      </div>

      <div className="settings-layout">
        {/* Left column */}
        <div>
          <div className="settings-card">
            <div className="settings-card-title">Personal Information</div>
            <div className="settings-card-body">
              {profileMsg.text && <div className={`settings-${profileMsg.type}`}>{profileMsg.text}</div>}
              <form onSubmit={handleSaveProfile}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email address</label>
                  <input className="form-input" value={profile?.email ?? ''} disabled />
                  <span className="form-hint">Email cannot be changed after signup.</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="submit" className="btn-primary" disabled={savingProfile}>
                    <RiSave3Line size={15} /> {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="settings-card">
            <div className="settings-card-title">Change Password</div>
            <div className="settings-card-body">
              {pwMsg.text && <div className={`settings-${pwMsg.type}`}>{pwMsg.text}</div>}
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input className="form-input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 8 characters" />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input className="form-input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="submit" className="btn-primary" disabled={savingPw}>
                    <RiLockPasswordLine size={15} /> {savingPw ? 'Saving...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="danger-zone">
            <div className="danger-zone-title">Danger Zone</div>
            <p className="danger-zone-body">Permanently delete your account and all workspace data. This action cannot be undone.</p>
            <button className="btn-danger" disabled={deletingAccount} onClick={handleDeleteAccount}>
              {deletingAccount ? 'Deleting...' : 'Delete My Account'}
            </button>
          </div>
        </div>

        {/* Right column */}
        <div>
          <div className="settings-card">
            <div className="profile-card-center">
              <div className="profile-avatar-ring">{initials}</div>
              <div className="profile-card-name">{profile?.full_name}</div>
              <div className="profile-card-email">{profile?.email}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <span className={`badge badge-${profile?.role}`}>{profile?.role}</span>
                {profile?.team && (
                  <span className="badge badge-pending" style={{ fontFamily: 'var(--font-data)' }}>
                    {profile.team.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="settings-card">
            <div className="settings-card-title">Role Permissions</div>
            <div className="permissions-list">
              {perms.map((p, i) => (
                <div key={i} className="permission-item">
                  <div className="permission-dot" style={{ background: p.color }} />
                  {p.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
