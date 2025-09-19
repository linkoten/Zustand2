import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { CalendarDays, Clock, Eye, User } from "lucide-react";
import { BlogCategory } from "@/lib/generated/prisma";
import { BlogListItem } from "@/types/type";

import { getDictionary } from "@/app/[lang]/dictionaries";

interface BlogCardProps {
  article: BlogListItem;
  lang: "en" | "fr";
}

export default async function BlogCard({ article, lang }: BlogCardProps) {
  const dict = await getDictionary(lang);
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
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
    <Card className="group hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* ✅ Envelopper tout le header dans un Link */}
      <Link href={`/${lang}/blog/${article.slug}`}>
        <CardHeader className="p-0">
          <div className="relative aspect-video bg-gradient-to-br from-stone-200 to-stone-300">
            {article.featuredImage ? (
              <Image
                src={article.featuredImage}
                alt={article.imageAlt || article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="text-4xl mb-2">📖</div>
                  <p className="text-sm font-medium">
                    {dict.blog.blogList.imageSoon}
                  </p>
                </div>
              </div>
            )}

            {/* Badge catégorie */}
            <div className="absolute top-3 left-3">
              <Badge
                className={`text-xs ${getCategoryColor(article.category)}`}
              >
                {getCategoryLabel(article.category)}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Link>

      <CardContent className="p-4">
        <div className="mb-3">
          {/* ✅ Lien sur le titre vers l'article complet */}
          <Link href={`/${lang}/blog/${article.slug}`}>
            <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
              {article.title}
            </h3>
          </Link>

          {article.excerpt && (
            <p className="text-gray-600 text-sm line-clamp-3 mb-3">
              {article.excerpt}
            </p>
          )}
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {article.tags.slice(0, 3).map((tag) => (
              <Link key={tag.id} href={`/${lang}/blog?tag=${tag.slug}`}>
                <Badge
                  variant="outline"
                  className="text-xs hover:bg-gray-100 transition-colors"
                  style={{
                    borderColor: tag.color || undefined,
                    color: tag.color || undefined,
                  }}
                >
                  #{tag.name}
                </Badge>
              </Link>
            ))}
            {article.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{article.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Métadonnées */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            {formatDate(article.publishedAt)}
          </div>

          {article.readTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readTime} min
            </div>
          )}

          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {article.views}
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>
              {dict.blog.blogList.by}{" "}
              {article.author.name || article.author.email}
            </span>
          </div>

          {/* ✅ Bouton "Lire la suite" avec lien vers l'article */}
          <Link href={`/${lang}/blog/${article.slug}`}>
            <span className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium cursor-pointer">
              {dict.blog.blogList.readMore}
            </span>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
