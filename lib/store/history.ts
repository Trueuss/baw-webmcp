'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HistoryEntry, OutfitReport, Outfit, StylistSuggestion } from '../types';
import { seedHistory } from '../mock/seed';

interface HistoryState {
  entries: HistoryEntry[];
  reports: OutfitReport[];
  outfits: Outfit[];
  suggestions: StylistSuggestion[];

  addEntry: (e: Omit<HistoryEntry, 'id' | 'ts'>) => void;
  saveReport: (r: OutfitReport) => void;
  saveOutfit: (o: Omit<Outfit, 'id' | 'createdAt'>) => Outfit;
  setSuggestionStatus: (id: string, status: StylistSuggestion['status']) => void;

  reset: () => void;
}

const newId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      entries: seedHistory(),
      reports: [],
      outfits: [],
      suggestions: [],

      addEntry: (e) => {
        const entry: HistoryEntry = { ...e, id: newId('h'), ts: Date.now() };
        set((s) => ({ entries: [entry, ...s.entries].slice(0, 200) }));
      },
      saveReport: (r) => set((s) => ({ reports: [r, ...s.reports].slice(0, 100) })),
      saveOutfit: (o) => {
        const outfit: Outfit = { ...o, id: newId('o'), createdAt: Date.now() };
        set((s) => ({ outfits: [outfit, ...s.outfits].slice(0, 50) }));
        return outfit;
      },
      setSuggestionStatus: (id, status) =>
        set((s) => ({
          suggestions: s.suggestions.map((sg) => (sg.id === id ? { ...sg, status } : sg))
        })),

      reset: () => set({ entries: seedHistory(), reports: [], outfits: [], suggestions: [] })
    }),
    { name: 'baw-history-v1', skipHydration: true }
  )
);

// Convenience selectors
export const selectReportsById = (id: string) => (s: HistoryState) =>
  s.reports.filter((r) => r.outfitId === id);
