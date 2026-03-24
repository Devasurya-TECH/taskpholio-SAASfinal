import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function useRealtime(channelName, table, filter, callback) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table,
        ...(filter || {}),
      }, (payload) => callbackRef.current(payload))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [channelName, table])
}
