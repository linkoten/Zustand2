"use server";

import prisma from "@/lib/prisma";
import { Prisma, UserRole } from "@/lib/generated/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  FossilRequestFilters,
  FossilRequestUpdateData,
} from "@/types/fossilRequestType";
import { getUserData } from "./dashboardActions";
import { createNotification } from "./notificationAction";

async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserData(userId);

  if (!user) {
    redirect("/sign-in");
  }

  return { user, clerkUserId: userId };
}

async function requireAdmin() {
  const { user } = await requireAuth();

  if (user.role !== UserRole.ADMIN) {
    redirect("/dashboard");
  }

  return user;
}

// ✅ Fonction helper pour convertir le rôle string vers UserRole enum
function normalizeUserRole(role: string): UserRole {
  switch (role.toUpperCase()) {
    case "ADMIN":
      return UserRole.ADMIN;
    case "USER":
      return UserRole.USER;
    default:
      return UserRole.USER; // Valeur par défaut
  }
}

// ✅ Fonction corrigée pour supporter tous les utilisateurs
export async function getFossilRequests(
  page: number = 1,
  filters?: FossilRequestFilters
) {
  try {
    // ✅ Utiliser requireAuth() au lieu de requireAdmin()
    const { user, clerkUserId } = await requireAuth();

    const limit = 10;
    const skip = (page - 1) * limit;

    // ✅ Construire les conditions WHERE selon le rôle et les filtres
    const whereConditions: Prisma.FossilRequestWhereInput = {};

    // ✅ Logique de filtrage par utilisateur
    const userRole = normalizeUserRole(user.role);
    const shouldFilterByUser =
      filters?.userOnly === true || userRole !== UserRole.ADMIN;

    if (shouldFilterByUser) {
      whereConditions.clerkUserId = clerkUserId;
    }

    // ✅ Autres filtres
    if (filters?.status) {
      whereConditions.status = filters.status;
    }

    if (filters?.priority) {
      whereConditions.priority = filters.priority;
    }

    if (filters?.search) {
      whereConditions.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { fossilType: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [requests, totalRequests] = await Promise.all([
      prisma.fossilRequest.findMany({
        where: whereConditions,
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.fossilRequest.count({
        where: whereConditions,
      }),
    ]);

    const totalPages = Math.ceil(totalRequests / limit);

    return {
      requests: requests.map((request) => ({
        id: request.id,
        name: request.name,
        email: request.email,
        phone: request.phone,
        fossilType: request.fossilType,
        description: request.description,
        maxBudget: request.maxBudget?.toNumber() || null,
        geologicalPeriod: request.geologicalPeriod,
        category: request.category,
        countryOfOrigin: request.countryOfOrigin,
        locality: request.locality,
        status: request.status,
        priority: request.priority,
        adminNotes: request.adminNotes,
        responseMessage: request.responseMessage, // ✅ Correction du nom de propriété
        respondedBy: request.respondedBy,
        respondedAt: request.respondedAt?.toISOString() || null,
        createdAt: request.createdAt.toISOString(),
        updatedAt: request.updatedAt.toISOString(),
        clerkUserId: request.clerkUserId,
        userRole: userRole, // ✅ Utiliser le rôle normalisé
      })),
      totalPages,
      currentPage: page,
      totalRequests,
      userRole: userRole, // ✅ Utiliser le rôle normalisé
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes:", error);
    return {
      requests: [],
      totalPages: 0,
      currentPage: 1,
      totalRequests: 0,
      userRole: UserRole.USER,
    };
  }
}

// ✅ Fonction pour récupérer une demande par ID (accessible aux utilisateurs)
export async function getFossilRequestById(id: string) {
  try {
    const { user, clerkUserId } = await requireAuth();

    const request = await prisma.fossilRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return null;
    }

    // ✅ Normaliser le rôle utilisateur
    const userRole = normalizeUserRole(user.role);

    // ✅ Vérifier les permissions : admin peut tout voir, utilisateur seulement ses demandes
    const canView =
      userRole === UserRole.ADMIN || request.clerkUserId === clerkUserId;

    if (!canView) {
      return null;
    }

    return {
      id: request.id,
      name: request.name,
      email: request.email,
      phone: request.phone,
      fossilType: request.fossilType,
      description: request.description,
      maxBudget: request.maxBudget?.toNumber() || null,
      geologicalPeriod: request.geologicalPeriod,
      category: request.category,
      countryOfOrigin: request.countryOfOrigin,
      locality: request.locality,
      status: request.status,
      priority: request.priority,
      adminNotes: request.adminNotes,
      responseMessage: request.responseMessage, // ✅ Correction du nom de propriété
      respondedBy: request.respondedBy,
      respondedAt: request.respondedAt?.toISOString() || null,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
      clerkUserId: request.clerkUserId,
      userRole: userRole, // ✅ Utiliser le rôle normalisé
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de la demande:", error);
    return null;
  }
}

// ✅ Fonctions admin (gardent requireAdmin)
export async function updateFossilRequest(
  id: string,
  data: FossilRequestUpdateData
) {
  try {
    await requireAdmin();

    const updateData: Prisma.FossilRequestUpdateInput = {
      updatedAt: new Date(),
    };

    if (data.status !== undefined) {
      updateData.status = data.status;
    }
    if (data.priority !== undefined) {
      updateData.priority = data.priority;
    }
    if (data.responseMessage !== undefined) {
      // ✅ Correction du nom de propriété
      updateData.responseMessage = data.responseMessage;
      updateData.respondedAt = new Date();
    }
    if (data.respondedBy !== undefined) {
      updateData.respondedBy = data.respondedBy;
    }

    const updatedRequest = await prisma.fossilRequest.update({
      where: { id },
      data: updateData,
    });

    // 👉 Notification pour l'utilisateur concerné
    const fossilRequestInDb = await prisma.fossilRequest.findUnique({
      where: { id },
      select: { clerkUserId: true },
    });

    if (fossilRequestInDb?.clerkUserId) {
      // Récupérer le user.id interne à partir du clerkUserId

      await createNotification({
        userId: fossilRequestInDb.clerkUserId, // 👈 ici on utilise l'id interne
        type: "FOSSIL_REQUEST_UPDATE",
        title: "Mise à jour de votre demande",
        message:
          "Votre demande de recherche de fossile a été mise à jour par l'équipe.",
        link: `/dashboard/requests/user/${id}`,
      });
    }

    return {
      success: true,
      request: {
        id: updatedRequest.id,
        name: updatedRequest.name,
        email: updatedRequest.email,
        phone: updatedRequest.phone,
        fossilType: updatedRequest.fossilType,
        description: updatedRequest.description,
        maxBudget: updatedRequest.maxBudget?.toNumber() || null,
        geologicalPeriod: updatedRequest.geologicalPeriod,
        category: updatedRequest.category,
        countryOfOrigin: updatedRequest.countryOfOrigin,
        locality: updatedRequest.locality,
        status: updatedRequest.status,
        priority: updatedRequest.priority,
        adminNotes: updatedRequest.adminNotes,
        responseMessage: updatedRequest.responseMessage, // ✅ Correction du nom de propriété
        respondedBy: updatedRequest.respondedBy,
        respondedAt: updatedRequest.respondedAt?.toISOString() || null,
        createdAt: updatedRequest.createdAt.toISOString(),
        updatedAt: updatedRequest.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la demande:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour de la demande",
    };
  }
}

export async function deleteFossilRequestAsUser(id: string) {
  try {
    const { user, clerkUserId } = await requireAuth();

    // Vérifier que la demande appartient à l'utilisateur
    const request = await prisma.fossilRequest.findUnique({
      where: { id },
      select: { clerkUserId: true },
    });

    if (!request) {
      return {
        success: false,
        error: "Demande non trouvée",
      };
    }

    if (request.clerkUserId !== clerkUserId) {
      return {
        success: false,
        error: "Vous n'avez pas l'autorisation de supprimer cette demande",
      };
    }

    await prisma.fossilRequest.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression de la demande:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression de la demande",
    };
  }
}

// Mise à jour de la fonction existante pour supporter les deux cas
export async function deleteFossilRequest(id: string) {
  try {
    const { user, clerkUserId } = await requireAuth();
    const userRole = normalizeUserRole(user.role);

    // Si admin, peut supprimer n'importe quelle demande
    if (userRole === UserRole.ADMIN) {
      await prisma.fossilRequest.delete({
        where: { id },
      });
      return { success: true };
    }

    // Si utilisateur normal, peut seulement supprimer ses propres demandes
    return await deleteFossilRequestAsUser(id);
  } catch (error) {
    console.error("Erreur lors de la suppression de la demande:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression de la demande",
    };
  }
}
