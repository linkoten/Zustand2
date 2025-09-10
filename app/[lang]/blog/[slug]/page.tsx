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
} from "lucide-react";
import { BlogCategory } from "@/lib/generated/prisma";
import ShareButtons from "@/components/blog/shareButtons";
import BlogContent from "@/components/blog/blogContent";
import RelatedArticles from "@/components/blog/relatedArticles";
import {
  getBlogArticleBySlug,
  getBlogArticles,
} from "@/lib/actions/blogActions";

interface BlogArticlePageProps {
  params: Promise<{ slug: string }>;
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

export default async function BlogArticlePage({
  params,
}: BlogArticlePageProps) {
  const resolvedParams = await params;
  const article = await getBlogArticleBySlug(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const getCategoryColor = (category: BlogCategory) => {
    const colors = {
      [BlogCategory.PALEONTOLOGIE]: "bg-blue-100 text-blue-800",
      [BlogCategory.DECOUVERTE]: "bg-green-100 text-green-800",
      [BlogCategory.GUIDE_COLLECTION]: "bg-purple-100 text-purple-800",
      [BlogCategory.HISTOIRE_GEOLOGIQUE]: "bg-amber-100 text-amber-800",
      [BlogCategory.ACTUALITE]: "bg-red-100 text-red-800",
      [BlogCategory.TECHNIQUE]: "bg-gray-100 text-gray-800",
      [BlogCategory.EXPOSITION]: "bg-pink-100 text-pink-800",
      [BlogCategory.PORTRAIT]: "bg-indigo-100 text-indigo-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getCategoryLabel = (category: BlogCategory) => {
    const labels = {
      [BlogCategory.PALEONTOLOGIE]: "Paléontologie",
      [BlogCategory.DECOUVERTE]: "Découverte",
      [BlogCategory.GUIDE_COLLECTION]: "Guide Collection",
      [BlogCategory.HISTOIRE_GEOLOGIQUE]: "Histoire Géologique",
      [BlogCategory.ACTUALITE]: "Actualité",
      [BlogCategory.TECHNIQUE]: "Technique",
      [BlogCategory.EXPOSITION]: "Exposition",
      [BlogCategory.PORTRAIT]: "Portrait",
    };
    return labels[category] || category;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation de retour */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="group">
            <Link href="/blog" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Retour au blog
            </Link>
          </Button>
        </div>

        {/* Article principal */}
        <article className="max-w-4xl mx-auto">
          {/* En-tête de l'article */}
          <header className="mb-8">
            {/* Catégorie */}
            <div className="mb-4">
              <Link href={`/blog?category=${article.category}`}>
                <Badge
                  className={`text-sm ${getCategoryColor(article.category)} hover:opacity-80 transition-opacity`}
                >
                  <BookOpen className="w-3 h-3 mr-1" />
                  {getCategoryLabel(article.category)}
                </Badge>
              </Link>
            </div>

            {/* Titre */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed mb-6">
                {article.excerpt}
              </p>
            )}

            {/* Métadonnées de l'article */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Par {article.author.name || article.author.email}</span>
              </div>

              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                <span>{formatDate(article.publishedAt!)}</span>
              </div>

              {article.readTime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{article.readTime} min de lecture</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{article.views} vues</span>
              </div>
            </div>

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {article.tags.map((tag) => (
                  <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                    <Badge
                      variant="outline"
                      className="hover:bg-gray-100 transition-colors"
                      style={{
                        borderColor: tag.color || undefined,
                        color: tag.color || undefined,
                      }}
                    >
                      #{tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Boutons de partage */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-sm text-gray-600">Partager :</span>
              <ShareButtons
                title={article.title}
                url={`${process.env.NEXT_PUBLIC_APP_URL}/blog/${article.slug}`}
                description={article.excerpt}
              />
            </div>

            <Separator />
          </header>

          {/* Image mise en avant */}
          {article.featuredImage && (
            <div className="mb-8">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-200">
                <Image
                  src={article.featuredImage}
                  alt={article.imageAlt || article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {article.imageAlt && (
                <p className="text-sm text-gray-500 mt-2 text-center italic">
                  {article.imageAlt}
                </p>
              )}
            </div>
          )}

          {/* Contenu de l'article */}
          <div className="prose prose-lg max-w-none mb-12">
            <BlogContent content={article.content} />
          </div>

          {/* Footer de l'article */}
          <footer className="border-t pt-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Publié le {formatDate(article.publishedAt!)}
                </span>
                {article.updatedAt !== article.createdAt && (
                  <span className="text-sm text-gray-500">
                    · Mis à jour le {formatDate(article.updatedAt)}
                  </span>
                )}
              </div>

              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Partager l&apos;article
              </Button>
            </div>
          </footer>
        </article>

        {/* Articles connexes */}
        <div className="max-w-4xl mx-auto mt-16">
          <RelatedArticles
            currentArticleId={article.id}
            category={article.category}
            tags={article.tags.map((tag) => tag.slug)}
          />
        </div>
      </div>
    </div>
  );
}
