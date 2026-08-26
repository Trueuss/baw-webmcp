'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Garment } from '../types';
import { seedGarments } from '../mock/seed';

interface WardrobeState {
  garments: Garment[];
  add: (g: Omit<Garment, 'id' | 'createdAt'>) => Garment;
  remove: (id: string) => void;
  rename: (id: string, name: string) => void;
  getById: (id: string) => Garment | undefined;
  reset: () => void;
}

const withId = (g: Omit<Garment, 'id' | 'createdAt'>): Garment => ({
  ...g,
  id: `g_${Math.random().toString(36).slice(2, 10)}`,
  createdAt: Date.now()
});

export const useWardrobeStore = create<WardrobeState>()(
  persist(
    (set, get) => ({
      garments: seedGarments(),
      add: (g) => {
        const garment = withId(g);
        set((s) => ({ garments: [garment, ...s.garments] }));
        return garment;
      },
      remove: (id) => set((s) => ({ garments: s.garments.filter((g) => g.id !== id) })),
      rename: (id, name) =>
        set((s) => ({ garments: s.garments.map((g) => (g.id === id ? { ...g, name } : g)) })),
      getById: (id) => get().garments.find((g) => g.id === id),
      reset: () => set({ garments: seedGarments() })
    }),
    {
      name: 'baw-wardrobe-v1',
      // Avoid SSR/CSR mismatch: only rehydrate on the client.
      skipHydration: true
    }
  )
);
