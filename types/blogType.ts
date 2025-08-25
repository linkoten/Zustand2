import { BlogCategory, BlogStatus } from "@/lib/generated/prisma";
import { BlogListItem } from "./type";

export interface BlogFilters {
  category?: BlogCategory;
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BlogResult {
  articles: BlogListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface CreateArticleData {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  imageAlt?: string;
  category: BlogCategory;
  status: BlogStatus;
  publishedAt?: Date;
  readTime?: number;
  seoTitle?: string;
  seoDescription?: string;
  tagIds: string[];
}

// ✅ Nouveau type de post basé sur les données de la page
export interface BlogPost {
  id: string; // ✅ String selon votre schéma
  title: string;
  excerpt: string | null;
  slug: string;
  category: BlogCategory;
  tags: string[];
  featuredImage: string | null;
  publishedAt: string;
  readTime: number | null;
  author: {
    name: string | null; // ✅ name au lieu de firstName/lastName
  };
}

// ✅ Nouvelle interface qui correspond aux props de la page
export interface BlogListProps {
  posts: BlogPost[];
  totalPages: number;
  currentPage: number;
  totalPosts: number;
}

export interface BlogCardProps {
  article: BlogListItem;
}

export interface BlogContentProps {
  content: string;
}

export interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

// ✅ Types basés sur le schéma Prisma réel
export interface EditableBlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  slug: string;
  category: BlogCategory;
  tags: string[]; // ✅ Array de noms de tags
  featuredImage: string | null;
  imageAlt: string | null;
  status: BlogStatus;
  readTime: number | null;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface EditBlogFormProps {
  post: EditableBlogPost;
}

export interface RelatedArticlesProps {
  currentArticleId: string;
  category: BlogCategory;
  tags: string[];
}

export interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export interface ShareButtonsProps {
  title: string;
  url: string;
  description?: string;
}
