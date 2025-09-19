"use client";

import { useBlogStore } from "@/stores/blogStore";
import {
  BookOpen,
  FileText,
  Layers,
  TrendingUp,
  BarChart3,
  Activity,
  Zap,
} from "lucide-react";

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

  const statsConfig = [
    {
      value: stats.totalPosts,
      label: dict.blog.blogStats.statsTotalPosts,
      icon: BookOpen,
      gradient: "from-blue-500 to-cyan-600",
      bgGradient: "from-blue-50 to-cyan-50",
      color: "text-blue-600",
      borderColor: "border-blue-200",
      glowColor: "blue-400",
    },
    {
      value: stats.currentPagePosts,
      label: dict.blog.blogStats.statsCurrentPagePosts,
      icon: FileText,
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50",
      color: "text-green-600",
      borderColor: "border-green-200",
      glowColor: "green-400",
    },
    {
      value: stats.totalPages,
      label: dict.blog.blogStats.statsTotalPages,
      icon: Layers,
      gradient: "from-purple-500 to-violet-600",
      bgGradient: "from-purple-50 to-violet-50",
      color: "text-purple-600",
      borderColor: "border-purple-200",
      glowColor: "purple-400",
    },
    {
      value: stats.currentPage,
      label: dict.blog.blogStats.statsCurrentPage,
      icon: TrendingUp,
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-50 to-orange-50",
      color: "text-amber-600",
      borderColor: "border-amber-200",
      glowColor: "amber-400",
    },
  ];

  return (
    <div className="relative">
      {/* Background décoratif */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-50/50 via-white to-blue-50/50 rounded-3xl" />

      <div className="relative p-6">
        {/* Titre de section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              {dict.blog.blogStats.statsTitle || "Statistiques du blog"}
            </h2>
          </div>
          <p className="text-slate-600 max-w-md mx-auto">
            {dict.blog.blogStats.statsSubtitle ||
              "Aperçu en temps réel de l'activité et du contenu du blog"}
          </p>
        </div>

        {/* Grid des statistiques */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {statsConfig.map((stat, index) => (
            <div
              key={index}
              className="group relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background avec gradients */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} rounded-2xl transition-all duration-300 group-hover:scale-105`}
              />
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300`}
              />

              {/* Glow effect au hover */}
              <div
                className={`absolute inset-0 bg-${stat.glowColor}/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}
              />

              {/* Border subtile */}
              <div
                className={`absolute inset-0 border ${stat.borderColor} rounded-2xl group-hover:border-opacity-70 transition-all duration-300`}
              />

              {/* Contenu */}
              <div className="relative p-6 text-center">
                {/* Loading overlay */}
                {isLoading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                    <div className="flex items-center gap-2">
                      <div
                        className={`animate-spin rounded-full h-4 w-4 border-2 border-${stat.glowColor} border-t-transparent`}
                      />
                      <Activity className="w-4 h-4 text-slate-400 animate-pulse" />
                    </div>
                  </div>
                )}

                {/* Icône premium */}
                <div className="flex justify-center mb-4">
                  <div
                    className={`relative group-hover:scale-110 transition-transform duration-300`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} rounded-xl blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300`}
                    />
                    <div
                      className={`relative p-3 bg-gradient-to-r ${stat.gradient} rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300`}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                {/* Valeur avec animation */}
                <div
                  className={`text-3xl md:text-4xl font-black ${stat.color} mb-2 group-hover:scale-110 transition-transform duration-300`}
                >
                  <span className="tabular-nums">
                    {stat.value.toLocaleString(
                      lang === "fr" ? "fr-FR" : "en-US"
                    )}
                  </span>
                </div>

                {/* Label */}
                <div
                  className={`text-sm font-semibold ${stat.color} opacity-80 group-hover:opacity-100 transition-opacity duration-300`}
                >
                  {stat.label}
                </div>

                {/* Indicateur de performance */}
                <div className="mt-3 flex items-center justify-center gap-1">
                  <Zap className={`w-3 h-3 ${stat.color} opacity-60`} />
                  <div
                    className={`h-1 w-12 bg-gradient-to-r ${stat.gradient} rounded-full opacity-60 group-hover:opacity-80 transition-opacity duration-300`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Indicateur global de performance */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full px-6 py-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-slate-700">
                {isLoading
                  ? dict.blog.blogSection.loading || "Mise à jour..."
                  : dict.blog.blogStats.realTimeData || "Données en temps réel"}
              </span>
            </div>

            <div className="w-px h-4 bg-slate-300" />

            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Activity className="w-3 h-3" />
              <span>
                {dict.blog.blogStats.lastUpdate || "Dernière mise à jour"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
