import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier s'il a déjà un customer Stripe
    if (user.stripeCustomerId) {
      return NextResponse.json({
        customerId: user.stripeCustomerId,
      });
    }

    // Créer un customer Stripe
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: {
        clerkUserId: userId,
      },
    });

    // Sauvegarder l'ID customer
    await prisma.user.update({
      where: { clerkId: userId },
      data: { stripeCustomerId: customer.id },
    });

    return NextResponse.json({
      customerId: customer.id,
    });
  } catch (error: unknown) {
    console.error("❌ Error creating Stripe customer:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du customer" },
      { status: 500 }
    );
  }
}
