import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  Clock,
  Eye,
  User,
  ArrowLeft,
  Share2,
  BookOpen,
  Sparkles,
  MessageCircle,
  Heart,
  Bookmark,
} from "lucide-react";
import { BlogCategory } from "@/lib/generated/prisma";
import ShareButtons from "@/components/blog/shareButtons";
import BlogContent from "@/components/blog/blogContent";
import RelatedArticles from "@/components/blog/relatedArticles";
import {
  getBlogArticleBySlug,
  getBlogArticles,
} from "@/lib/actions/blogActions";
import { getDictionary } from "../../dictionaries";

interface BlogArticlePageProps {
  params: Promise<{ slug: string; lang: "en" | "fr" }>;
}

// Générer les métadonnées SEO
export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await getBlogArticleBySlug(resolvedParams.slug);

  if (!article) {
    return {
      title: "Article non trouvé - FossilShop Blog",
      description: "L'article demandé n'existe pas ou n'est plus disponible.",
    };
  }

  return {
    title: article.seoTitle || `${article.title} - FossilShop Blog`,
    description: article.seoDescription || article.excerpt || article.title,
    keywords: `paléontologie, fossiles, ${article.tags.map((tag) => tag.name).join(", ")}`,
    authors: [{ name: article.author.name || article.author.email }],
    openGraph: {
      title: article.title,
      description: article.excerpt || article.title,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.name || article.author.email],
      images: article.featuredImage
        ? [
            {
              url: article.featuredImage,
              alt: article.imageAlt || article.title,
            },
          ]
        : [],
      tags: article.tags.map((tag) => tag.name),
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt || article.title,
      images: article.featuredImage ? [article.featuredImage] : [],
    },
  };
}

// Générer les pages statiques (ISR)
export async function generateStaticParams() {
  try {
    const { articles } = await getBlogArticles({ limit: 50 });

    return articles.map((article) => ({
      slug: article.slug,
    }));
  } catch (error) {
    console.error(
      "Erreur lors de la génération des paramètres statiques:",
      error
    );
    return [];
  }
}

export default async function BlogArticlePage(props: BlogArticlePageProps) {
  const resolvedParams = await props.params;
  const { lang, slug } = resolvedParams;
  const dict = await getDictionary(lang);
  const article = await getBlogArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const getCategoryColor = (category: BlogCategory) => {
    const colors = {
      [BlogCategory.PALEONTOLOGIE]: "from-blue-500 to-cyan-600",
      [BlogCategory.DECOUVERTE]: "from-green-500 to-emerald-600",
      [BlogCategory.GUIDE_COLLECTION]: "from-purple-500 to-violet-600",
      [BlogCategory.HISTOIRE_GEOLOGIQUE]: "from-amber-500 to-orange-600",
      [BlogCategory.ACTUALITE]: "from-red-500 to-pink-600",
      [BlogCategory.TECHNIQUE]: "from-gray-500 to-slate-600",
      [BlogCategory.EXPOSITION]: "from-pink-500 to-rose-600",
      [BlogCategory.PORTRAIT]: "from-indigo-500 to-blue-600",
    };
    return colors[category] || "from-gray-500 to-slate-600";
  };

  const getCategoryLabel = (category: BlogCategory) => {
    const map: Record<string, string> = {
      [BlogCategory.PALEONTOLOGIE]: dict.blog.blogFilters.categoryPaleontology,
      [BlogCategory.DECOUVERTE]: dict.blog.blogFilters.categoryDiscovery,
      [BlogCategory.GUIDE_COLLECTION]: dict.blog.blogFilters.categoryGuides,
      [BlogCategory.HISTOIRE_GEOLOGIQUE]: dict.blog.blogFilters.categoryHistory,
      [BlogCategory.ACTUALITE]: dict.blog.blogFilters.categoryActualite,
      [BlogCategory.TECHNIQUE]: dict.blog.blogFilters.categoryTechnique,
      [BlogCategory.EXPOSITION]: dict.blog.blogFilters.categoryExposition,
      [BlogCategory.PORTRAIT]: dict.blog.blogFilters.categoryPortrait,
    };
    return map[category] || category;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation de retour ultra moderne */}
        <div className="mb-8">
          <Button
            variant="ghost"
            asChild
            className="group bg-white/80 backdrop-blur-sm border border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 rounded-xl px-6 py-3"
          >
            <Link href={`/${lang}/blog`} className="flex items-center gap-3">
              <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <ArrowLeft className="w-4 h-4 text-white group-hover:-translate-x-1 transition-transform duration-300" />
              </div>
              <span className="font-semibold">
                {dict.blog.article?.backToBlog ||
                  dict.blog.prevLabel ||
                  "Retour au blog"}
              </span>
            </Link>
          </Button>
        </div>

        {/* Article principal avec design premium */}
        <article className="max-w-4xl mx-auto">
          {/* En-tête de l'article redesigné */}
          <header className="mb-12">
            {/* Catégorie premium */}
            <div className="mb-6">
              <Link href={`/${lang}/blog?category=${article.category}`}>
                <Badge className="relative overflow-hidden border-0 px-4 py-2 text-sm font-semibold text-white hover:scale-105 transition-transform duration-300">
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${getCategoryColor(article.category)}`}
                  />
                  <div className="relative flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {getCategoryLabel(article.category)}
                  </div>
                </Badge>
              </Link>
            </div>

            {/* Titre spectaculaire */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-8">
              <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                {article.title}
              </span>
            </h1>

            {/* Excerpt redesigné */}
            {article.excerpt && (
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-2xl" />
                <div className="relative p-6">
                  <p className="text-xl md:text-2xl text-slate-700 leading-relaxed font-medium">
                    {article.excerpt}
                  </p>
                </div>
              </div>
            )}

            {/* Métadonnées premium */}
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 mb-8 shadow-lg">
              <div className="flex flex-wrap items-center gap-6 text-slate-600">
                {/* Auteur */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl shadow-lg">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      {dict.blog.article?.authorLabel ||
                        dict.blog.blogList?.by ||
                        "Par"}
                    </p>
                    <p className="font-semibold text-slate-800">
                      {article.author.name ||
                        dict.blog.blogList?.unknownAuthor ||
                        "Auteur inconnu"}
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                    <CalendarDays className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      {dict.blog.article?.publishedLabel ||
                        dict.blog.blogList?.publishedOn ||
                        "Publié le"}
                    </p>
                    <p className="font-semibold text-slate-800">
                      {formatDate(article.publishedAt!)}
                    </p>
                  </div>
                </div>

                {/* Temps de lecture */}
                {article.readTime && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl shadow-lg">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        {dict.blog.article?.readTimeLabel || "Lecture"}
                      </p>
                      <p className="font-semibold text-slate-800">
                        {article.readTime} {dict.blog.blogList?.min || "min"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Vues */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl shadow-lg">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      {dict.blog.article?.viewsLabel || "Vues"}
                    </p>
                    <p className="font-semibold text-slate-800">
                      {article.views.toLocaleString(
                        lang === "fr" ? "fr-FR" : "en-US"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags redesignés */}
            {article.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-slate-600 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {dict.blog.article?.tagsLabel || "Tags"}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {article.tags.map((tag) => (
                    <Link key={tag.id} href={`/${lang}/blog?tag=${tag.slug}`}>
                      <Badge
                        variant="outline"
                        className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg hover:scale-105 transition-all duration-300 px-4 py-2 rounded-xl"
                        style={{
                          borderColor: tag.color || undefined,
                        }}
                      >
                        <span
                          className="font-semibold"
                          style={{ color: tag.color || undefined }}
                        >
                          #{tag.name}
                        </span>
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Boutons d'actions premium */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-600">
                  {dict.blog.article?.shareLabel || "Partager"}
                </span>
                <ShareButtons
                  title={article.title}
                  url={`${process.env.NEXT_PUBLIC_APP_URL}/${lang}/blog/${article.slug}`}
                  description={article.excerpt}
                />
              </div>

              <div className="flex gap-3 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl hover:bg-slate-50"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {dict.blog.article?.likeButton || "J'aime"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl hover:bg-slate-50"
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  {dict.blog.article?.saveButton || "Sauvegarder"}
                </Button>
              </div>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
          </header>

          {/* Image mise en avant redesignée */}
          {article.featuredImage && (
            <div className="mb-12">
              <div className="relative aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 shadow-2xl">
                <Image
                  src={article.featuredImage}
                  alt={article.imageAlt || article.title}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
              {article.imageAlt && (
                <p className="text-sm text-slate-500 mt-4 text-center italic bg-slate-50 px-4 py-2 rounded-xl mx-auto w-fit">
                  {article.imageAlt}
                </p>
              )}
            </div>
          )}

          {/* Contenu de l'article avec design premium */}
          <div className="relative mb-16">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent rounded-3xl" />
            <div className="relative prose prose-lg prose-slate max-w-none">
              <BlogContent content={article.content} />
            </div>
          </div>

          {/* Footer de l'article redesigné */}
          <footer className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-white to-slate-50 rounded-3xl" />
            <div className="relative p-8">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">
                    {dict.blog.article?.publishedOn || "Publié le"}{" "}
                    {formatDate(article.publishedAt!)}
                  </p>
                  {article.updatedAt !== article.createdAt && (
                    <p className="text-sm text-slate-500">
                      {dict.blog.article?.updatedOn || "Mis à jour le"}{" "}
                      {formatDate(article.updatedAt)}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl hover:bg-slate-50"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {dict.blog.article?.commentButton || "Commenter"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl hover:bg-slate-50"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    {dict.blog.article?.shareButton || "Partager"}
                  </Button>
                </div>
              </div>
            </div>
          </footer>
        </article>

        {/* Articles connexes avec espacement premium */}
        <div className="max-w-4xl mx-auto mt-20">
          <RelatedArticles
            currentArticleId={article.id}
            category={article.category}
            tags={article.tags.map((tag) => tag.slug)}
            lang={lang}
            dict={dict}
          />
        </div>
      </div>
    </div>
  );
}
