import { create } from 'zustand'
import { User } from '@/types/user'

interface UserStore {
  user: User | null
  hydrated: boolean
  setUser: (user: User) => void
  clearUser: () => void
  hydrate: () => void
}

export const useUserStore = create<UserStore>()((set) => ({
  user: null,
  hydrated: false,
  setUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wellness-user', JSON.stringify(user))
    }
    set({ user })
  },
  clearUser: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wellness-user')
    }
    set({ user: null })
  },
  hydrate: () => {
    if (typeof window === 'undefined') return
    try {
      const stored = localStorage.getItem('wellness-user')
      set({ user: stored ? JSON.parse(stored) : null, hydrated: true })
    } catch {
      set({ hydrated: true })
    }
  },
}))
