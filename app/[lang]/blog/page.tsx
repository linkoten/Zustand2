import { getBlogPosts, getBlogCategories, getFeaturedArticle } from "@/lib/actions/blogActions";
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
import BlogSection from "@/components/blog/blogSection";
import { redirect } from "next/navigation";
import { getOrSyncUser } from "@/lib/actions/dashboardActions";
import { getDictionary } from "../dictionaries";
import BlogPageClient from "@/components/blog/blogPageClient";

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
    redirect(`/${lang}/sign-in`);
  }

  const user = await getOrSyncUser(userId);

  if (!user) {
    redirect(`/${lang}/sign-in`);
  }

  const resolvedSearchParams = await searchParams;

  const page = parseInt(resolvedSearchParams.page || "1");
  const search = resolvedSearchParams.search;
  const category = resolvedSearchParams.category;
  const tag = resolvedSearchParams.tag;

  const [categories, initialBlogData, featuredArticle] = await Promise.all([
    getBlogCategories(),
    getBlogPosts(page, { search, category, tag }),
    getFeaturedArticle(),
  ]);

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section Ultra Moderne */}
        <div className="relative mb-12 overflow-hidden">
          {/* Background décoratif */}
          <div className="absolute inset-0 bg-gradient-to-r from-terracotta/10 via-amber-500/10 to-orange-500/10 rounded-3xl" />
          <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-2xl" />
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-green-400/10 to-teal-500/10 rounded-full blur-xl" />

          <div className="relative p-8 md:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              {/* Section titre premium */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <img
                      src="/logo.svg"
                      alt="Logo Paleolitho"
                      className="w-16 h-16 drop-shadow-[0_0_15px_rgba(205,92,60,0.6)]"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
                    <span className="bg-gradient-to-r from-parchemin via-amber-200 to-terracotta bg-clip-text text-transparent">
                      {dict.blog.title}
                    </span>
                  </h1>

                  <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                    {dict.blog.heroSubtitle || dict.blog.subtitle}
                  </p>

                  {/* Quick stats badges */}
                  <div className="flex flex-wrap gap-3 mt-6">
                    <div className="flex items-center gap-2 bg-card/60 border border-border/50 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                      <BookOpen className="w-4 h-4 text-terracotta" />
                      <span className="text-sm font-semibold text-card-foreground">
                        {initialStats.totalPosts}{" "}
                        {dict.blog.postLabel || "articles"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-card/60 border border-border/50 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                      <Users className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold text-card-foreground">
                        {dict.blog.communityActive || "Communauté active"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-card/60 border border-border/50 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                      <TrendingUp className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-semibold text-card-foreground">
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

                {/* Quick actions avec scroll vers les éléments */}
                <BlogPageClient
                  searchLabel={dict.blog.search || "Rechercher"}
                  filterLabel={dict.blog.filter || "Filtrer"}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Article à la une */}
        {featuredArticle && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-sm font-bold uppercase tracking-widest text-amber-400">
                Article à la une
              </span>
            </div>
            <Link
              href={`/${lang}/blog/${featuredArticle.slug}`}
              className="group relative flex flex-col md:flex-row overflow-hidden rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              {featuredArticle.featuredImage && (
                <div className="relative w-full md:w-80 h-56 md:h-auto flex-shrink-0 overflow-hidden">
                  <img
                    src={featuredArticle.featuredImage}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              )}
              <div className="flex flex-col justify-center p-6 md:p-8 gap-3">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-terracotta/20 text-terracotta border-terracotta/30 text-xs">
                    {featuredArticle.category}
                  </Badge>
                  {featuredArticle.tags.slice(0, 2).map((t) => (
                    <Badge key={t.name} variant="outline" className="text-xs">
                      {t.name}
                    </Badge>
                  ))}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-parchemin group-hover:text-terracotta transition-colors duration-200 leading-tight">
                  {featuredArticle.title}
                </h2>
                {featuredArticle.excerpt && (
                  <p className="text-muted-foreground leading-relaxed line-clamp-3">
                    {featuredArticle.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  {featuredArticle.author?.name && (
                    <span>par {featuredArticle.author.name}</span>
                  )}
                  {featuredArticle.publishedAt && (
                    <span>
                      {new Date(featuredArticle.publishedAt).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                  )}
                  {featuredArticle.readTime && (
                    <span>{featuredArticle.readTime} min de lecture</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2 text-terracotta font-semibold text-sm group-hover:gap-3 transition-all duration-200">
                  <span>Lire l&apos;article</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Section dynamique avec filtres et articles */}
        <div className="mb-12">
          <BlogSection
            initialData={initialBlogData}
            categories={categories}
            lang={lang}
            dict={dict}
          />
        </div>
      </div>
    </div>
  );
}
