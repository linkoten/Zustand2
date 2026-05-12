"use server";

import prisma from "@/lib/prisma";
import { ProductStatus, BlogStatus } from "@/lib/generated/prisma";

export interface GlobalSearchResult {
  fossils: {
    id: number;
    title: string;
    category: string;
    price: number;
    imageUrl: string | null;
  }[];
  articles: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    category: string;
    featuredImage: string | null;
  }[];
}

export async function globalSearch(
  query: string,
  lang: string = "fr",
): Promise<GlobalSearchResult> {
  if (!query || query.trim().length < 2) {
    return { fossils: [], articles: [] };
  }

  const q = query.trim();

  const [fossilsRaw, articlesRaw] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: ProductStatus.AVAILABLE,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { species: { contains: q, mode: "insensitive" } },
          { genre: { contains: q, mode: "insensitive" } },
          { countryOfOrigin: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        category: true,
        price: true,
        images: { select: { imageUrl: true }, orderBy: { order: "asc" }, take: 1 },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.articleBlog.findMany({
      where: {
        status: BlogStatus.PUBLISHED,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { excerpt: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        category: true,
        featuredImage: true,
      },
      take: 5,
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  return {
    fossils: fossilsRaw.map((f) => ({
      id: f.id,
      title: f.title,
      category: f.category,
      price: Number(f.price),
      imageUrl: f.images[0]?.imageUrl ?? null,
    })),
    articles: articlesRaw.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      category: a.category,
      featuredImage: a.featuredImage,
    })),
  };
}
