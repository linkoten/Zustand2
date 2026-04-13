import { create } from "zustand";
import {
  getFossils,
  getFossilCatalogIndex,
} from "@/lib/actions/productActions";
import { SerializedProduct } from "@/types/type";
import { SearchParams } from "@/types/productType";

export interface FossilFilters extends SearchParams {
  page?: string; // string per searchParams spec
}

interface FossilData {
  fossils: SerializedProduct[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
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
  loadCatalogIndex: () => Promise<void>;
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
  ) => Promise<void>;
  resetFilters: () => void;
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
  loadCatalogIndex: async () => {
    try {
      const index = await getFossilCatalogIndex();
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
    totalPages: 0,
    currentPage: 1,
  },
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

    // Reset page to 1 when changing filters (except if explicitly updating page, and skip for empty updates triggered by index load)
    if (
      Object.keys(newFilters).length > 0 &&
      Object.keys(newFilters).some((key) => key !== "page")
    ) {
      updatedFilters.page = "1";
    }

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

    set({ filters: updatedFilters, facets: newFacets });

    if (Object.keys(newFilters).length > 0) {
      const userId = get().userId;
      // Auto-load data with new filters but ONLY if filters really changed
      get().loadFossilData(updatedFilters, userId);
    }
  },

  loadFossilData: async (filters, userId) => {
    set({ isLoading: true });

    try {
      const page = parseInt(filters.page || "1", 10);
      const limit = 20;

      const data = await getFossils(filters, userId, page, limit);

      set({ fossilData: data, isLoading: false });
    } catch (error) {
      console.error("Failed to load fossil data", error);
      set({ isLoading: false });
    }
  },

  resetFilters: () => {
    const newFilters = { page: "1" };
    set({ filters: newFilters });
    const userId = get().userId;
    get().loadFossilData(newFilters, userId);
  },
}));
