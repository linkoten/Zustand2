"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

/**
 * Génère (ou retourne l'existant) un token de partage pour la collection publique.
 * Réservé à l'utilisateur connecté.
 */
export async function generateCollectionShareToken(): Promise<{
  token: string | null;
  error?: string;
}> {
  const { userId } = await auth();
  if (!userId) return { token: null, error: "Unauthorized" };

  // Upsert: find or create the User row, then set a UUID token
  const token = crypto.randomUUID();

  await prisma.user.update({
    where: { clerkId: userId },
    data: { collectionShareToken: token },
  });

  return { token };
}

/**
 * Révoque le token de partage (rend la collection privée).
 */
export async function revokeCollectionShareToken(): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  await prisma.user.update({
    where: { clerkId: userId },
    data: { collectionShareToken: null },
  });

  return {};
}

/**
 * Retourne le token actuel de l'utilisateur connecté (null = non partagé).
 */
export async function getMyShareToken(): Promise<{
  token: string | null;
  error?: string;
}> {
  const { userId } = await auth();
  if (!userId) return { token: null, error: "Unauthorized" };

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { collectionShareToken: true },
  });

  return { token: user?.collectionShareToken ?? null };
}

/**
 * Accès public – retourne la collection d'un utilisateur via son token.
 * Aucune authentification requise.
 */
export async function getPublicCollectionByToken(token: string): Promise<{
  ownerName: string | null;
  favorites: {
    id: number;
    title: string;
    price: number;
    category: string;
    mainImageUrl: string | null;
  }[];
} | null> {
  if (!token || token.length < 10) return null;

  const user = await prisma.user.findUnique({
    where: { collectionShareToken: token },
    select: {
      name: true,
      favorites: {
        select: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              category: true,
              images: {
                where: { isMain: true },
                select: { imageUrl: true },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  const favorites = user.favorites.map((fav) => ({
    id: fav.product.id,
    title: fav.product.title,
    price: fav.product.price,
    category: fav.product.category,
    mainImageUrl: fav.product.images[0]?.imageUrl ?? null,
  }));

  return {
    ownerName: user.name,
    favorites,
  };
}
