"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import {
  Category,
  GeologicalPeriod,
  ProductStatus,
} from "@/lib/generated/prisma";

interface CreateProductData {
  title: string;
  category: string;
  genre: string;
  species: string;
  price: number;
  countryOfOrigin: string;
  locality: string;
  geologicalPeriod: string;
  geologicalStage: string;
  description?: string;
  weight: number; // ✅ Nouveau champ obligatoire
  images: Array<{
    url: string;
    altText?: string;
  }>;
}

export async function createProductAction(data: CreateProductData) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Vous devez être connecté pour créer un produit",
      };
    }

    console.log("📝 Données reçues:", data);

    // ✅ Filtrer les images valides
    const validImages = data.images.filter((img) => img.url && img.url.trim());

    if (validImages.length === 0) {
      return {
        success: false,
        error: "Au moins une image valide est requise",
      };
    }

    // ✅ 1. Créer le produit dans Stripe
    const stripeProduct = await stripe.products.create({
      name: data.title,
      description: data.description || undefined,
      images: validImages.map((img) => img.url),
      metadata: {
        category: data.category,
        genre: data.genre,
        species: data.species,
        countryOfOrigin: data.countryOfOrigin,
        locality: data.locality,
        geologicalPeriod: data.geologicalPeriod,
        geologicalStage: data.geologicalStage,
        weight: data.weight.toString(), // ✅ Ajouter le poids dans les metadata
        image_urls: validImages.map((img) => img.url).join(","),
        image_alts: validImages.map((img) => img.altText || "").join(","),
      },
    });

    console.log("✅ Produit créé dans Stripe:", stripeProduct.id);

    // ✅ 2. Créer le prix dans Stripe
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(data.price * 100),
      currency: "eur",
    });

    console.log("✅ Prix créé dans Stripe:", stripePrice.id);

    // ✅ 3. Vérifier si le produit existe déjà dans la BDD
    const existingProduct = await prisma.product.findUnique({
      where: { stripeProductId: stripeProduct.id },
    });

    let product;

    if (existingProduct) {
      console.log("⚠️ Produit existant trouvé, mise à jour...");

      // Mettre à jour le produit existant
      product = await prisma.product.update({
        where: { stripeProductId: stripeProduct.id },
        data: {
          title: data.title,
          category: data.category as Category,
          genre: data.genre,
          species: data.species,
          price: data.price,
          countryOfOrigin: data.countryOfOrigin,
          locality: data.locality,
          geologicalPeriod: data.geologicalPeriod as GeologicalPeriod,
          geologicalStage: data.geologicalStage,
          description: data.description || null,
          weight: data.weight, // ✅ Mettre à jour le poids
          stripePriceId: stripePrice.id,
          status: ProductStatus.AVAILABLE,
        },
      });

      // Supprimer les anciennes images
      await prisma.productImage.deleteMany({
        where: { productId: product.id },
      });
    } else {
      // Créer un nouveau produit
      product = await prisma.product.create({
        data: {
          title: data.title,
          category: data.category as Category,
          genre: data.genre,
          species: data.species,
          price: data.price,
          countryOfOrigin: data.countryOfOrigin,
          locality: data.locality,
          geologicalPeriod: data.geologicalPeriod as GeologicalPeriod,
          geologicalStage: data.geologicalStage,
          description: data.description || null,
          weight: data.weight, // ✅ Ajouter le poids
          stripeProductId: stripeProduct.id,
          stripePriceId: stripePrice.id,
          status: ProductStatus.AVAILABLE,
        },
      });
    }

    console.log("✅ Produit sauvegardé dans la BDD:", product.id);
    console.log("📏 Poids sauvegardé:", product.weight, "grammes");

    // ✅ 4. Ajouter les images
    for (let i = 0; i < validImages.length; i++) {
      const image = validImages[i];

      try {
        const productImage = await prisma.productImage.create({
          data: {
            productId: product.id,
            imageUrl: image.url,
            altText: image.altText || null,
            order: i,
          },
        });

        console.log(`✅ Image ${i + 1} ajoutée:`, productImage.id);
      } catch (imageError) {
        console.error(`❌ Erreur ajout image ${i + 1}:`, imageError);
      }
    }

    // ✅ 5. Vérifier que les images ont été sauvegardées
    const savedImages = await prisma.productImage.findMany({
      where: { productId: product.id },
      orderBy: { order: "asc" },
    });

    console.log(`✅ ${savedImages.length} image(s) sauvegardée(s) en BDD`);

    // ✅ 6. Revalider les caches
    revalidatePath("/fossiles");
    revalidatePath("/");

    return {
      success: true,
      data: {
        productId: product.id,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
        imagesCount: savedImages.length,
        description: product.description,
        weight: product.weight,
        isUpdate: !!existingProduct,
      },
    };
  } catch (error) {
    console.error("❌ Erreur création produit:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la création du produit",
    };
  }
}
