import { FossilCard } from "@/components/fossils/fossil-card";
import prisma from "@/lib/prisma";
import { SerializedProduct } from "@/types/type";

async function getFossils(): Promise<SerializedProduct[]> {
  try {
    const fossils = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // ✅ Sérialiser les données pour le client
    return fossils.map((fossil) => ({
      ...fossil,
      price: fossil.price.toNumber(), // Convertir Decimal en number
      createdAt: fossil.createdAt.toISOString(), // Convertir Date en string
      updatedAt: fossil.updatedAt.toISOString(), // Convertir Date en string
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des fossiles:", error);
    return [];
  }
}

export default async function FossilesPage() {
  const fossils = await getFossils();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Collection de Fossiles
        </h1>
        <p className="text-muted-foreground mt-2">
          Découvrez notre collection de {fossils.length} fossiles authentiques
        </p>
      </div>

      {fossils.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">
            Aucun fossile disponible
          </h2>
          <p className="text-muted-foreground">
            Les fossiles apparaîtront ici une fois ajoutés depuis Stripe.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {fossils.map((fossil) => (
            <FossilCard key={fossil.id} fossil={fossil} />
          ))}
        </div>
      )}
    </div>
  );
}
