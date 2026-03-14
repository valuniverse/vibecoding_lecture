'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores/userStore'
import { analyticsPromise } from '@/lib/firebase'

export function HydrationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    analyticsPromise // Analytics 초기화 트리거

    const loadProfile = async (userId: string) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (profile) {
        useUserStore.getState().setUser({
          id: profile.id,
          nickname: profile.nickname,
          goal: profile.goal,
          level: profile.level,
          cautionParts: profile.caution_parts ?? [],
        })
      } else {
        useUserStore.getState().clearUser()
      }
    }

    // 초기 세션 확인
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) loadProfile(user.id)
      else useUserStore.getState().clearUser()
    })

    // 로그인/로그아웃 이벤트 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) loadProfile(session.user.id)
        else useUserStore.getState().clearUser()
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return <>{children}</>
}
