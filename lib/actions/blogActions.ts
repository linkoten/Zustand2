"use server";

import {
  BlogCategory,
  BlogStatus,
  Prisma,
  UserRole,
} from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { BlogFilters, BlogResult, CreateArticleData } from "@/types/blogType";
import { BlogListItem } from "@/types/type";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notificationAction";

export async function getBlogPosts(
  page: number = 1,
  filters?: {
    search?: string;
    category?: string;
    tag?: string;
  }
) {
  try {
    const limit = 12;
    const skip = (page - 1) * limit;

    // Construire les conditions WHERE
    const whereConditions: Prisma.ArticleBlogWhereInput = {
      status: BlogStatus.PUBLISHED,
      publishedAt: {
        lte: new Date(),
      },
    };

    // ✅ Filtre par catégorie
    if (filters?.category) {
      whereConditions.category = filters.category as BlogCategory;
    }

    // ✅ Filtre par tag
    if (filters?.tag) {
      whereConditions.tags = {
        some: {
          OR: [
            { slug: filters.tag },
            { name: { equals: filters.tag, mode: "insensitive" } },
          ],
        },
      };
    }

    // ✅ Filtre par recherche (titre, excerpt, contenu)
    if (filters?.search) {
      whereConditions.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { excerpt: { contains: filters.search, mode: "insensitive" } },
        { content: { contains: filters.search, mode: "insensitive" } },
        {
          tags: {
            some: {
              name: { contains: filters.search, mode: "insensitive" },
            },
          },
        },
      ];
    }

    console.log(
      "Conditions de filtrage appliquées:",
      JSON.stringify(whereConditions, null, 2)
    );

    const [posts, totalPosts] = await Promise.all([
      prisma.articleBlog.findMany({
        where: whereConditions,
        include: {
          author: {
            select: {
              name: true,
              id: true,
            },
          },
          tags: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
            },
          },
        },
        orderBy: {
          publishedAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.articleBlog.count({
        where: whereConditions,
      }),
    ]);

    const totalPages = Math.ceil(totalPosts / limit);

    console.log(`Filtres appliqués: ${JSON.stringify(filters)}`);
    console.log(`Articles trouvés: ${posts.length}/${totalPosts}`);

    return {
      posts: posts.map((post) => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        slug: post.slug,
        category: post.category,
        tags: post.tags,
        featuredImage: post.featuredImage,
        publishedAt:
          post.publishedAt?.toISOString() || post.createdAt.toISOString(),
        readTime: post.readTime,
        views: post.views,
        author: {
          name: post.author.name,
          id: post.author.id,
        },
      })),
      totalPages,
      currentPage: page,
      totalPosts,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des articles:", error);
    return {
      posts: [],
      totalPages: 0,
      currentPage: 1,
      totalPosts: 0,
    };
  }
}

export async function getBlogPost(slug: string) {
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

    // Après la création du post :
    const users = await prisma.user.findMany();
    await Promise.all(
      users.map((user) =>
        createNotification({
          userId: user.clerkId,
          type: "BLOG",
          title: "Nouvel article publié",
          message: `Un nouvel article "${article.title}" vient d'être publié sur le blog.`,
          link: `/blog/${article.slug}`,
        })
      )
    );

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
