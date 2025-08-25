import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import EditProductForm from "@/components/fossils/editProductForm";

interface EditProductPageProps {
  params: Promise<{ id: string }>; // ✅ Promise + string (les params URL sont toujours des strings)
}

async function getProduct(id: number) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!product) {
      return null;
    }

    return {
      ...product,
      price: product.price.toNumber(),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      images: product.images.map((image) => ({
        ...image,
        createdAt: image.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error);
    return null;
  }
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id: idString } = await params;
  const id = parseInt(idString);
  // ✅ Vérifier que l'utilisateur est admin
  await requireAdmin();

  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link
            href={`/fossiles/${product.id}`}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au produit
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Modifier le produit</CardTitle>
          <CardDescription>
            Modifiez les informations du fossile &quot;{product.title}&quot;
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditProductForm product={product} />
        </CardContent>
      </Card>
    </div>
  );
}
