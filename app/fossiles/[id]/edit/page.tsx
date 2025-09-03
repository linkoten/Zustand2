import { requireAdmin } from "@/lib/auth";
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
import { getProduct } from "@/lib/actions/productActions";

interface EditProductPageProps {
  params: Promise<{ id: string }>; // ✅ Promise + string (les params URL sont toujours des strings)
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const resolvedParams = await params;
  // ✅ Vérifier que l'utilisateur est admin
  await requireAdmin();

  const product = await getProduct(resolvedParams.id);

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
