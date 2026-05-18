import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentWorker {
  id: string;
  name: string;
  skill?: string;
  photo?: string | null;
  rating?: number;
  viewedAt: number;
}

interface RecentlyViewedState {
  workers: RecentWorker[];
  add: (w: Omit<RecentWorker, 'viewedAt'>) => void;
  clear: () => void;
}

export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      workers: [],
      add: (w) => set((s) => {
        const without = s.workers.filter((x) => x.id !== w.id);
        return { workers: [{ ...w, viewedAt: Date.now() }, ...without].slice(0, 5) };
      }),
      clear: () => set({ workers: [] }),
    }),
    { name: 'seva_recently_viewed' }
  )
);
