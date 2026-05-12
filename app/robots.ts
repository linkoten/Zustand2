import { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://paleolitho.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/api/",
          "/checkout",
          "/fr/dashboard",
          "/en/dashboard",
          "/fr/checkout",
          "/en/checkout",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
