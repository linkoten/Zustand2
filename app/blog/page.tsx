import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { BlogCategory, UserRole } from "@/lib/generated/prisma";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import BlogFilters from "@/components/blog/blogFilters";
import BlogList from "@/components/blog/blogList";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Blog - FossilShop",
  description:
    "Découvrez nos articles sur la paléontologie, les fossiles et l'histoire de la Terre",
  keywords: "paléontologie, fossiles, blog, géologie, préhistoire",
};

interface BlogPageProps {
  searchParams: Promise<{
    category?: string;
    tag?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedSearchParams = await searchParams;
  const { category, tag, search, page = "1" } = resolvedSearchParams;

  // Vérifier les permissions de l'utilisateur
  const { userId } = await auth();
  let canCreateArticle = false;

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    canCreateArticle =
      user?.role === UserRole.ADMIN || user?.role === UserRole.MODERATOR;
  }

  // Convertir les paramètres pour l'API
  const filters = {
    category: category as BlogCategory | undefined,
    tag,
    search,
    page: parseInt(page),
    limit: 12,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1"></div>

            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Blog Paléontologie
              </h1>
            </div>

            {/* Bouton de création d'article (visible seulement pour admin/modérateur) */}
            <div className="flex-1 flex justify-end">
              {canCreateArticle && (
                <Button asChild className="shadow-lg">
                  <Link href="/blog/create" className="flex items-center gap-2">
                    <PlusCircle className="w-5 h-5" />
                    Nouvel article
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez le monde fascinant des fossiles, explorez l&apos;histoire
            de la Terre et approfondissez vos connaissances en paléontologie
          </p>
        </div>

        {/* Filtres */}
        <div className="mb-8">
          <BlogFilters />
        </div>

        {/* Liste des articles */}
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-sm animate-pulse"
                >
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <BlogList filters={filters} />
        </Suspense>
      </div>
    </div>
  );
}
