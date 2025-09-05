import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { createNotification } from "@/lib/actions/notificationAction";
import { getUserData } from "@/lib/actions/dashboardActions";

export async function POST(request: NextRequest) {
  try {
    // ✅ Récupérer l'ID de l'utilisateur connecté
    const { userId } = await auth();

    const user = await getUserData(userId!);

    const body = await request.json();

    const {
      name,
      email,
      phone,
      fossilType,
      description,
      maxBudget,
      geologicalPeriod,
      category,
      countryOfOrigin,
      locality,
    } = body;

    // Validation des champs requis
    if (!name || !email || !fossilType || !description) {
      return NextResponse.json(
        {
          error:
            "Les champs nom, email, type de fossile et description sont requis",
        },
        { status: 400 }
      );
    }

    // Créer la demande dans la base de données
    const fossilRequest = await prisma.fossilRequest.create({
      data: {
        name,
        email,
        phone: phone || null,
        fossilType,
        description,
        maxBudget: maxBudget ? parseFloat(maxBudget) : null,
        geologicalPeriod: geologicalPeriod || null,
        category: category || null,
        countryOfOrigin: countryOfOrigin || null,
        locality: locality || null,
        status: "PENDING",
        priority: "NORMAL",
        clerkUserId: userId, // ✅ Associer à l'utilisateur connecté
      },
    });
    // 👉 Notification pour l'utilisateur
    await createNotification({
      userId: user!.id,
      type: "FOSSIL_REQUEST",
      title: "Demande de recherche créée",
      message: "Votre demande de recherche de fossile a bien été enregistrée.",
      link: "/dashboard/requests/user",
    });

    return NextResponse.json(
      {
        message: "Demande créée avec succès",
        requestId: fossilRequest.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la création de la demande:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
