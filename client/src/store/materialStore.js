import { create } from 'zustand'
import { getAllMaterials } from '../api/index.js'

export const useMaterialStore = create((set, get) => ({
  all: [], loading: false, loaded: false,

  fetchAll: async () => {
    if (get().loaded) return
    set({ loading: true })
    try {
      const res = await getAllMaterials()
      set({ all: res.data.materials, loaded: true })
    } catch(e) { console.error(e) }
    finally { set({ loading: false }) }
  },

  addMaterial:    (m)  => set(s => ({ all: [m, ...s.all] })),
  removeMaterial: (id) => set(s => ({ all: s.all.filter(m => m._id !== id) })),
  updateMaterial: (id, updates) => set(s => ({
    all: s.all.map(m => m._id === id ? { ...m, ...updates } : m)
  })),
  invalidate: () => set({ loaded: false, all: [] })
}))
