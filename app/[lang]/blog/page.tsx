import { getBlogPosts } from "@/lib/actions/blogActions";
import { Button } from "@/components/ui/button";
import { PenTool, Plus } from "lucide-react";
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
    <div className="container mx-auto px-4 py-8">
      {/* En-tête avec actions - STATIQUE */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <PenTool className="h-8 w-8 text-primary" />
              {dict.blog.title}
            </h1>
            <p className="text-muted-foreground">{dict.blog.subtitle}</p>
          </div>

          {/* Bouton pour créer un nouvel article (si connecté) */}
          {canCreatePost && (
            <Button asChild>
              <Link
                href={`/${lang}/blog/create`}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {dict.blog.create}
              </Link>
            </Button>
          )}
        </div>

        {/* Statistiques rapides - DYNAMIQUES */}
        <BlogStats initialStats={initialStats} lang={lang} dict={dict} />
      </div>

      {/* Section dynamique avec filtres et articles */}
      <BlogSection initialData={initialBlogData} lang={lang} dict={dict} />
      {/* Sections supplémentaires si aucun filtre actif - STATIQUES */}
      {!search && !category && !tag && page === 1 && (
        <div className="mt-12 space-y-8">
          {/* Section catégories populaires */}
          <div className="bg-gradient-to-r from-stone-50 to-amber-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              📚 {dict.blog.exploreCategories}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  name: dict.blog.blogList.categoryPaleontology,
                  icon: "🦕",
                  slug: "PALEONTOLOGIE",
                },
                {
                  name: dict.blog.blogList.categoryDiscovery,
                  icon: "🔍",
                  slug: "DECOUVERTE",
                },
                {
                  name: dict.blog.blogList.categoryGuides,
                  icon: "📖",
                  slug: "GUIDE_COLLECTION",
                },
                {
                  name: dict.blog.blogList.categoryHistory,
                  icon: "🌍",
                  slug: "HISTOIRE_GEOLOGIQUE",
                },
              ].map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${lang}/blog?category=${cat.slug}`}
                  className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-all"
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="font-medium">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Call to action */}
          <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-4">{dict.blog.ctaTitle}</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {dict.blog.ctaText}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href={`/${lang}/fossiles`}>{dict.blog.ctaFossils}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={`/${lang}/contact`}>{dict.blog.ctaContact}</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
