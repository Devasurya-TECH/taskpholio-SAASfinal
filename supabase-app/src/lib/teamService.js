import { supabase } from './supabase'

export async function fetchTeamStats() {
  const [{ data: profiles }, { data: tasks }] = await Promise.all([
    supabase.from('profiles').select('id, full_name, team, role, avatar_url'),
    supabase.from('tasks').select('assigned_team, status'),
  ])

  const teams = {
    technical_engine: { name: 'Technical Engine', members: [], tasks: { total: 0, completed: 0, in_progress: 0 } },
    security_auth: { name: 'Security & Auth', members: [], tasks: { total: 0, completed: 0, in_progress: 0 } },
    social_marketing: { name: 'Social & Marketing', members: [], tasks: { total: 0, completed: 0, in_progress: 0 } },
  }

  ;(profiles ?? []).forEach(p => {
    if (p.team && teams[p.team]) teams[p.team].members.push(p)
  })
  ;(tasks ?? []).forEach(t => {
    if (t.assigned_team && teams[t.assigned_team]) {
      teams[t.assigned_team].tasks.total++
      if (t.status === 'completed') teams[t.assigned_team].tasks.completed++
      if (t.status === 'in_progress') teams[t.assigned_team].tasks.in_progress++
    }
  })

  return teams
}

export async function fetchUpcomingMeetings(limit = 3) {
  const { data, error } = await supabase
    .from('meetings')
    .select('id, title, description, scheduled_at, link, team, created_by')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function createMeeting(payload) {
  const { data, error } = await supabase
    .from('meetings')
    .insert(payload)
    .select('id, title, scheduled_at, link, team')
    .single()
  if (error) throw error
  return data
}
