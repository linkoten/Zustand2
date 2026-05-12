import { create } from "zustand";
import {
  getFossils,
  getFossilCatalogIndex,
} from "@/lib/actions/productActions";
import { SerializedProduct } from "@/types/type";
import { SearchParams } from "@/types/productType";

export interface FossilFilters extends SearchParams {}

interface FossilData {
  fossils: SerializedProduct[];
  totalCount: number;
  nextCursor: number | null;
  hasNextPage: boolean;
}

interface FossilState {
  catalogIndex: any[];
  facets: {
    categories: Record<string, number>;
    countries: Record<string, number>;
    localities: Record<string, number>;
    periods: Record<string, number>;
    stages: Record<string, number>;
  };
  loadCatalogIndex: (preloaded?: Record<string, string | null>[]) => Promise<void>;
  fossilData: FossilData;
  isLoading: boolean;
  filters: FossilFilters;
  userId?: string | null;

  setFossilData: (data: FossilData) => void;
  setLoading: (loading: boolean) => void;
  setUserId: (id: string | null) => void;
  setInitialFilters: (filters: FossilFilters) => void;
  updateFilters: (newFilters: Partial<FossilFilters>) => void;
  loadFossilData: (
    filters: FossilFilters,
    userId?: string | null,
    cursor?: number | null,
  ) => Promise<void>;
  resetFilters: () => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  cursorHistory: (number | null)[];
}

export const useFossilStore = create<FossilState>((set, get) => ({
  catalogIndex: [],
  facets: {
    categories: {},
    countries: {},
    localities: {},
    periods: {},
    stages: {},
  },
  loadCatalogIndex: async (preloaded?) => {
    try {
      const index = preloaded ?? await getFossilCatalogIndex();
      set({ catalogIndex: index });
      // Trigger facet recomputation with current filters safely
      get().updateFilters({});
    } catch (e) {
      console.error("Failed to load catalog index", e);
    }
  },
  fossilData: {
    fossils: [],
    totalCount: 0,
    nextCursor: null,
    hasNextPage: false,
  },
  cursorHistory: [null],
  isLoading: false,
  filters: {},
  userId: null,

  setFossilData: (data) => set({ fossilData: data }),
  setLoading: (loading) => set({ isLoading: loading }),
  setUserId: (id) => set({ userId: id }),

  setInitialFilters: (filters) => set({ filters }),

  updateFilters: (newFilters) => {
    const currentFilters = get().filters;
    const updatedFilters = { ...currentFilters, ...newFilters };

    // Reset cursor history when filters change (not during navigation)
    const isFilterChange =
      Object.keys(newFilters).length > 0 &&
      Object.keys(newFilters).some((key) => key !== "page");

    // Compute facets
    const idx = get().catalogIndex;
    const newFacets: any = {
      categories: {},
      countries: {},
      localities: {},
      periods: {},
      stages: {},
    };

    idx.forEach((p: any) => {
      // Evaluates if array contains an element or true if the array is empty/undefined
      const containsOrEmpty = (
        filterVal: string | undefined,
        optionVal: string,
      ) => {
        if (!filterVal || filterVal.trim() === "") return true;
        return filterVal.split(",").includes(optionVal);
      };

      // Check matches for every other category, to see if the current category should be available
      const canMc =
        containsOrEmpty(updatedFilters.countryOfOrigin, p.countryOfOrigin) &&
        containsOrEmpty(updatedFilters.locality, p.locality) &&
        containsOrEmpty(updatedFilters.geologicalPeriod, p.geologicalPeriod) &&
        containsOrEmpty(updatedFilters.geologicalStage, p.geologicalStage);
      if (canMc && p.category)
        newFacets.categories[p.category] =
          (newFacets.categories[p.category] || 0) + 1;

      const canMco =
        containsOrEmpty(updatedFilters.category, p.category) &&
        containsOrEmpty(updatedFilters.locality, p.locality) &&
        containsOrEmpty(updatedFilters.geologicalPeriod, p.geologicalPeriod) &&
        containsOrEmpty(updatedFilters.geologicalStage, p.geologicalStage);
      if (canMco && p.countryOfOrigin)
        newFacets.countries[p.countryOfOrigin] =
          (newFacets.countries[p.countryOfOrigin] || 0) + 1;

      const canMl =
        containsOrEmpty(updatedFilters.category, p.category) &&
        containsOrEmpty(updatedFilters.countryOfOrigin, p.countryOfOrigin) &&
        containsOrEmpty(updatedFilters.geologicalPeriod, p.geologicalPeriod) &&
        containsOrEmpty(updatedFilters.geologicalStage, p.geologicalStage);
      if (canMl && p.locality)
        newFacets.localities[p.locality] =
          (newFacets.localities[p.locality] || 0) + 1;

      const canMp =
        containsOrEmpty(updatedFilters.category, p.category) &&
        containsOrEmpty(updatedFilters.countryOfOrigin, p.countryOfOrigin) &&
        containsOrEmpty(updatedFilters.locality, p.locality) &&
        containsOrEmpty(updatedFilters.geologicalStage, p.geologicalStage);
      if (canMp && p.geologicalPeriod)
        newFacets.periods[p.geologicalPeriod] =
          (newFacets.periods[p.geologicalPeriod] || 0) + 1;

      const canMs =
        containsOrEmpty(updatedFilters.category, p.category) &&
        containsOrEmpty(updatedFilters.countryOfOrigin, p.countryOfOrigin) &&
        containsOrEmpty(updatedFilters.locality, p.locality) &&
        containsOrEmpty(updatedFilters.geologicalPeriod, p.geologicalPeriod);
      if (canMs && p.geologicalStage)
        newFacets.stages[p.geologicalStage] =
          (newFacets.stages[p.geologicalStage] || 0) + 1;
    });

    set({
      filters: updatedFilters,
      facets: newFacets,
      ...(isFilterChange ? { cursorHistory: [null] } : {}),
    });

    if (Object.keys(newFilters).length > 0) {
      const userId = get().userId;
      // Auto-load data with new filters (cursor reset to page 1)
      get().loadFossilData(updatedFilters, userId);
    }
  },

  loadFossilData: async (filters, userId, cursor) => {
    set({ isLoading: true });

    try {
      const data = await getFossils(filters, userId, cursor, 20);
      set({ fossilData: data, isLoading: false });
    } catch (error) {
      console.error("Failed to load fossil data", error);
      set({ isLoading: false });
    }
  },

  resetFilters: () => {
    const newFilters = {};
    set({ filters: newFilters, cursorHistory: [null] });
    const userId = get().userId;
    get().loadFossilData(newFilters, userId);
  },

  goToNextPage: () => {
    const { fossilData, filters, userId, cursorHistory } = get();
    if (!fossilData.hasNextPage || fossilData.nextCursor == null) return;
    const newHistory = [...cursorHistory, fossilData.nextCursor];
    set({ cursorHistory: newHistory });
    get().loadFossilData(filters, userId, fossilData.nextCursor);
  },

  goToPrevPage: () => {
    const { cursorHistory, filters, userId } = get();
    if (cursorHistory.length <= 1) return;
    const newHistory = cursorHistory.slice(0, -1);
    const prevCursor = newHistory[newHistory.length - 1];
    set({ cursorHistory: newHistory });
    get().loadFossilData(filters, userId, prevCursor ?? undefined);
  },
}));
