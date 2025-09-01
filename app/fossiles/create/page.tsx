import CreateProductForm from "@/components/form/createProductForm";
import { getUserData } from "@/lib/actions/dashboardActions";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function CreateProductPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }
  const user = await getUserData(userId);

  if (user?.role !== "ADMIN") {
    redirect("/fossiles");
  }

  // Récupérer toutes les localités
  const localities = await prisma.locality.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Créer un nouveau produit</h1>
          <p className="text-muted-foreground">
            Ajoutez un nouveau fossile à votre catalogue
          </p>
        </div>

        <CreateProductForm localities={localities} />
      </div>
    </div>
  );
}
