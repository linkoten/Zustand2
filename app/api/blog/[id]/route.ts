import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { BlogCategory, BlogStatus } from "@/lib/generated/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Vérifier que l'utilisateur est admin ou modérateur
    const { user } = await requireAdmin();
    const canEdit =
      user?.publicMetadata?.role === "admin" ||
      user?.publicMetadata?.role === "moderator";

    if (!canEdit) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const { id: postId } = await params;
    const body = await request.json();

    const {
      title,
      excerpt,
      content,
      slug,
      category,
      tags,
      featuredImage,
      imageAlt,
      status,
      readTime,
      seoTitle,
      seoDescription,
    } = body;

    // Validation des champs requis
    if (!title || !content || !slug || !category || !status) {
      return NextResponse.json(
        { error: "Tous les champs requis doivent être remplis" },
        { status: 400 }
      );
    }

    // Vérifier que l'article existe
    const existingPost = await prisma.articleBlog.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "Article non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier l'unicité du slug (sauf pour le post actuel)
    const slugExists = await prisma.articleBlog.findFirst({
      where: {
        slug,
        id: { not: postId },
      },
    });

    if (slugExists) {
      return NextResponse.json(
        { error: "Ce slug est déjà utilisé par un autre article" },
        { status: 400 }
      );
    }

    // ✅ Gérer les tags
    const tagObjects = await Promise.all(
      tags.map(async (tagName: string) => {
        // Créer le tag s'il n'existe pas
        const tag = await prisma.blogTag.upsert({
          where: { name: tagName },
          update: {},
          create: {
            name: tagName,
            slug: tagName.toLowerCase().replace(/\s+/g, "-"),
          },
        });
        return { id: tag.id };
      })
    );

    // Mettre à jour l'article
    const updatedPost = await prisma.articleBlog.update({
      where: { id: postId },
      data: {
        title,
        excerpt: excerpt || null,
        content,
        slug,
        category: category as BlogCategory,
        featuredImage: featuredImage || null,
        imageAlt: imageAlt || null,
        status: status as BlogStatus,
        readTime: readTime ? parseInt(readTime) : null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        // ✅ Reconnexion des tags
        tags: {
          set: tagObjects, // Remplace tous les tags existants
        },
        // Mettre à jour publishedAt si on passe de brouillon à publié
        publishedAt:
          status === "PUBLISHED" && existingPost.status === "DRAFT"
            ? new Date()
            : existingPost.publishedAt,
      },
    });

    return NextResponse.json(
      {
        message: "Article mis à jour avec succès",
        post: updatedPost,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'article:", error);

    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Vérifier que l'utilisateur est admin ou modérateur
    const { user } = await requireAdmin();
    const canEdit =
      user?.publicMetadata?.role === "admin" ||
      user?.publicMetadata?.role === "moderator";

    if (!canEdit) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const { id: postId } = await params;

    if (!postId) {
      return NextResponse.json(
        { error: "ID de l'article requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'article existe
    const existingPost = await prisma.articleBlog.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "Article non trouvé" },
        { status: 404 }
      );
    }

    // ✅ Supprimer l'article (les tags seront déconnectés automatiquement)
    await prisma.articleBlog.delete({
      where: { id: postId },
    });

    return NextResponse.json(
      { message: "Article supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression de l'article:", error);

    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
