import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
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
      },
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
