"use client";

import { useState, useEffect } from "react";
import { BlogCategory } from "@/lib/generated/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Clock,
  User,
  Edit,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  BookOpen,
  TrendingUp,
  Sparkles,
  FileText,
  Plus,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface BlogListProps {
  posts: Array<{
    id: string;
    title: string;
    excerpt: string | null;
    slug: string;
    category: BlogCategory;
    tags: Array<{
      id: string;
      name: string;
      slug: string;
      color: string | null;
    }>;
    featuredImage: string | null;
    publishedAt: string;
    readTime: number | null;
    views: number;
    author: {
      name: string | null;
      id: string;
    };
  }>;
  totalPages: number;
  currentPage: number;
  totalPosts: number;
}

interface BlogListExtraProps {
  lang: "fr" | "en";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}

export default function BlogList({
  posts,
  totalPages,
  currentPage,
  totalPosts,
  lang,
  dict,
}: BlogListProps & BlogListExtraProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localPosts, setLocalPosts] = useState(posts);
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mettre à jour localPosts quand les props changent
  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  // Vérifier si l'utilisateur est admin ou modérateur
  const canEditBlog =
    user?.publicMetadata?.role === "admin" ||
    user?.publicMetadata?.role === "moderator";

  // Fonction pour créer une URL avec les paramètres de recherche existants
  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `/${lang}/blog?${params.toString()}`;
  };

  // Fonction pour obtenir la couleur de la catégorie
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

  // Fonction pour obtenir le label de la catégorie (i18n)
  const getCategoryLabel = (category: BlogCategory) => {
    const labels = {
      [BlogCategory.PALEONTOLOGIE]: dict.blog?.blogList?.categoryPaleontology,
      [BlogCategory.DECOUVERTE]: dict.blog?.blogList?.categoryDiscovery,
      [BlogCategory.GUIDE_COLLECTION]: dict.blog?.blogList?.categoryGuides,
      [BlogCategory.HISTOIRE_GEOLOGIQUE]: dict.blog?.blogList?.categoryHistory,
      [BlogCategory.ACTUALITE]: dict.blog?.blogList?.categoryActualite,
      [BlogCategory.TECHNIQUE]: dict.blog?.blogList?.categoryTechnique,
      [BlogCategory.EXPOSITION]: dict.blog?.blogList?.categoryExposition,
      [BlogCategory.PORTRAIT]: dict.blog?.blogList?.categoryPortrait,
    };
    return labels[category] || category;
  };

  // Fonction pour supprimer un article
  const handleDelete = async (postId: string) => {
    if (!canEditBlog) return;

    setDeletingId(postId);

    try {
      const response = await fetch(`/api/blog/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      toast.success(
        dict.blog?.blogList?.deleteSuccess || "Article supprimé avec succès"
      );

      // Mettre à jour la liste locale
      setLocalPosts((prev) => prev.filter((post) => post.id !== postId));

      // Rafraîchir la page pour mettre à jour les données côté serveur
      router.refresh();
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(
        dict.blog?.blogList?.deleteError ||
          "Erreur lors de la suppression de l'article"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Si aucun article
  if (localPosts.length === 0) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 rounded-3xl" />
        <div className="relative text-center py-20 px-8">
          <div className="max-w-md mx-auto space-y-8">
            {/* Icône premium */}
            <div className="relative mx-auto w-32 h-32">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full blur-2xl opacity-50" />
              <div className="relative bg-gradient-to-r from-slate-100 to-slate-200 rounded-full p-8 shadow-xl">
                <FileText className="w-16 h-16 text-slate-500 mx-auto" />
              </div>
            </div>

            {/* Contenu */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-slate-800">
                {dict.blog?.blogList?.noPostsFound || "Aucun article trouvé"}
              </h3>

              <p className="text-slate-600 leading-relaxed">
                {searchParams.get("search") ||
                searchParams.get("category") ||
                searchParams.get("tag")
                  ? dict.blog?.blogList?.tryChangingFilters ||
                    "Essayez de modifier vos critères de recherche."
                  : dict.blog?.blogList?.noPostsYet ||
                    "Aucun article n'a encore été publié."}
              </p>

              {canEditBlog && (
                <div className="pt-4">
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                  >
                    <Link
                      href={`/${lang}/blog/create`}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      {dict.blog?.blogList?.createFirstPost ||
                        "Créer le premier article"}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header avec compteur premium */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 rounded-2xl" />
        <div className="relative p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {dict.blog?.blogList?.articlesTitle || "Articles du blog"}
                </h2>
                <p className="text-slate-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-semibold text-emerald-700">
                    {totalPosts.toLocaleString(
                      lang === "fr" ? "fr-FR" : "en-US"
                    )}
                  </span>
                  <span>
                    {totalPosts > 1
                      ? dict.blog?.blogList?.articlesTotal ||
                        "articles disponibles"
                      : dict.blog?.blogList?.articleTotal ||
                        "article disponible"}
                  </span>
                </p>
              </div>
            </div>

            {/* Performance indicator */}
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-700">
                {(
                  (currentPage - 1) * localPosts.length +
                  localPosts.length
                ).toLocaleString(lang === "fr" ? "fr-FR" : "en-US")}
              </div>
              <div className="text-sm text-slate-600">
                {dict.blog?.blogList?.displayedLabel || "Affichés"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grille des articles ultra moderne */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {localPosts.map((post, index) => (
          <article
            key={post.id}
            className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0"
            style={{
              animationDelay: `${index * 100}ms`,
              animation: "fadeInUp 0.8s ease-out both",
            }}
          >
            {/* Background décoratif */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/30 to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-purple-500/0 group-hover:from-blue-400/5 group-hover:to-purple-500/5 rounded-3xl transition-all duration-500" />

            {/* En-tête avec image */}
            <div className="relative aspect-[16/10] overflow-hidden">
              {post.featuredImage ? (
                <>
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 flex items-center justify-center">
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
                    className={`absolute inset-0 bg-gradient-to-r ${getCategoryColor(post.category)}`}
                  />
                  <div className="relative flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    {getCategoryLabel(post.category)}
                  </div>
                </Badge>
              </div>

              {/* Boutons admin en overlay */}
              {canEditBlog && (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <div className="flex gap-2">
                    <Button
                      asChild
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm rounded-xl"
                    >
                      <Link href={`/${lang}/blog/${post.slug}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0 shadow-lg backdrop-blur-sm rounded-xl"
                          disabled={deletingId === post.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            {dict.blog?.blogList?.deleteTitle ||
                              "Confirmer la suppression"}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {dict.blog?.blogList?.deleteDescription
                              ? dict.blog.blogList.deleteDescription.replace(
                                  "{title}",
                                  post.title
                                )
                              : `Êtes-vous sûr de vouloir supprimer l'article "${post.title}" ? Cette action est irréversible.`}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">
                            {dict.blog?.blogList?.deleteCancel || "Annuler"}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(post.id)}
                            className="bg-destructive hover:bg-destructive/90 rounded-xl"
                          >
                            {dict.blog?.blogList?.deleteConfirm || "Supprimer"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )}

              {/* Reading time badge */}
              {post.readTime && (
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {post.readTime} {dict.blog?.blogList?.min || "min"}
                </div>
              )}

              {/* Views badge */}
              <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                <Eye className="w-3 h-3" />
                {post.views.toLocaleString(lang === "fr" ? "fr-FR" : "en-US")}
              </div>
            </div>

            {/* Contenu de la carte */}
            <div className="relative p-6 space-y-4">
              {/* Titre premium */}
              <Link href={`/${lang}/blog/${post.slug}`}>
                <h3 className="font-black text-xl leading-tight line-clamp-2 text-slate-800 group-hover:text-slate-900 transition-colors duration-300 hover:underline">
                  {post.title}
                </h3>
              </Link>

              {/* Excerpt avec style */}
              {post.excerpt && (
                <div className="relative">
                  <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 group-hover:text-slate-700 transition-colors duration-300">
                    {post.excerpt}
                  </p>
                  {/* Gradient fade pour le clamp */}
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                </div>
              )}

              {/* Tags premium */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.slice(0, 2).map((tag) => (
                    <Link key={tag.id} href={`/${lang}/blog?tag=${tag.slug}`}>
                      <Badge
                        variant="outline"
                        className="text-xs border-slate-200 bg-slate-50/80 hover:bg-slate-100 hover:scale-105 transition-all duration-300 px-2 py-1 rounded-lg cursor-pointer"
                        style={{
                          borderColor: tag.color ? `${tag.color}40` : undefined,
                          backgroundColor: tag.color
                            ? `${tag.color}10`
                            : undefined,
                          color: tag.color || undefined,
                        }}
                      >
                        #{tag.name}
                      </Badge>
                    </Link>
                  ))}
                  {post.tags.length > 2 && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-slate-50 text-slate-500 px-2 py-1 rounded-lg"
                    >
                      +{post.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}

              {/* Métadonnées et auteur */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">
                      {dict.blog?.blogList?.by || "Par"}
                    </p>
                    <p className="text-sm font-semibold text-slate-700 truncate max-w-[120px]">
                      {post.author.name || post.author.id}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <CalendarDays className="w-3 h-3" />
                    <span>
                      {new Date(post.publishedAt).toLocaleDateString(
                        lang === "fr" ? "fr-FR" : "en-US",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hover border glow */}
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-blue-200/50 transition-all duration-500 pointer-events-none" />
          </article>
        ))}
      </div>

      {/* Pagination ultra premium */}
      {totalPages > 1 && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-white to-slate-50 rounded-3xl" />
          <div className="relative p-8">
            <div className="flex flex-col items-center gap-8">
              {/* Informations de pagination */}
              <div className="text-center space-y-2">
                <div className="text-sm text-slate-600">
                  {dict.blog?.pagination?.pageLabel || "Page"}
                  <span className="font-bold text-lg text-slate-800 mx-2">
                    {currentPage}
                  </span>
                  {dict.blog?.pagination?.ofLabel || "sur"}
                  <span className="font-bold text-lg text-slate-800 mx-2">
                    {totalPages}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {totalPosts.toLocaleString(lang === "fr" ? "fr-FR" : "en-US")}{" "}
                  {dict.blog?.postLabel || "article"}
                  {totalPosts > 1 ? dict.blog?.pluralS || "s" : ""}{" "}
                  {dict.blog?.totalLabel || "au total"}
                </div>
              </div>

              {/* Boutons de pagination */}
              <div className="flex items-center gap-4">
                {/* Bouton Précédent */}
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  disabled={currentPage === 1}
                  className="gap-2 rounded-xl border-slate-200 hover:bg-slate-50 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  <Link href={createPageUrl(currentPage - 1)}>
                    <ChevronLeft className="h-5 w-5" />
                    {dict.blog?.prevLabel || "Précédent"}
                  </Link>
                </Button>

                {/* Pages numérotées */}
                <div className="flex gap-2">
                  {/* Première page */}
                  {currentPage > 3 && (
                    <>
                      <Button
                        variant="outline"
                        size="lg"
                        asChild
                        className="rounded-xl border-slate-200 hover:bg-slate-50 transition-all duration-300"
                      >
                        <Link href={createPageUrl(1)}>1</Link>
                      </Button>
                      {currentPage > 4 && (
                        <span className="px-4 py-2 text-slate-400 font-semibold">
                          ...
                        </span>
                      )}
                    </>
                  )}

                  {/* Pages autour de la page actuelle */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(
                      1,
                      Math.min(totalPages, currentPage - 2 + i)
                    );
                    if (
                      pageNum < Math.max(1, currentPage - 2) ||
                      pageNum > Math.min(totalPages, currentPage + 2)
                    ) {
                      return null;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          pageNum === currentPage ? "default" : "outline"
                        }
                        size="lg"
                        asChild
                        className={`rounded-xl transition-all duration-300 ${
                          pageNum === currentPage
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                            : "border-slate-200 hover:bg-slate-50 hover:shadow-lg"
                        }`}
                      >
                        <Link href={createPageUrl(pageNum)}>{pageNum}</Link>
                      </Button>
                    );
                  })}

                  {/* Dernière page */}
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <span className="px-4 py-2 text-slate-400 font-semibold">
                          ...
                        </span>
                      )}
                      <Button
                        variant="outline"
                        size="lg"
                        asChild
                        className="rounded-xl border-slate-200 hover:bg-slate-50 transition-all duration-300"
                      >
                        <Link href={createPageUrl(totalPages)}>
                          {totalPages}
                        </Link>
                      </Button>
                    </>
                  )}
                </div>

                {/* Bouton Suivant */}
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  disabled={currentPage === totalPages}
                  className="gap-2 rounded-xl border-slate-200 hover:bg-slate-50 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  <Link href={createPageUrl(currentPage + 1)}>
                    {dict.blog?.nextLabel || "Suivant"}
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animation CSS */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
