import { supabase } from './supabaseClient'

export async function getProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  return { data, error }
}

export async function getAllProfiles() {
  const { data, error } = await supabase.from('profiles').select('*').order('full_name')
  return { data, error }
}

export async function getProfilesByTeam(team) {
  const { data, error } = await supabase.from('profiles').select('*').eq('team', team).order('full_name')
  return { data, error }
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single()
  return { data, error }
}

export async function getProfilesWithTaskCount() {
  const { data: profiles, error } = await supabase.from('profiles').select('*').order('full_name')
  if (error) return { data: null, error }

  const { data: tasks } = await supabase.from('tasks').select('assigned_to')

  const enriched = profiles.map(p => ({
    ...p,
    taskCount: tasks ? tasks.filter(t => t.assigned_to === p.id).length : 0
  }))

  return { data: enriched, error: null }
}

export async function createMemberProfile({ fullName, email, password, role = 'member', team }) {
  // Sign up via standard auth, then update profile
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name: fullName, role } }
  })
  if (authError) return { data: null, error: authError }

  if (authData.user) {
    // Upsert profile with team assignment
    await supabase.from('profiles').upsert({
      id: authData.user.id, full_name: fullName, email, role, team
    })
  }
  return { data: authData, error: null }
}

export async function removeProfileTeam(userId) {
  const { data, error } = await supabase
    .from('profiles').update({ team: null }).eq('id', userId).select().single()
  return { data, error }
}

export async function deleteProfile(userId) {
  const { data, error } = await supabase.from('profiles').delete().eq('id', userId)
  return { data, error }
}
