"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { CollectionStatus } from "@/lib/generated/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  AdminCollectionStats,
  CollectionFilters,
  CreateFossilSpeciesData,
  EnrichedSpeciesFacet,
  FossilSpeciesDetail,
  PaginatedSpecies,
  UpdateFossilSpeciesData,
  UserCollectionStats,
} from "@/types/collectionType";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function speciesSelect(clerkId?: string | null) {
  return {
    id: true,
    genus: true,
    species: true,
    commonName: true,
    category: true,
    localityId: true,
    locality: { select: { name: true } },
    countryOfOrigin: true,
    geologicalPeriod: true,
    geologicalStage: true,
    rarity: true,
    photos: true,
    _count: {
      select: {
        userCollection: true,
        products: true,
      },
    },
    userCollection: clerkId
      ? {
          where: { user: { clerkId } },
          select: { status: true },
          take: 1,
        }
      : undefined,
  } as const;
}

// ─── Facets for cascade filters + explorer ────────────────────────────────────

export async function getSpeciesFacets(): Promise<EnrichedSpeciesFacet[]> {
  const { userId: clerkId } = await auth();

  const raw = await prisma.fossilSpecies.findMany({
    select: {
      id: true,
      localityId: true,
      locality: { select: { name: true } },
      countryOfOrigin: true,
      geologicalPeriod: true,
      geologicalStage: true,
      category: true,
    },
    orderBy: [{ countryOfOrigin: "asc" }, { genus: "asc" }],
  });

  // Fetch user's collection entries separately to avoid complex conditional typing
  const userStatusMap = new Map<string, "OWNED" | "WISHLIST">();
  if (clerkId) {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (dbUser) {
      const entries = await prisma.userCollection.findMany({
        where: { userId: dbUser.id },
        select: { fossilSpeciesId: true, status: true },
      });
      for (const e of entries) {
        userStatusMap.set(e.fossilSpeciesId, e.status as "OWNED" | "WISHLIST");
      }
    }
  }

  return raw.map((s) => ({
    id: s.id,
    localityId: s.localityId,
    localityName: s.locality.name,
    countryOfOrigin: s.countryOfOrigin,
    geologicalPeriod: s.geologicalPeriod,
    geologicalStage: s.geologicalStage,
    category: s.category,
    userStatus: userStatusMap.get(s.id) ?? null,
  }));
}

// ─── Public: list & filters ───────────────────────────────────────────────────

export async function getFossilSpecies(
  filters: CollectionFilters = {},
): Promise<PaginatedSpecies> {
  const {
    localityId,
    country,
    category,
    geologicalPeriod,
    geologicalStage,
    rarity,
    search,
    status,
    page = 1,
    pageSize = 24,
  } = filters;

  const { userId: clerkId } = await auth();

  // Resolve DB user id for status filter (only when needed)
  let dbUserId: string | null = null;
  if (status && clerkId) {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    dbUserId = dbUser?.id ?? null;
  }

  // Build status sub-filter
  let statusFilter = {};
  if (dbUserId) {
    if (status === "NONE") {
      statusFilter = { userCollection: { none: { userId: dbUserId } } };
    } else if (status === "OWNED" || status === "WISHLIST") {
      statusFilter = { userCollection: { some: { userId: dbUserId, status } } };
    }
  }

  const where = {
    ...statusFilter,
    ...(localityId ? { localityId } : {}),
    ...(country ? { countryOfOrigin: country } : {}),
    ...(category ? { category } : {}),
    ...(geologicalPeriod ? { geologicalPeriod } : {}),
    ...(geologicalStage ? { geologicalStage } : {}),
    ...(rarity ? { rarity } : {}),
    ...(search
      ? {
          OR: [
            { genus: { contains: search, mode: "insensitive" as const } },
            { species: { contains: search, mode: "insensitive" as const } },
            { commonName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [raw, total] = await Promise.all([
    prisma.fossilSpecies.findMany({
      where,
      orderBy: [{ category: "asc" }, { genus: "asc" }, { species: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: speciesSelect(clerkId) as never,
    }),
    prisma.fossilSpecies.count({ where }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = (raw as any[]).map((s) => ({
    id: s.id,
    genus: s.genus,
    species: s.species,
    commonName: s.commonName,
    category: s.category,
    localityId: s.localityId,
    localityName: s.locality.name,
    countryOfOrigin: s.countryOfOrigin,
    geologicalPeriod: s.geologicalPeriod,
    geologicalStage: s.geologicalStage,
    rarity: s.rarity,
    photos: s.photos,
    userStatus: s.userCollection?.[0]?.status ?? null,
    wishlistCount: s._count.userCollection,
    productCount: s._count.products,
  }));

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ─── Public: single species ───────────────────────────────────────────────────

export async function getFossilSpeciesById(
  id: string,
): Promise<FossilSpeciesDetail | null> {
  const { userId: clerkId } = await auth();

  const s = await prisma.fossilSpecies.findUnique({
    where: { id },
    include: {
      locality: { select: { name: true } },
      products: {
        where: { status: "AVAILABLE" },
        select: {
          id: true,
          title: true,
          price: true,
          status: true,
          images: { select: { imageUrl: true }, take: 1 },
        },
      },
      userCollection: clerkId
        ? {
            where: { user: { clerkId } },
            select: {
              id: true,
              fossilSpeciesId: true,
              status: true,
              acquiredAt: true,
              notes: true,
            },
            take: 1,
          }
        : undefined,
      _count: { select: { userCollection: true, products: true } },
    },
  });

  if (!s) return null;

  return {
    id: s.id,
    genus: s.genus,
    species: s.species,
    commonName: s.commonName,
    description: s.description,
    category: s.category,
    localityId: s.localityId,
    localityName: s.locality.name,
    countryOfOrigin: s.countryOfOrigin,
    geologicalPeriod: s.geologicalPeriod,
    geologicalStage: s.geologicalStage,
    rarity: s.rarity,
    photos: s.photos,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    userStatus:
      (s as never as { userCollection?: { status: CollectionStatus }[] })
        .userCollection?.[0]?.status ?? null,
    wishlistCount: s._count.userCollection,
    productCount: s._count.products,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    products: (s.products as any[]).map((p) => ({
      id: p.id,
      title: p.title,
      price: Number(p.price),
      status: p.status,
      images: p.images,
    })),
    userCollection:
      (
        s as never as {
          userCollection?: {
            id: string;
            fossilSpeciesId: string;
            status: CollectionStatus;
            acquiredAt: Date | null;
            notes: string | null;
          }[];
        }
      ).userCollection?.[0] ?? null,
  };
}

// ─── User: toggle collection status ──────────────────────────────────────────

export async function toggleUserCollection(
  fossilSpeciesId: string,
  status: CollectionStatus,
): Promise<{ status: CollectionStatus | null }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Not authenticated");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  if (!dbUser) throw new Error("User not found");

  const existing = await prisma.userCollection.findUnique({
    where: { userId_fossilSpeciesId: { userId: dbUser.id, fossilSpeciesId } },
  });

  if (existing?.status === status) {
    // Toggle off — remove from collection
    await prisma.userCollection.delete({ where: { id: existing.id } });
    revalidatePath("/[lang]/collection", "page");
    return { status: null };
  }

  await prisma.userCollection.upsert({
    where: { userId_fossilSpeciesId: { userId: dbUser.id, fossilSpeciesId } },
    create: { userId: dbUser.id, fossilSpeciesId, status },
    update: { status },
  });

  revalidatePath("/[lang]/collection", "page");
  return { status };
}

// ─── User: my collection stats ────────────────────────────────────────────────

export async function getUserCollectionStats(): Promise<UserCollectionStats> {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Not authenticated");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  if (!dbUser) throw new Error("User not found");

  const [entries, allSpecies] = await Promise.all([
    prisma.userCollection.findMany({
      where: { userId: dbUser.id },
      include: {
        fossilSpecies: {
          select: {
            category: true,
            localityId: true,
            locality: { select: { name: true } },
          },
        },
      },
    }),
    prisma.fossilSpecies.groupBy({
      by: ["localityId", "category"],
      _count: { id: true },
    }),
  ]);

  const totalOwned = entries.filter((e) => e.status === "OWNED").length;
  const totalWishlist = entries.filter((e) => e.status === "WISHLIST").length;

  // Build locality progress
  const localityMap = new Map<
    number,
    { name: string; owned: number; wishlist: number }
  >();
  for (const e of entries) {
    const loc = e.fossilSpecies.locality;
    const lid = e.fossilSpecies.localityId;
    if (!localityMap.has(lid))
      localityMap.set(lid, { name: loc.name, owned: 0, wishlist: 0 });
    const l = localityMap.get(lid)!;
    if (e.status === "OWNED") l.owned++;
    else l.wishlist++;
  }

  const localityTotalMap = new Map<number, number>();
  for (const row of allSpecies) {
    const cur = localityTotalMap.get(row.localityId) ?? 0;
    localityTotalMap.set(row.localityId, cur + row._count.id);
  }

  const byLocality = [...localityMap.entries()].map(([localityId, v]) => ({
    localityId,
    localityName: v.name,
    totalSpecies: localityTotalMap.get(localityId) ?? 0,
    ownedCount: v.owned,
    wishlistCount: v.wishlist,
  }));

  // Build category progress
  const catMap = new Map<string, { owned: number; wishlist: number }>();
  for (const e of entries) {
    const cat = e.fossilSpecies.category;
    if (!catMap.has(cat)) catMap.set(cat, { owned: 0, wishlist: 0 });
    const c = catMap.get(cat)!;
    if (e.status === "OWNED") c.owned++;
    else c.wishlist++;
  }

  const catTotalMap = new Map<string, number>();
  for (const row of allSpecies) {
    const cur = catTotalMap.get(row.category) ?? 0;
    catTotalMap.set(row.category, cur + row._count.id);
  }

  const byCategory = [...catMap.entries()].map(([category, v]) => ({
    category: category as import("@/lib/generated/prisma").Category,
    totalSpecies: catTotalMap.get(category) ?? 0,
    ownedCount: v.owned,
    wishlistCount: v.wishlist,
  }));

  return { totalOwned, totalWishlist, byLocality, byCategory };
}

// ─── Admin: CRUD ──────────────────────────────────────────────────────────────

export async function createFossilSpecies(data: CreateFossilSpeciesData) {
  await requireAdmin();

  const species = await prisma.fossilSpecies.create({
    data: {
      genus: data.genus,
      species: data.species,
      commonName: data.commonName ?? null,
      description: data.description ?? null,
      localityId: data.localityId,
      geologicalPeriod: data.geologicalPeriod,
      geologicalStage: data.geologicalStage,
      category: data.category,
      countryOfOrigin: data.countryOfOrigin,
      rarity: data.rarity ?? null,
      photos: data.photos ?? [],
    },
  });

  revalidatePath("/[lang]/collection", "page");
  revalidatePath("/[lang]/dashboard/collection", "page");
  return species;
}

export async function updateFossilSpecies(
  id: string,
  data: UpdateFossilSpeciesData,
) {
  await requireAdmin();

  const species = await prisma.fossilSpecies.update({
    where: { id },
    data: {
      ...(data.genus !== undefined && { genus: data.genus }),
      ...(data.species !== undefined && { species: data.species }),
      ...(data.commonName !== undefined && { commonName: data.commonName }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.localityId !== undefined && { localityId: data.localityId }),
      ...(data.geologicalPeriod !== undefined && {
        geologicalPeriod: data.geologicalPeriod,
      }),
      ...(data.geologicalStage !== undefined && {
        geologicalStage: data.geologicalStage,
      }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.countryOfOrigin !== undefined && {
        countryOfOrigin: data.countryOfOrigin,
      }),
      ...(data.rarity !== undefined && { rarity: data.rarity }),
      ...(data.photos !== undefined && { photos: data.photos }),
    },
  });

  revalidatePath("/[lang]/collection", "page");
  revalidatePath("/[lang]/dashboard/collection", "page");
  return species;
}

export async function deleteFossilSpecies(id: string) {
  await requireAdmin();
  await prisma.fossilSpecies.delete({ where: { id } });
  revalidatePath("/[lang]/collection", "page");
  revalidatePath("/[lang]/dashboard/collection", "page");
}

export async function getAdminCollectionStats(): Promise<AdminCollectionStats> {
  await requireAdmin();

  const [totalSpecies, totalCollectors, topWishlistRaw] = await Promise.all([
    prisma.fossilSpecies.count(),
    prisma.userCollection
      .groupBy({ by: ["userId"], _count: true })
      .then((r) => r.length),
    prisma.userCollection.groupBy({
      by: ["fossilSpeciesId"],
      where: { status: "WISHLIST" },
      _count: { fossilSpeciesId: true },
      orderBy: { _count: { fossilSpeciesId: "desc" } },
      take: 10,
    }),
  ]);

  const speciesIds = topWishlistRaw.map((r) => r.fossilSpeciesId);
  const speciesDetails = await prisma.fossilSpecies.findMany({
    where: { id: { in: speciesIds } },
    select: {
      id: true,
      genus: true,
      species: true,
      locality: { select: { name: true } },
      _count: { select: { products: true } },
    },
  });

  const detailMap = new Map(speciesDetails.map((s) => [s.id, s]));

  const topWishlisted = topWishlistRaw.map((r) => {
    const s = detailMap.get(r.fossilSpeciesId);
    return {
      id: r.fossilSpeciesId,
      genus: s?.genus ?? "",
      species: s?.species ?? "",
      localityName: s?.locality.name ?? "",
      wishlistCount: r._count.fossilSpeciesId,
      hasStock: (s?._count.products ?? 0) > 0,
    };
  });

  return { totalSpecies, totalCollectors, topWishlisted };
}

// ─── Admin: import from existing products ─────────────────────────────────────

export async function importSpeciesFromProducts(): Promise<{
  created: number;
  skipped: number;
}> {
  await requireAdmin();

  const products = await prisma.product.findMany({
    select: {
      genre: true,
      species: true,
      category: true,
      localityId: true,
      countryOfOrigin: true,
      geologicalPeriod: true,
      geologicalStage: true,
    },
  });

  let created = 0;
  let skipped = 0;

  for (const p of products) {
    const existing = await prisma.fossilSpecies.findFirst({
      where: { genus: p.genre, species: p.species, localityId: p.localityId },
    });
    if (existing) {
      skipped++;
      continue;
    }

    await prisma.fossilSpecies.create({
      data: {
        genus: p.genre,
        species: p.species,
        category: p.category,
        localityId: p.localityId,
        countryOfOrigin: p.countryOfOrigin,
        geologicalPeriod: p.geologicalPeriod,
        geologicalStage: p.geologicalStage,
        photos: [],
      },
    });
    created++;
  }

  revalidatePath("/[lang]/collection", "page");
  revalidatePath("/[lang]/dashboard/collection", "page");
  return { created, skipped };
}
