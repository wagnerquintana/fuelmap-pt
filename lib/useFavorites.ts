'use client'

import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'

export function useFavorites(user: User | null) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user) { setFavorites(new Set()); return }

    supabase
      .from('favorites')
      .select('station_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) setFavorites(new Set(data.map(f => f.station_id)))
      })
  }, [user])

  async function toggleFavorite(stationId: string): Promise<void> {
    if (!user) return

    if (favorites.has(stationId)) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('station_id', stationId)
      setFavorites(prev => { const s = new Set(prev); s.delete(stationId); return s })
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, station_id: stationId })
      setFavorites(prev => new Set(prev).add(stationId))
    }
  }

  return { favorites, toggleFavorite }
}
