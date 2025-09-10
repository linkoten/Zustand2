"use client";

import { useBlogStore } from "@/stores/blogStore";

interface BlogStatsProps {
  initialStats: {
    totalPosts: number;
    currentPagePosts: number;
    totalPages: number;
    currentPage: number;
  };
  lang: "fr" | "en";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}
export default function BlogStats({
  initialStats,
  lang,
  dict,
}: BlogStatsProps) {
  const { blogData, isLoading } = useBlogStore();

  // Utiliser les données du store ou les données initiales
  const stats = {
    totalPosts: blogData.totalPosts || initialStats.totalPosts,
    currentPagePosts: blogData.posts.length || initialStats.currentPagePosts,
    totalPages: blogData.totalPages || initialStats.totalPages,
    currentPage: blogData.currentPage || initialStats.currentPage,
  };

  return (
    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
        <div className="text-2xl font-bold text-blue-600">
          {stats.totalPosts}
        </div>
        <div className="text-sm text-blue-600/80">
          {dict.blog.blogStats.statsTotalPosts || "Articles publiés"}
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
          </div>
        )}
        <div className="text-2xl font-bold text-green-600">
          {stats.currentPagePosts}
        </div>
        <div className="text-sm text-green-600/80">
          {dict.blog.blogStats.statsCurrentPagePosts || "Cette page"}
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
          </div>
        )}
        <div className="text-2xl font-bold text-purple-600">
          {stats.totalPages}
        </div>
        <div className="text-sm text-purple-600/80">
          {dict.blog.blogStats.statsTotalPages || "Pages"}
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
          </div>
        )}
        <div className="text-2xl font-bold text-amber-600">
          {stats.currentPage}
        </div>
        <div className="text-sm text-amber-600/80">
          {dict.blog.blogStats.statsCurrentPage || "Page actuelle"}
        </div>
      </div>
    </div>
  );
}
