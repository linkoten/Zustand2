import { getBlogPosts } from "@/lib/actions/blogActions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PenTool,
  Plus,
  TrendingUp,
  Users,
  BookOpen,
  Sparkles,
  ArrowRight,
  Search,
  Filter,
  Star,
  Heart,
  MessageCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import BlogStats from "@/components/blog/blogStats";
import BlogSection from "@/components/blog/blogSection";
import { redirect } from "next/navigation";
import { getUserData } from "@/lib/actions/dashboardActions";
import { getDictionary } from "../dictionaries";

export default async function BlogPage({
  searchParams,
  params,
}: {
  params: Promise<{ lang: "en" | "fr" }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    tag?: string;
  }>;
}) {
  const { lang } = await params;

  const dict = await getDictionary(lang);
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserData(userId);

  if (!user) {
    redirect("/sign-in");
  }

  const resolvedSearchParams = await searchParams;

  const page = parseInt(resolvedSearchParams.page || "1");
  const search = resolvedSearchParams.search;
  const category = resolvedSearchParams.category;
  const tag = resolvedSearchParams.tag;

  // Récupérer les données initiales du blog
  const initialBlogData = await getBlogPosts(page, {
    search,
    category,
    tag,
  });

  // Vérifier si l'utilisateur peut créer des articles
  const canCreatePost = user.role === "ADMIN";

  // Préparer les stats initiales
  const initialStats = {
    totalPosts: initialBlogData.totalPosts,
    currentPagePosts: initialBlogData.posts.length,
    totalPages: initialBlogData.totalPages,
    currentPage: initialBlogData.currentPage,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section Ultra Moderne */}
        <div className="relative mb-12 overflow-hidden">
          {/* Background décoratif */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 rounded-3xl" />
          <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-2xl" />
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-green-400/20 to-teal-500/20 rounded-full blur-xl" />

          <div className="relative p-8 md:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              {/* Section titre premium */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl blur-lg opacity-30" />
                    <div className="relative bg-gradient-to-r from-amber-500 to-orange-600 p-4 rounded-2xl shadow-xl">
                      <PenTool className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200 mb-2">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Blog Paleolitho
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
                    <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                      {dict.blog.title}
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                      Paleontologie
                    </span>
                  </h1>

                  <p className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed">
                    {dict.blog.heroSubtitle || dict.blog.subtitle}
                  </p>

                  {/* Quick stats badges */}
                  <div className="flex flex-wrap gap-3 mt-6">
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-slate-700">
                        {initialStats.totalPosts}{" "}
                        {dict.blog.postLabel || "articles"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-slate-700">
                        {dict.blog.communityActive || "Communauté active"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-semibold text-slate-700">
                        {dict.blog.newDiscoveries || "Nouvelles découvertes"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions et CTA */}
              <div className="flex flex-col items-center lg:items-end gap-4">
                {canCreatePost && (
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-700 hover:via-orange-700 hover:to-red-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
                  >
                    <Link
                      href={`/${lang}/blog/create`}
                      className="flex items-center gap-3"
                    >
                      <div className="relative">
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                      </div>
                      <span>{dict.blog.create}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </Button>
                )}

                {/* Quick actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl hover:bg-slate-50 border-slate-200"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {dict.blog.search || "Rechercher"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl hover:bg-slate-50 border-slate-200"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    {dict.blog.filter || "Filtrer"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques premium avec animations */}
        <div className="mb-8">
          <BlogStats initialStats={initialStats} lang={lang} dict={dict} />
        </div>

        {/* Section dynamique avec filtres et articles */}
        <div className="mb-12">
          <BlogSection initialData={initialBlogData} lang={lang} dict={dict} />
        </div>

        {/* Sections supplémentaires si aucun filtre actif */}
        {!search && !category && !tag && page === 1 && (
          <div className="space-y-12">
            {/* Section catégories repensée */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-stone-100/50 to-amber-100/50 rounded-3xl" />
              <div className="relative p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl shadow-lg">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    {dict.blog.exploreCategories}
                  </h2>
                  <p className="text-slate-600 max-w-2xl mx-auto">
                    {lang === "fr"
                      ? "Explorez nos différentes catégories pour découvrir des articles passionnants sur la paléontologie"
                      : "Explore our different categories to discover fascinating articles on paleontology"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      name: dict.blog.blogList.categoryPaleontology,
                      icon: "🦕",
                      slug: "PALEONTOLOGIE",
                      color: "from-green-500 to-emerald-600",
                      bgColor: "from-green-50 to-emerald-50",
                      description: "Découvertes fossiles",
                    },
                    {
                      name: dict.blog.blogList.categoryDiscovery,
                      icon: "🔍",
                      slug: "DECOUVERTE",
                      color: "from-blue-500 to-cyan-600",
                      bgColor: "from-blue-50 to-cyan-50",
                      description: "Nouvelles trouvailles",
                    },
                    {
                      name: dict.blog.blogList.categoryGuides,
                      icon: "📖",
                      slug: "GUIDE_COLLECTION",
                      color: "from-purple-500 to-violet-600",
                      bgColor: "from-purple-50 to-violet-50",
                      description: "Conseils pratiques",
                    },
                    {
                      name: dict.blog.blogList.categoryHistory,
                      icon: "🌍",
                      slug: "HISTOIRE_GEOLOGIQUE",
                      color: "from-orange-500 to-red-600",
                      bgColor: "from-orange-50 to-red-50",
                      description: "Histoire de la Terre",
                    },
                  ].map((cat, index) => (
                    <Link
                      key={cat.slug}
                      href={`/${lang}/blog?category=${cat.slug}`}
                      className="group relative overflow-hidden"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${cat.bgColor} rounded-2xl transition-all duration-300 group-hover:scale-105`}
                      />
                      <div className="relative p-6 h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className={`p-3 bg-gradient-to-r ${cat.color} rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300`}
                          >
                            <span className="text-2xl">{cat.icon}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
                              {cat.name}
                            </h3>
                            <p className="text-sm text-slate-600 mt-1">
                              {cat.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-auto flex items-center justify-between">
                          <Badge
                            variant="secondary"
                            className="bg-white/80 text-slate-700"
                          >
                            {dict.blog.explorer || "Explorer"}
                          </Badge>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Section fonctionnalités */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl group-hover:from-blue-100 group-hover:to-indigo-150 transition-all duration-300" />
                <div className="relative p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Articles favoris</h3>
                  <p className="text-slate-600 text-sm">
                    {dict.blog.favoriteArticlesDesc ||
                      "Sauvegardez vos articles préférés pour les relire plus tard"}
                  </p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl group-hover:from-green-100 group-hover:to-emerald-150 transition-all duration-300" />
                <div className="relative p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Commentaires</h3>
                  <p className="text-slate-600 text-sm">
                    {dict.blog.commentsDesc ||
                      "Participez aux discussions avec notre communauté passionnée"}
                  </p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl group-hover:from-purple-100 group-hover:to-violet-150 transition-all duration-300" />
                <div className="relative p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Notifications</h3>
                  <p className="text-slate-600 text-sm">
                    {dict.blog.notificationsDesc ||
                      "Restez informé des nouveaux articles et découvertes"}
                  </p>
                </div>
              </div>
            </div>

            {/* Call to action premium */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/90 via-purple-500/90 to-indigo-600/90 rounded-3xl" />

              {/* Éléments décoratifs */}
              <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />

              <div className="relative p-8 md:p-12 text-center text-white">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <Star className="w-6 h-6 text-yellow-300" />
                    <Star className="w-6 h-6 text-yellow-300" />
                    <Star className="w-6 h-6 text-yellow-300" />
                  </div>

                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    {dict.blog.ctaTitle}
                  </h2>

                  <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                    {dict.blog.ctaText}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      asChild
                      size="lg"
                      className="bg-white text-purple-700 hover:bg-gray-100 font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      <Link
                        href={`/${lang}/fossiles`}
                        className="flex items-center gap-2"
                      >
                        <Sparkles className="w-5 h-5" />
                        {dict.blog.ctaFossils}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm font-bold px-8 py-4 rounded-xl"
                    >
                      <Link
                        href={`/${lang}/contact`}
                        className="flex items-center gap-2"
                      >
                        <MessageCircle className="w-5 h-5" />
                        {dict.blog.ctaContact}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
