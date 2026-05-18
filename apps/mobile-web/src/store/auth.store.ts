/**
 * AUTH STORE — Zustand
 * -------------------------------------------------
 * Global state — kahin se bhi access karo
 *
 * Use:
 *   const { user, token, setUser } = useAuthStore();
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  phone: string;

  setUser:  (user: User) => void;
  setToken: (token: string) => void;
  setPhone: (phone: string) => void;
  logout:   () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:  null,
      token: null,
      phone: '',

      setUser:  (user)  => set({ user }),
      setToken: (token) => set({ token }),
      setPhone: (phone) => set({ phone }),

      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('seva_token');
        localStorage.removeItem('seva_user');
        // Multi-tab sync — broadcast logout to other tabs
        try {
          if (typeof BroadcastChannel !== 'undefined') {
            const bc = new BroadcastChannel('seva_auth');
            bc.postMessage({ type: 'logout' });
            bc.close();
          }
        } catch {}
      },
    }),
    {
      name: 'seva-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
