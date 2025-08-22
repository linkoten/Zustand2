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
import { BlogListItem } from "@/types/type";
import { BlogCategory } from "@/lib/generated/prisma";

interface BlogCardProps {
  article: BlogListItem;
}

export default function BlogCard({ article }: BlogCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
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
    <Card className="group hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* ✅ Envelopper tout le header dans un Link */}
      <Link href={`/blog/${article.slug}`}>
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
                    Image bientôt disponible
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
          <Link href={`/blog/${article.slug}`}>
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
              <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
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
            <span>Par {article.author.name || article.author.email}</span>
          </div>

          {/* ✅ Bouton "Lire la suite" avec lien vers l'article */}
          <Link href={`/blog/${article.slug}`}>
            <span className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium cursor-pointer">
              Lire la suite →
            </span>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
