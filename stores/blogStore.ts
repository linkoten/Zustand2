import { create } from "zustand";
import { BlogListProps } from "@/types/blogType";
import { getBlogPosts } from "@/lib/actions/blogActions";

interface BlogFilters {
  search?: string;
  category?: string;
  tag?: string;
  page: number;
}

interface BlogState {
  // État
  blogData: BlogListProps;
  isLoading: boolean;
  filters: BlogFilters;

  // Actions
  setBlogData: (data: BlogListProps) => void;
  setLoading: (loading: boolean) => void;
  updateFilters: (newFilters: Partial<BlogFilters>) => void;
  loadBlogData: (filters: BlogFilters) => Promise<void>;
  resetFilters: () => void;
}

const initialBlogData: BlogListProps = {
  posts: [],
  totalPages: 0,
  currentPage: 1,
  totalPosts: 0,
};

const initialFilters: BlogFilters = {
  page: 1,
};

export const useBlogStore = create<BlogState>((set, get) => ({
  // État initial
  blogData: initialBlogData,
  isLoading: false,
  filters: initialFilters,

  // Actions
  setBlogData: (data) => set({ blogData: data }),

  setLoading: (loading) => set({ isLoading: loading }),

  updateFilters: (newFilters) => {
    const currentFilters = get().filters;
    const updatedFilters = { ...currentFilters, ...newFilters };

    // Reset page to 1 when changing filters (except page itself)
    if (
      newFilters.search !== undefined ||
      newFilters.category !== undefined ||
      newFilters.tag !== undefined
    ) {
      updatedFilters.page = 1;
    }

    set({ filters: updatedFilters });

    // Auto-load data with new filters
    get().loadBlogData(updatedFilters);
  },

  loadBlogData: async (filters) => {
    set({ isLoading: true });

    try {
      console.log("🔄 Chargement blog avec filtres:", filters);

      const data = await getBlogPosts(filters.page, {
        search: filters.search,
        category: filters.category,
        tag: filters.tag,
      });

      console.log("✅ Données blog chargées:", data);

      set({
        blogData: data,
        filters: { ...filters, page: data.currentPage },
      });
    } catch (error) {
      console.error("❌ Erreur chargement blog:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  resetFilters: () => {
    const resetFilters = { page: 1 };
    set({ filters: resetFilters });
    get().loadBlogData(resetFilters);
  },
}));
