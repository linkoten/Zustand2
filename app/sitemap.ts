import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://paleolitho.com";

const LANGS = ["fr", "en"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ── Static pages ────────────────────────────────────────────────────
  const staticPaths = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/fossiles", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/blog", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/sign-in", priority: 0.3, changeFrequency: "monthly" as const },
    { path: "/sign-up", priority: 0.3, changeFrequency: "monthly" as const },
  ];

  const staticEntries: MetadataRoute.Sitemap = LANGS.flatMap((lang) =>
    staticPaths.map(({ path, priority, changeFrequency }) => ({
      url: `${BASE_URL}/${lang}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    })),
  );

  // ── Fossil product pages ────────────────────────────────────────────
  let fossilEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: { status: "AVAILABLE" },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    fossilEntries = LANGS.flatMap((lang) =>
      products.map((p) => ({
        url: `${BASE_URL}/${lang}/fossiles/${p.id}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    );
  } catch (e) {
    console.error("sitemap: failed to fetch products", e);
  }

  // ── Blog article pages ──────────────────────────────────────────────
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const articles = await prisma.articleBlog.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: now },
      },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    });

    blogEntries = LANGS.flatMap((lang) =>
      articles.map((a) => ({
        url: `${BASE_URL}/${lang}/blog/${a.slug}`,
        lastModified: a.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    );
  } catch (e) {
    console.error("sitemap: failed to fetch articles", e);
  }

  return [...staticEntries, ...fossilEntries, ...blogEntries];
}
