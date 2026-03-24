import { supabase } from './supabase'

export async function getDailyTeamProgress(days = 14) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data } = await supabase
    .from('daily_activity')
    .select('date, tasks_completed, user_id, profiles!daily_activity_user_id_fkey(team)')
    .gte('date', since.toISOString().split('T')[0])
    .order('date', { ascending: true })

  const grouped = {}
  ;(data ?? []).forEach(row => {
    const team = row.profiles?.team
    if (!team || !row.date) return
    if (!grouped[row.date]) grouped[row.date] = { date: row.date, technical_engine: 0, security_auth: 0, social_marketing: 0 }
    grouped[row.date][team] = (grouped[row.date][team] || 0) + row.tasks_completed
  })

  return Object.values(grouped)
}

export async function getTaskStatsByStatus() {
  const { data } = await supabase.from('tasks').select('status')
  const counts = { pending: 0, in_progress: 0, completed: 0, blocked: 0 }
  ;(data ?? []).forEach(t => { if (t.status in counts) counts[t.status]++ })
  return counts
}

export async function getTeamTaskStats() {
  const { data } = await supabase
    .from('tasks')
    .select('status, assigned_team')
    .not('assigned_team', 'is', null)

  const teams = {}
  ;(data ?? []).forEach(t => {
    if (!teams[t.assigned_team]) teams[t.assigned_team] = { total: 0, completed: 0, in_progress: 0, blocked: 0, pending: 0 }
    teams[t.assigned_team].total++
    if (t.status === 'completed') teams[t.assigned_team].completed++
    if (t.status === 'in_progress') teams[t.assigned_team].in_progress++
    if (t.status === 'blocked') teams[t.assigned_team].blocked++
    if (t.status === 'pending') teams[t.assigned_team].pending++
  })
  return teams
}

export async function getTaskVelocity(days = 7) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data } = await supabase
    .from('daily_activity')
    .select('date, tasks_completed, tasks_created')
    .gte('date', since.toISOString().split('T')[0])
    .order('date', { ascending: true })

  const grouped = {}
  ;(data ?? []).forEach(row => {
    if (!grouped[row.date]) grouped[row.date] = { date: row.date, completed: 0, created: 0 }
    grouped[row.date].completed += row.tasks_completed
    grouped[row.date].created += row.tasks_created
  })
  return Object.values(grouped)
}

export async function getDashboardStats() {
  const [statusStats, velocityData, progressData] = await Promise.all([
    getTaskStatsByStatus(),
    getTaskVelocity(7),
    getDailyTeamProgress(14),
  ])
  const today = velocityData[velocityData.length - 1] ?? {}
  return {
    total: Object.values(statusStats).reduce((a, b) => a + b, 0),
    completedToday: today.completed ?? 0,
    inProgress: statusStats.in_progress,
    blocked: statusStats.blocked,
    statusStats,
    velocityData,
    progressData,
  }
}
