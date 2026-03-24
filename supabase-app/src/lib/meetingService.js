import { supabase } from './supabaseClient'

export async function getMeetings() {
  const { data, error } = await supabase
    .from('meetings')
    .select(`*, creator:profiles!meetings_created_by_fkey(id, full_name, avatar_url)`)
    .order('scheduled_at', { ascending: true })
  return { data, error }
}

export async function getUpcomingMeetings(limit = 3) {
  const { data, error } = await supabase
    .from('meetings')
    .select(`*, creator:profiles!meetings_created_by_fkey(id, full_name, avatar_url)`)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(limit)
  return { data, error }
}

export async function createMeeting({ title, scheduledAt, meetingLink }) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { data: null, error: new Error('Not authenticated') }

  const { data, error } = await supabase
    .from('meetings')
    .insert({ title, scheduled_at: scheduledAt, meeting_link: meetingLink, created_by: session.user.id })
    .select(`*, creator:profiles!meetings_created_by_fkey(id, full_name, avatar_url)`)
    .single()
  return { data, error }
}

export async function deleteMeeting(meetingId) {
  const { error } = await supabase.from('meetings').delete().eq('id', meetingId)
  return { error }
}

export function subscribeToMeetings(callback) {
  return supabase
    .channel('realtime-meetings')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'meetings' }, callback)
    .subscribe()
}
