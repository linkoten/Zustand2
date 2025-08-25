import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import EditBlogForm from "@/components/blog/editBlogForm";

interface EditBlogPageProps {
  params: Promise<{ slug: string }>;
}

async function getBlogPost(slug: string) {
  try {
    // ✅ Utiliser articleBlog au lieu de blogPost
    const post = await prisma.articleBlog.findFirst({
      where: { slug },
      include: {
        author: {
          select: {
            name: true, // ✅ Utiliser name au lieu de firstName/lastName
            id: true,
          },
        },
        tags: true, // ✅ Inclure les tags
      },
    });

    if (!post) {
      return null;
    }

    return {
      ...post,
      publishedAt: post.publishedAt?.toISOString() || null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      tags: post.tags.map((tag) => tag.name), // ✅ Extraire les noms des tags
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article:", error);
    return null;
  }
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { slug } = await params;

  // ✅ Vérifier que l'utilisateur est admin ou modérateur
  const { user } = await requireAdmin();
  const canEdit =
    user?.publicMetadata?.role === "admin" ||
    user?.publicMetadata?.role === "moderator";

  if (!canEdit) {
    notFound();
  }

  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/blog/${post.slug}`} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;article
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Modifier l&apos;article</CardTitle>
          <CardDescription>
            Modifiez les informations de l&apos;article &quot;{post.title}&quot;
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditBlogForm post={post} />
        </CardContent>
      </Card>
    </div>
  );
}
