import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Analyst' | 'User';
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  theme: 'light' | 'dark' | 'system';
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      theme: 'system',
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setTheme: (theme) => set({ theme }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'ocr-app-storage',
    }
  )
);
