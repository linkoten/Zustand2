"use server";
import prisma from "@/lib/prisma";
import { GeologicalPeriod } from "@/lib/generated/prisma";

export async function getLocalitiesForMap() {
  try {
    const localities = await prisma.locality.findMany({
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        geologicalPeriods: true,
        geologicalStages: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return localities;
  } catch (error) {
    console.error("Erreur lors de la récupération des localités:", error);
    return [];
  }
}

export async function getLocalitiesByPeriod(
  geologicalPeriod: GeologicalPeriod
) {
  try {
    const localities = await prisma.locality.findMany({
      where: {
        geologicalPeriods: {
          has: geologicalPeriod,
        },
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        geologicalPeriods: true,
        geologicalStages: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return localities;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des localités par période:",
      error
    );
    return [];
  }
}

export async function getLocalitiesByRegion(
  minLat: number,
  maxLat: number,
  minLon: number,
  maxLon: number
) {
  try {
    const localities = await prisma.locality.findMany({
      where: {
        latitude: {
          gte: minLat,
          lte: maxLat,
        },
        longitude: {
          gte: minLon,
          lte: maxLon,
        },
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        geologicalPeriods: true,
        geologicalStages: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return localities;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des localités par région:",
      error
    );
    return [];
  }
}
