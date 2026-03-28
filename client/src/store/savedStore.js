import { create } from "zustand";
import { getSaved } from "../api/index.js";

const toIdSet = (materials) => new Set(materials.map((material) => material._id));

export const useSavedStore = create((set, get) => ({
  materials: [],
  savedIds: new Set(),
  loading: false,
  loaded: false,

  fetchSaved: async (force = false) => {
    if (get().loading && !force) return;

    set({ loading: true });
    try {
      const res = await getSaved();
      const materials = res.data.materials || [];
      set({
        materials,
        savedIds: toIdSet(materials),
        loaded: true,
      });
    } catch (err) {
      console.error(err);
    } finally {
      set({ loading: false });
    }
  },

  syncSavedMaterial: (material, saved) =>
    set((state) => {
      const savedIds = new Set(state.savedIds);
      let materials = state.materials;

      if (saved) {
        savedIds.add(material._id);
        if (!state.materials.some((item) => item._id === material._id)) {
          materials = [material, ...state.materials];
        }
      } else {
        savedIds.delete(material._id);
        materials = state.materials.filter((item) => item._id !== material._id);
      }

      return { savedIds, materials, loaded: true };
    }),
}));
