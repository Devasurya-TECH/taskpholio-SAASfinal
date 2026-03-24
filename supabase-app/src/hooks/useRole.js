import { useAuth } from '../context/AuthContext'

export function useRole() {
  const { profile } = useAuth()
  return {
    isAdmin: ['ceo', 'cto'].includes(profile?.role ?? ''),
    isCEO: profile?.role === 'ceo',
    isCTO: profile?.role === 'cto',
    isMember: profile?.role === 'member',
    role: profile?.role ?? '',
    team: profile?.team ?? '',
  }
}
