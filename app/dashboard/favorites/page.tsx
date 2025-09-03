import { getUserFavorites } from "@/lib/actions/dashboardActions";
import { auth } from "@clerk/nextjs/server";
import { FossilCard } from "@/components/fossils/fossil-card";

export default async function FavoritesPage() {
  const { userId } = await auth();
  if (!userId) return <div>Non connecté</div>;

  const favorites = await getUserFavorites(userId);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mes favoris</h1>
      {favorites.length === 0 ? (
        <p>Vous n&apos;avez pas encore de favoris.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((product) => (
            <FossilCard key={product.id} fossil={product} />
          ))}
        </div>
      )}
    </div>
  );
}
