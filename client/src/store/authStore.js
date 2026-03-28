import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user:  JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,

  setAuth: (token, user) => {
    localStorage.setItem('user',  JSON.stringify(user))
    localStorage.setItem('token', token)
    set({ user, token })
  },
  logout: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },
  updateUser: (updates) => set(state => {
    const user = { ...state.user, ...updates }
    localStorage.setItem('user', JSON.stringify(user))
    return { user }
  })
}))
