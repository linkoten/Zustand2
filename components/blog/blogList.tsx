"use client";

import { useState } from "react";
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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
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
import { BlogListProps } from "@/types/blogType";

export default function BlogList({
  posts,
  totalPages,
  currentPage,
  totalPosts,
}: BlogListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localPosts, setLocalPosts] = useState(posts);
  const { user } = useUser();
  const router = useRouter();

  // ✅ Vérifier si l'utilisateur est admin ou modérateur
  const canEditBlog =
    user?.publicMetadata?.role === "admin" ||
    user?.publicMetadata?.role === "moderator";

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

  if (localPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Aucun article trouvé.</p>
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
            className="group hover:shadow-lg transition-shadow overflow-hidden"
          >
            <CardHeader className="p-0">
              <div className="relative aspect-video overflow-hidden">
                {post.featuredImage ? (
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <span className="text-amber-600 font-semibold">📖</span>
                  </div>
                )}

                {/* ✅ Boutons admin en overlay */}
                {canEditBlog && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button
                        asChild
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
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
                            className="h-8 w-8 p-0"
                            disabled={deletingId === post.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-destructive" />
                              Confirmer la suppression
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer l&apos;article
                              &quot;{post.title}&quot; ? Cette action est
                              irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(post.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{post.category}</Badge>
                  {post.tags.length > 0 && (
                    <span className="text-xs text-gray-500">
                      {post.tags.slice(0, 2).join(", ")}
                    </span>
                  )}
                </div>

                <div>
                  <CardTitle className="text-lg leading-tight hover:text-primary transition-colors">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{post.author.name || "Auteur inconnu"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.readTime || 5} min</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    <span>
                      {new Date(post.publishedAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === currentPage ? "default" : "outline"}
                size="sm"
                asChild
              >
                <Link href={`/blog?page=${pageNum}`}>{pageNum}</Link>
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}
