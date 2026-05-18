/**
 * FAVORITE WORKERS — localStorage-persisted Zustand store
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesStore {
  favorites: string[]; // worker IDs
  toggle: (workerId: string) => void;
  isFav: (workerId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],

      toggle: (workerId) =>
        set((s) => ({
          favorites: s.favorites.includes(workerId)
            ? s.favorites.filter((id) => id !== workerId)
            : [...s.favorites, workerId],
        })),

      isFav: (workerId) => get().favorites.includes(workerId),
    }),
    { name: 'seva_favorites' }
  )
);
