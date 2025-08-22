"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { BlogCategory, BlogStatus, UserRole } from "@/lib/generated/prisma";
import { revalidatePath } from "next/cache";

interface CreateArticleData {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  imageAlt?: string;
  category: BlogCategory;
  status: BlogStatus;
  publishedAt?: Date;
  readTime?: number;
  seoTitle?: string;
  seoDescription?: string;
  tagIds: string[];
}

export async function createBlogArticle(data: CreateArticleData) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Utilisateur non connecté");
    }

    // Vérifier que l'utilisateur est admin ou modérateur
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (
      !user ||
      (user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR)
    ) {
      throw new Error("Accès non autorisé");
    }

    // Vérifier que le slug est unique
    const existingArticle = await prisma.articleBlog.findUnique({
      where: { slug: data.slug },
    });

    if (existingArticle) {
      throw new Error("Ce slug existe déjà. Veuillez en choisir un autre.");
    }

    // Créer l'article
    const article = await prisma.articleBlog.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || undefined,
        content: data.content,
        featuredImage: data.featuredImage || undefined,
        imageAlt: data.imageAlt || undefined,
        category: data.category,
        status: data.status,
        publishedAt:
          data.status === BlogStatus.PUBLISHED
            ? data.publishedAt || new Date()
            : undefined,
        readTime: data.readTime || undefined,
        seoTitle: data.seoTitle || undefined,
        seoDescription: data.seoDescription || undefined,
        authorId: user.id,
        tags: {
          connect: data.tagIds.map((id) => ({ id })),
        },
      },
      include: {
        tags: true,
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    console.log("✅ Article créé:", article.id);

    // Revalider le cache
    revalidatePath("/blog");
    revalidatePath("/admin/blog");

    return { success: true, article };
  } catch (error) {
    console.error("❌ Erreur création article:", error);
    throw error;
  }
}

export async function createBlogTag(name: string, color?: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Utilisateur non connecté");
    }

    // Vérifier que l'utilisateur est admin ou modérateur
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (
      !user ||
      (user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR)
    ) {
      throw new Error("Accès non autorisé");
    }

    // Générer le slug à partir du nom
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
      .replace(/[^a-z0-9\s-]/g, "") // Supprimer les caractères spéciaux
      .replace(/\s+/g, "-") // Remplacer les espaces par des tirets
      .replace(/-+/g, "-") // Supprimer les tirets multiples
      .trim();

    // Vérifier que le tag n'existe pas déjà
    const existingTag = await prisma.blogTag.findFirst({
      where: {
        OR: [{ name: { equals: name, mode: "insensitive" } }, { slug }],
      },
    });

    if (existingTag) {
      throw new Error("Ce tag existe déjà");
    }

    const tag = await prisma.blogTag.create({
      data: {
        name,
        slug,
        color: color || undefined,
      },
    });

    return { success: true, tag };
  } catch (error) {
    console.error("❌ Erreur création tag:", error);
    throw error;
  }
}

export async function getAllBlogTags() {
  try {
    const tags = await prisma.blogTag.findMany({
      orderBy: { name: "asc" },
    });

    return tags;
  } catch (error) {
    console.error("❌ Erreur récupération tags:", error);
    return [];
  }
}
