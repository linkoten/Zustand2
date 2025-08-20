import prisma from "@/lib/prisma";
import { SerializedProduct } from "@/types/type";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProductStatus } from "@/lib/generated/prisma";
import FossilesClient from "@/components/fossils/fossilesClient";

interface SearchParams {
  category?: string;
  countryOfOrigin?: string;
  locality?: string;
  geologicalPeriod?: string;
  geologicalStage?: string;
}

async function getFossils(
  filters: SearchParams = {}
): Promise<SerializedProduct[]> {
  try {
    const whereConditions: any = {
      status: ProductStatus.AVAILABLE,
    };

    if (filters.category) whereConditions.category = filters.category;
    if (filters.countryOfOrigin)
      whereConditions.countryOfOrigin = filters.countryOfOrigin;
    if (filters.locality) whereConditions.locality = filters.locality;
    if (filters.geologicalPeriod)
      whereConditions.geologicalPeriod = filters.geologicalPeriod;
    if (filters.geologicalStage)
      whereConditions.geologicalStage = filters.geologicalStage;

    const fossils = await prisma.product.findMany({
      where: whereConditions,
      include: {
        images: {
          orderBy: { order: "asc" },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return fossils.map((fossil) => ({
      ...fossil,
      price: fossil.price.toNumber(),
      description: fossil.description || undefined,
      createdAt: fossil.createdAt.toISOString(),
      updatedAt: fossil.updatedAt.toISOString(),
      images: fossil.images.map((image) => ({
        id: image.id,
        imageUrl: image.imageUrl,
        altText: image.altText || undefined,
        order: image.order,
        createdAt: image.createdAt.toISOString(),
      })),
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des fossiles:", error);
    return [];
  }
}

async function getFilterOptions() {
  try {
    const [
      categoriesResult,
      countriesResult,
      localitiesResult,
      geologicalPeriodsResult,
      geologicalStagesResult,
    ] = await Promise.all([
      prisma.product.findMany({
        where: { status: ProductStatus.AVAILABLE },
        select: { category: true },
        distinct: ["category"],
      }),
      prisma.product.findMany({
        where: { status: ProductStatus.AVAILABLE },
        select: { countryOfOrigin: true },
        distinct: ["countryOfOrigin"],
      }),
      prisma.product.findMany({
        where: { status: ProductStatus.AVAILABLE },
        select: { locality: true },
        distinct: ["locality"],
      }),
      prisma.product.findMany({
        where: { status: ProductStatus.AVAILABLE },
        select: { geologicalPeriod: true },
        distinct: ["geologicalPeriod"],
      }),
      prisma.product.findMany({
        where: { status: ProductStatus.AVAILABLE },
        select: { geologicalStage: true },
        distinct: ["geologicalStage"],
      }),
    ]);

    return {
      categories: categoriesResult.map((item) => item.category),
      countries: countriesResult.map((item) => item.countryOfOrigin).sort(),
      localities: localitiesResult.map((item) => item.locality).sort(),
      geologicalPeriods: geologicalPeriodsResult.map(
        (item) => item.geologicalPeriod
      ),
      geologicalStages: geologicalStagesResult
        .map((item) => item.geologicalStage)
        .sort(),
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des options de filtre:",
      error
    );
    return {
      categories: [],
      countries: [],
      localities: [],
      geologicalPeriods: [],
      geologicalStages: [],
    };
  }
}

export default async function FossilesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const fossils = await getFossils(resolvedSearchParams);
  const filterOptions = await getFilterOptions();
  const { userId } = await auth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Nos Fossiles</h1>
            <p className="text-muted-foreground">
              Découvrez notre collection de fossiles authentiques
            </p>
          </div>

          {userId && (
            <Button asChild>
              <Link href="/admin/create-product">
                <Plus className="mr-2 h-4 w-4" />
                Créer un produit
              </Link>
            </Button>
          )}
        </div>
      </div>

      <FossilesClient fossils={fossils} filterOptions={filterOptions} />
    </div>
  );
}
