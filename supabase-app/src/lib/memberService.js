import { supabase } from './supabase'

export async function fetchMembers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, team, avatar_url, is_active, created_at')
    .order('full_name')
  if (error) throw error
  return data ?? []
}

export async function fetchMembersByTeam(team) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, team, avatar_url, is_active')
    .eq('team', team)
    .order('full_name')
  if (error) throw error
  return data ?? []
}

export async function createMember(payload) {
  // Uses the Edge Function which uses the service_role for admin.createUser
  const { data, error } = await supabase.functions.invoke('create-member', {
    body: payload,
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data
}

export async function updateMember(id, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select('id, full_name, email, role, team, is_active')
    .single()
  if (error) throw error
  return data
}

export async function toggleMemberActive(member) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_active: !member.is_active })
    .eq('id', member.id)
    .select('id, is_active')
    .single()
  if (error) throw error
  return data
}

export async function fetchMembersWithTaskCount() {
  const [{ data: profiles, error: pErr }, { data: tasks, error: tErr }] = await Promise.all([
    supabase.from('profiles').select('id, full_name, email, role, team, avatar_url, is_active').order('full_name'),
    supabase.from('tasks').select('assigned_to, status'),
  ])
  if (pErr) throw pErr
  if (tErr) throw tErr

  return (profiles ?? []).map(p => ({
    ...p,
    taskCount: (tasks ?? []).filter(t => t.assigned_to === p.id).length,
    completedCount: (tasks ?? []).filter(t => t.assigned_to === p.id && t.status === 'completed').length,
  }))
}
