const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://paleolitho.com";

// ── Product (fossil) ───────────────────────────────────────────────────────

interface ProductJsonLdOptions {
  id: number;
  lang: string;
  title: string;
  description?: string;
  price: number;
  images: Array<{ imageUrl: string; altText?: string | null }>;
  species: string;
  category: string;
  geologicalPeriod: string;
  countryOfOrigin: string;
  averageRating?: number;
  totalRatings?: number;
  status: string;
}

export function buildProductJsonLd(p: ProductJsonLdOptions) {
  const availability =
    p.status === "AVAILABLE"
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: p.description || `${p.species} — ${p.geologicalPeriod}`,
    url: `${BASE_URL}/${p.lang}/fossiles/${p.id}`,
    image: p.images.map((img) => img.imageUrl),
    brand: {
      "@type": "Brand",
      name: "Paleolitho",
    },
    category: `Fossile / ${p.category}`,
    offers: {
      "@type": "Offer",
      price: p.price.toFixed(2),
      priceCurrency: "EUR",
      availability,
      url: `${BASE_URL}/${p.lang}/fossiles/${p.id}`,
      seller: {
        "@type": "Organization",
        name: "Paleolitho",
        url: BASE_URL,
      },
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Espèce",
        value: p.species,
      },
      {
        "@type": "PropertyValue",
        name: "Période géologique",
        value: p.geologicalPeriod,
      },
      {
        "@type": "PropertyValue",
        name: "Pays d'origine",
        value: p.countryOfOrigin,
      },
    ],
  };

  if (p.averageRating && p.totalRatings && p.totalRatings > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: p.averageRating.toFixed(1),
      reviewCount: p.totalRatings,
      bestRating: "5",
      worstRating: "1",
    };
  }

  return jsonLd;
}

// ── BlogPosting (article) ─────────────────────────────────────────────────

interface ArticleJsonLdOptions {
  slug: string;
  lang: string;
  title: string;
  excerpt?: string;
  featuredImage?: string;
  imageAlt?: string;
  authorName: string;
  publishedAt?: string;
  updatedAt: string;
  tags: string[];
  readTime?: number;
}

export function buildArticleJsonLd(a: ArticleJsonLdOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: a.title,
    description: a.excerpt || a.title,
    url: `${BASE_URL}/${a.lang}/blog/${a.slug}`,
    ...(a.featuredImage && {
      image: {
        "@type": "ImageObject",
        url: a.featuredImage,
        description: a.imageAlt || a.title,
      },
    }),
    author: {
      "@type": "Person",
      name: a.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Paleolitho",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
      },
    },
    datePublished: a.publishedAt,
    dateModified: a.updatedAt,
    keywords: a.tags.join(", "),
    ...(a.readTime && { timeRequired: `PT${a.readTime}M` }),
    inLanguage: a.lang === "fr" ? "fr-FR" : "en-US",
    isPartOf: {
      "@type": "Blog",
      name: "Paleolitho Blog",
      url: `${BASE_URL}/${a.lang}/blog`,
    },
  };
}

// ── BreadcrumbList ────────────────────────────────────────────────────────

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
