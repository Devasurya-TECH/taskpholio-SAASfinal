import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RoleGuard({ children, fallback = null }) {
  const { profile, loading } = useAuth()
  if (loading) return null
  const isAdmin = profile?.role === 'ceo' || profile?.role === 'cto'
  if (!isAdmin) return fallback
  return children
}
