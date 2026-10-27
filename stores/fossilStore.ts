import { create } from "zustand";
import {
  getFossils,
  getFossilCatalogIndex,
} from "@/lib/actions/productActions";
import { SerializedProduct } from "@/types/type";
import { SearchParams } from "@/types/productType";

export interface FossilFilters extends SearchParams {
  page?: string;
}

interface FossilData {
  fossils: SerializedProduct[];
  totalCount: number;
  page: number;
  totalPages: number;
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
    page?: number,
  ) => Promise<void>;
  resetFilters: () => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  goToPage: (page: number) => void;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_MAX_ENTRIES = 30;
const pageCache = new Map<string, { data: FossilData; at: number }>();
let latestRequestId = 0;

const buildCacheKey = (filters: FossilFilters, userId: string | null | undefined, page: number) =>
  JSON.stringify({
    f: Object.entries(filters)
      .filter(([, v]) => v !== undefined && v !== "")
      .sort(([a], [b]) => a.localeCompare(b)),
    u: userId ?? null,
    p: page,
  });

const storePage = (key: string, data: FossilData) => {
  if (pageCache.size >= CACHE_MAX_ENTRIES) {
    pageCache.delete(pageCache.keys().next().value as string);
  }
  pageCache.set(key, { data, at: Date.now() });
};

// Précharge une page en arrière-plan pour que la navigation soit instantanée
const prefetchPage = (
  filters: FossilFilters,
  userId: string | null | undefined,
  page: number,
) => {
  const key = buildCacheKey(filters, userId, page);
  const cached = pageCache.get(key);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return;
  getFossils({ ...filters, page: String(page) }, userId, 20)
    .then((data) => storePage(key, data))
    .catch(() => {});
};

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
    page: 1,
    totalPages: 1,
    hasNextPage: false,
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

    // Un changement de filtre (hors page) ramène toujours à la page 1
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
    });

    if (Object.keys(newFilters).length > 0) {
      const userId = get().userId;
      const targetPage = isFilterChange
        ? 1
        : Number(newFilters.page) || get().fossilData.page || 1;
      get().loadFossilData(updatedFilters, userId, targetPage);
    }
  },

  loadFossilData: async (filters, userId, page = 1) => {
    const requestId = ++latestRequestId;
    const key = buildCacheKey(filters, userId, page);
    const cached = pageCache.get(key);

    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      set({ fossilData: cached.data, isLoading: false });
      return;
    }

    set({ isLoading: true });

    try {
      const data = await getFossils({ ...filters, page: String(page) }, userId, 20);
      storePage(key, data);
      // Ignore les réponses obsolètes si un autre filtre a été demandé entre-temps
      if (requestId === latestRequestId) {
        set({ fossilData: data, isLoading: false });
        if (data.hasNextPage) prefetchPage(filters, userId, page + 1);
        if (page > 1) prefetchPage(filters, userId, page - 1);
      }
    } catch (error) {
      console.error("Failed to load fossil data", error);
      if (requestId === latestRequestId) set({ isLoading: false });
    }
  },

  resetFilters: () => {
    const newFilters = {};
    set({ filters: newFilters });
    const userId = get().userId;
    get().loadFossilData(newFilters, userId, 1);
  },

  goToNextPage: () => {
    const { fossilData, filters, userId } = get();
    if (!fossilData.hasNextPage) return;
    get().loadFossilData(filters, userId, fossilData.page + 1);
  },

  goToPrevPage: () => {
    const { fossilData, filters, userId } = get();
    if (fossilData.page <= 1) return;
    get().loadFossilData(filters, userId, fossilData.page - 1);
  },

  goToPage: (page) => {
    const { filters, userId, fossilData } = get();
    const target = Math.max(1, Math.min(page, fossilData.totalPages || 1));
    get().loadFossilData(filters, userId, target);
  },
}));
