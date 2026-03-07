'use client'

import { useEffect } from 'react'
import { useUserStore } from '@/stores/userStore'

export function HydrationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useUserStore.getState().hydrate()
  }, [])
  return <>{children}</>
}
