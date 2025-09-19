import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  CalendarDays,
  Clock,
  Eye,
  User,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Sparkles,
  Heart,
  Bookmark,
} from "lucide-react";
import { BlogCategory } from "@/lib/generated/prisma";
import { BlogListItem } from "@/types/type";

interface BlogCardProps {
  article: BlogListItem;
  lang: "en" | "fr";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}

export default function BlogCard({ article, lang, dict }: BlogCardProps) {
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
      [BlogCategory.PALEONTOLOGIE]:
        dict.blog?.blogFilters?.categoryPaleontology || "Paléontologie",
      [BlogCategory.DECOUVERTE]:
        dict.blog?.blogFilters?.categoryDiscovery || "Découvertes",
      [BlogCategory.GUIDE_COLLECTION]:
        dict.blog?.blogFilters?.categoryGuides || "Guides",
      [BlogCategory.HISTOIRE_GEOLOGIQUE]:
        dict.blog?.blogFilters?.categoryHistory || "Histoire",
      [BlogCategory.ACTUALITE]:
        dict.blog?.blogFilters?.categoryActualite || "Actualité",
      [BlogCategory.TECHNIQUE]:
        dict.blog?.blogFilters?.categoryTechnique || "Technique",
      [BlogCategory.EXPOSITION]:
        dict.blog?.blogFilters?.categoryExposition || "Exposition",
      [BlogCategory.PORTRAIT]:
        dict.blog?.blogFilters?.categoryPortrait || "Portrait",
    };
    return map[category] || category;
  };

  return (
    <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-3xl">
      {/* Background décoratif */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-purple-500/0 group-hover:from-blue-400/5 group-hover:to-purple-500/5 rounded-3xl transition-all duration-500" />

      <Link href={`/${lang}/blog/${article.slug}`} className="block h-full">
        <CardHeader className="p-0 relative">
          {/* Image container premium */}
          <div className="relative aspect-[16/10] bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 overflow-hidden rounded-t-3xl">
            {article.featuredImage ? (
              <>
                <Image
                  src={article.featuredImage}
                  alt={article.imageAlt || article.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <div className="mb-4 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-300 to-slate-400 rounded-2xl blur-lg opacity-30" />
                    <div className="relative bg-gradient-to-r from-slate-400 to-slate-500 p-6 rounded-2xl">
                      <BookOpen className="w-12 h-12 text-white mx-auto" />
                    </div>
                  </div>
                  <p className="text-sm font-semibold">
                    {dict.blog?.blogList?.imageSoon ||
                      "Image bientôt disponible"}
                  </p>
                </div>
              </div>
            )}

            {/* Badge catégorie premium */}
            <div className="absolute top-4 left-4">
              <Badge className="relative overflow-hidden border-0 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${getCategoryColor(article.category)}`}
                />
                <div className="relative flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  {getCategoryLabel(article.category)}
                </div>
              </Badge>
            </div>

            {/* Quick actions overlay */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300">
                <Heart className="w-4 h-4 text-slate-600 hover:text-red-500" />
              </button>
              <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300">
                <Bookmark className="w-4 h-4 text-slate-600 hover:text-blue-500" />
              </button>
            </div>

            {/* Reading time badge */}
            {article.readTime && (
              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                {article.readTime} {dict.blog?.blogList?.min || "min"}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 relative">
          {/* Titre premium */}
          <h3 className="font-black text-xl leading-tight mb-3 line-clamp-2 text-slate-800 group-hover:text-slate-900 transition-colors duration-300">
            {article.title}
          </h3>

          {/* Excerpt avec style */}
          {article.excerpt && (
            <div className="relative mb-4">
              <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 group-hover:text-slate-700 transition-colors duration-300">
                {article.excerpt}
              </p>
              {/* Gradient fade pour le clamp */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none" />
            </div>
          )}

          {/* Tags premium */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {article.tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-xs border-slate-200 bg-slate-50/80 hover:bg-slate-100 hover:scale-105 transition-all duration-300 px-2 py-1 rounded-lg"
                  style={{
                    borderColor: tag.color ? `${tag.color}40` : undefined,
                    backgroundColor: tag.color ? `${tag.color}10` : undefined,
                    color: tag.color || undefined,
                  }}
                >
                  #{tag.name}
                </Badge>
              ))}
              {article.tags.length > 2 && (
                <Badge
                  variant="outline"
                  className="text-xs bg-slate-50 text-slate-500 px-2 py-1 rounded-lg"
                >
                  +{article.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Métadonnées premium */}
          <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
              <CalendarDays className="w-3 h-3" />
              <span className="font-medium">
                {formatDate(article.publishedAt)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
              <Eye className="w-3 h-3" />
              <span className="font-medium">
                {article.views.toLocaleString(
                  lang === "fr" ? "fr-FR" : "en-US"
                )}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-6 pb-6 pt-0 relative">
          <div className="flex items-center justify-between w-full">
            {/* Auteur premium */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  {dict.blog?.blogList?.by || "Par"}
                </p>
                <p className="text-sm font-semibold text-slate-700 truncate max-w-[120px]">
                  {article.author.name || article.author.email}
                </p>
              </div>
            </div>

            {/* CTA premium */}
            <div className="group/cta bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
              <span className="text-sm whitespace-nowrap">
                {dict.blog?.blogList?.readMore || "Lire la suite"}
              </span>
              <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform duration-300" />
            </div>
          </div>

          {/* Performance indicator */}
          <div className="absolute bottom-0 left-6 right-6 h-1 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 group-hover:animate-pulse"
              style={{
                width: `${Math.min((article.views / 1000) * 100, 100)}%`,
              }}
            />
          </div>
        </CardFooter>
      </Link>

      {/* Hover border glow */}
      <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-blue-200/50 transition-all duration-500 pointer-events-none" />
    </Card>
  );
}
