import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CompareItem {
  id: number;
  title: string;
  price: number;
  category: string;
  species: string;
  genre: string;
  geologicalPeriod: string;
  geologicalStage: string;
  countryOfOrigin: string;
  weight: number;
  imageUrl: string | null;
}

interface CompareStore {
  items: CompareItem[];
  add: (item: CompareItem) => void;
  remove: (id: number) => void;
  clear: () => void;
  isSelected: (id: number) => boolean;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      items: [],

      add: (item) => {
        const { items } = get();
        if (items.length >= 3 || items.some((i) => i.id === item.id)) return;
        set({ items: [...items, item] });
      },

      remove: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      clear: () => set({ items: [] }),

      isSelected: (id) => get().items.some((i) => i.id === id),
    }),
    {
      name: "compare-fossils",
    },
  ),
);
