import ProductMap from "@/components/product/productMap";
import { getLocalitiesForMap } from "@/lib/actions/localityActions";

export default async function RealMapPage() {
  const localities = await getLocalitiesForMap();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Carte géologique des localités</h1>
        <p className="text-gray-600">
          Cette carte affiche les vraies localités de votre base de données avec
          leurs périodes géologiques.
        </p>
      </div>

      {localities.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Toutes les localités ({localities.length} trouvées)
          </h2>
          <ProductMap localities={localities} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {localities.map((locality) => (
              <div
                key={locality.id}
                className="p-4 bg-white rounded-lg border shadow-sm"
              >
                <h3 className="font-semibold text-lg mb-2">{locality.name}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Latitude: {locality.latitude.toFixed(4)}°</p>
                  <p>Longitude: {locality.longitude.toFixed(4)}°</p>
                  {locality.geologicalPeriods.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Périodes:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {locality.geologicalPeriods.map((period) => (
                          <span
                            key={period}
                            className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800"
                          >
                            {period}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {locality.geologicalStages.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Étages:</p>
                      <p className="text-xs text-gray-500">
                        {locality.geologicalStages.join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Aucune localité trouvée dans la base de données.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Vous pouvez créer des localités via le dashboard admin.
          </p>
        </div>
      )}
    </div>
  );
}
