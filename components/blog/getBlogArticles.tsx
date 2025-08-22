"use server";

import prisma from "@/lib/prisma";
import { BlogCategory, BlogStatus, Prisma } from "@/lib/generated/prisma";
import { BlogListItem } from "@/types/type";

interface BlogFilters {
  category?: BlogCategory;
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface BlogResult {
  articles: BlogListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export async function getBlogArticles(
  filters: BlogFilters = {}
): Promise<BlogResult> {
  try {
    const { category, tag, search, page = 1, limit = 12 } = filters;

    // Construire les conditions WHERE
    const whereConditions: Prisma.ArticleBlogWhereInput = {
      status: BlogStatus.PUBLISHED,
      publishedAt: {
        lte: new Date(),
      },
    };

    if (category) {
      whereConditions.category = category;
    }

    if (tag) {
      whereConditions.tags = {
        some: {
          slug: tag,
        },
      };
    }

    if (search) {
      whereConditions.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    // Compter le total d'articles
    const totalCount = await prisma.articleBlog.count({
      where: whereConditions,
    });

    // Récupérer les articles avec pagination
    const articles = await prisma.articleBlog.findMany({
      where: whereConditions,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            color: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Sérialiser les données
    const serializedArticles: BlogListItem[] = articles.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || undefined,
      featuredImage: article.featuredImage || undefined,
      imageAlt: article.imageAlt || undefined,
      category: article.category,
      publishedAt: article.publishedAt?.toISOString(),
      readTime: article.readTime || undefined,
      views: article.views,
      author: {
        name: article.author.name || undefined,
        email: article.author.email,
      },
      tags: article.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description || undefined,
        color: tag.color || undefined,
        createdAt: tag.createdAt.toISOString(),
      })),
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return {
      articles: serializedArticles,
      totalCount,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des articles:", error);
    return {
      articles: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
    };
  }
}

// Fonction pour obtenir les catégories avec leur nombre d'articles
export async function getBlogCategories() {
  try {
    const categories = await prisma.articleBlog.groupBy({
      by: ["category"],
      where: {
        status: BlogStatus.PUBLISHED,
        publishedAt: {
          lte: new Date(),
        },
      },
      _count: {
        category: true,
      },
    });

    return categories.map((cat) => ({
      category: cat.category,
      count: cat._count.category,
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    return [];
  }
}

// Fonction pour obtenir les tags populaires
export async function getPopularTags(limit: number = 10) {
  try {
    const tags = await prisma.blogTag.findMany({
      include: {
        _count: {
          select: {
            articles: {
              where: {
                status: BlogStatus.PUBLISHED,
                publishedAt: {
                  lte: new Date(),
                },
              },
            },
          },
        },
      },
      orderBy: {
        articles: {
          _count: "desc",
        },
      },
      take: limit,
    });

    return tags
      .filter((tag) => tag._count.articles > 0)
      .map((tag) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description || undefined,
        color: tag.color || undefined,
        count: tag._count.articles,
        createdAt: tag.createdAt.toISOString(),
      }));
  } catch (error) {
    console.error("Erreur lors de la récupération des tags:", error);
    return [];
  }
}

// ✅ Fonction pour obtenir un article par son slug
export async function getBlogArticleBySlug(slug: string) {
  try {
    const article = await prisma.articleBlog.findUnique({
      where: {
        slug,
        status: BlogStatus.PUBLISHED,
        publishedAt: {
          lte: new Date(),
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            color: true,
            createdAt: true,
          },
        },
      },
    });

    if (!article) return null;

    // Incrémenter le nombre de vues
    await prisma.articleBlog.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    });

    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || undefined,
      content: article.content,
      featuredImage: article.featuredImage || undefined,
      imageAlt: article.imageAlt || undefined,
      category: article.category,
      status: article.status,
      publishedAt: article.publishedAt?.toISOString(),
      readTime: article.readTime || undefined,
      views: article.views,
      seoTitle: article.seoTitle || undefined,
      seoDescription: article.seoDescription || undefined,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
      authorId: article.authorId,
      author: {
        id: article.author.id,
        name: article.author.name || undefined,
        email: article.author.email,
      },
      tags: article.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description || undefined,
        color: tag.color || undefined,
        createdAt: tag.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article:", error);
    return null;
  }
}
