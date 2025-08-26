"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  FossilRequestFilters,
  FossilRequestUpdateData,
} from "@/types/fossilRequestType";

export async function getFossilRequests(
  page: number = 1,
  filters?: FossilRequestFilters
) {
  try {
    // Vérifier que l'utilisateur est admin
    await requireAdmin();

    const limit = 10;
    const skip = (page - 1) * limit;

    // Construire les conditions WHERE
    const whereConditions: any = {};

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
        adminMessage: request.responseMessage,
        respondedBy: request.respondedBy,
        createdAt: request.createdAt.toISOString(),
        updatedAt: request.updatedAt.toISOString(),
      })),
      totalPages,
      currentPage: page,
      totalRequests,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes:", error);
    return {
      requests: [],
      totalPages: 0,
      currentPage: 1,
      totalRequests: 0,
    };
  }
}

export async function getFossilRequestById(id: string) {
  try {
    await requireAdmin();

    const request = await prisma.fossilRequest.findUnique({
      where: { id },
    });

    if (!request) {
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
      adminMessage: request.responseMessage,
      respondedBy: request.respondedBy,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de la demande:", error);
    return null;
  }
}

export async function updateFossilRequest(
  id: string,
  data: FossilRequestUpdateData
) {
  try {
    await requireAdmin();

    const updatedRequest = await prisma.fossilRequest.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

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
        adminMessage: updatedRequest.responseMessage,
        respondedBy: updatedRequest.respondedBy,
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

export async function deleteFossilRequest(id: string) {
  try {
    await requireAdmin();

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
