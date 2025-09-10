"use client";

import { useState, useEffect } from "react";
import { BlogCategory } from "@/lib/generated/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  // ✅ Mettre à jour localPosts quand les props changent
  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  // ✅ Vérifier si l'utilisateur est admin ou modérateur
  const canEditBlog =
    user?.publicMetadata?.role === "admin" ||
    user?.publicMetadata?.role === "moderator";

  // ✅ Fonction pour créer une URL avec les paramètres de recherche existants
  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `/blog?${params.toString()}`;
  };

  // ✅ Fonction pour obtenir la couleur de la catégorie
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

  // ✅ Fonction pour obtenir le label de la catégorie (i18n)
  const getCategoryLabel = (category: BlogCategory) => {
    const labels = {
      [BlogCategory.PALEONTOLOGIE]: dict.blog.blogListcategoryPaleontology,
      [BlogCategory.DECOUVERTE]: dict.blog.blogListcategoryDiscovery,
      [BlogCategory.GUIDE_COLLECTION]: dict.blog.blogListcategoryGuides,
      [BlogCategory.HISTOIRE_GEOLOGIQUE]: dict.blog.blogListcategoryHistory,
      [BlogCategory.ACTUALITE]: dict.blog.blogListcategoryActualite,
      [BlogCategory.TECHNIQUE]: dict.blog.blogListcategoryTechnique,
      [BlogCategory.EXPOSITION]: dict.blog.blogListcategoryExposition,
      [BlogCategory.PORTRAIT]: dict.blog.blogListcategoryPortrait,
    };
    return labels[category] || category;
  };

  // ✅ Fonction pour supprimer un article
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

      toast.success("Article supprimé avec succès");

      // Mettre à jour la liste locale
      setLocalPosts((prev) => prev.filter((post) => post.id !== postId));

      // Rafraîchir la page pour mettre à jour les données côté serveur
      router.refresh();
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression de l'article");
    } finally {
      setDeletingId(null);
    }
  };

  // ✅ Si aucun article
  if (localPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold mb-2">
            {dict.blog.blogList?.noPostsFound || "Aucun article trouvé"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchParams.get("search") ||
            searchParams.get("category") ||
            searchParams.get("tag")
              ? dict.blog.blogList?.tryChangingFilters ||
                "Essayez de modifier vos critères de recherche."
              : dict.blog.blogList?.noPostsYet ||
                "Aucun article n'a encore été publié."}
          </p>
          {canEditBlog && (
            <Button asChild>
              <Link href="/blog/create">
                {dict.blog.blogList?.createFirstPost ||
                  "Créer le premier article"}
              </Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Grille des articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {localPosts.map((post) => (
          <Card
            key={post.id}
            className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-0 shadow-sm"
          >
            {/* En-tête avec image */}
            <CardHeader className="p-0">
              <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200">
                {post.featuredImage ? (
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <span className="text-4xl">📖</span>
                  </div>
                )}

                {/* ✅ Boutons admin en overlay */}
                {canEditBlog && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex gap-1">
                      <Button
                        asChild
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm"
                      >
                        <Link href={`/blog/${post.slug}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 w-8 p-0 shadow-sm"
                            disabled={deletingId === post.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-destructive" />
                              {dict.blog.blogList?.deleteTitle ||
                                "Confirmer la suppression"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {dict.blog.blogList?.deleteDescription
                                ? dict.blog.blogList.deleteDescription.replace(
                                    "{title}",
                                    post.title
                                  )
                                : `Êtes-vous sûr de vouloir supprimer l'article "${post.title}" ? Cette action est irréversible.`}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {dict.blog.blogList?.deleteCancel || "Annuler"}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(post.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              {dict.blog.blogList?.deleteConfirm || "Supprimer"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}

                {/* Badge de catégorie */}
                <div className="absolute bottom-3 left-3">
                  <Badge
                    variant="secondary"
                    className={`${getCategoryColor(post.category)} border-0 font-medium`}
                  >
                    {getCategoryLabel(post.category)}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            {/* Contenu de la carte */}
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Titre et description */}
                <div>
                  <CardTitle className="text-lg leading-tight mb-2 group-hover:text-primary transition-colors">
                    <Link href={`/blog/${post.slug}`} className="line-clamp-2">
                      {post.title}
                    </Link>
                  </CardTitle>

                  {post.excerpt && (
                    <CardDescription className="text-sm line-clamp-3 text-muted-foreground">
                      {post.excerpt}
                    </CardDescription>
                  )}
                </div>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/blog?tag=${tag.slug}`}
                        className="inline-block"
                      >
                        <Badge
                          variant="outline"
                          className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                        >
                          #{tag.name}
                        </Badge>
                      </Link>
                    ))}
                    {post.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{post.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Métadonnées */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>
                        {post.author.name ||
                          dict.blog.blogList?.unknownAuthor ||
                          "Auteur inconnu"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {post.readTime || 5} {dict.blog.blogList?.min || "min"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    <span>
                      {dict.blog.blogList?.publishedOn || "Publié le"}{" "}
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ✅ Pagination améliorée */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4">
          {/* Informations de pagination */}
          <div className="text-sm text-muted-foreground">
            {dict.pageLabel || "Page"} {currentPage} {dict.ofLabel || "sur"}{" "}
            {totalPages} • {totalPosts} {dict.postLabel || "article"}
            {totalPosts > 1 ? dict.pluralS || "s" : ""}{" "}
            {dict.totalLabel || "au total"}
          </div>

          {/* Boutons de pagination */}
          <div className="flex items-center gap-2">
            {/* Bouton Précédent */}
            <Button
              variant="outline"
              size="sm"
              asChild
              disabled={currentPage === 1}
              className="gap-1"
            >
              <Link href={createPageUrl(currentPage - 1)}>
                <ChevronLeft className="h-4 w-4" />
                {dict.prevLabel || "Précédent"}
              </Link>
            </Button>

            {/* Pages numérotées */}
            <div className="flex gap-1">
              {/* Première page */}
              {currentPage > 3 && (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={createPageUrl(1)}>1</Link>
                  </Button>
                  {currentPage > 4 && (
                    <span className="px-2 text-muted-foreground">...</span>
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
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    asChild
                  >
                    <Link href={createPageUrl(pageNum)}>{pageNum}</Link>
                  </Button>
                );
              })}

              {/* Dernière page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && (
                    <span className="px-2 text-muted-foreground">...</span>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={createPageUrl(totalPages)}>{totalPages}</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Bouton Suivant */}
            <Button
              variant="outline"
              size="sm"
              asChild
              disabled={currentPage === totalPages}
              className="gap-1"
            >
              <Link href={createPageUrl(currentPage + 1)}>
                {dict.nextLabel || "Suivant"}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
