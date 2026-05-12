import { getLocalitiesForMap } from "@/lib/actions/localityActions";
import { getDictionary } from "@/app/[lang]/dictionaries";
import RealMapClient from "@/components/product/realMapClient";
import { MapPin, Layers } from "lucide-react";

export default async function RealMapPage({
  params,
}: {
  params: Promise<{ lang: "en" | "fr" }>;
}) {
  const { lang } = await params;
  const [localities, dict] = await Promise.all([
    getLocalitiesForMap(),
    getDictionary(lang),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-silex via-silex/95 to-silex/90">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-3 bg-silex border border-parchemin/10 px-6 py-3 rounded-full shadow-xl mb-6">
            <Layers className="w-5 h-5 text-terracotta" />
            <span className="text-sm font-semibold text-parchemin">
              {lang === "fr" ? "Carte géologique" : "Geological map"}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-parchemin via-terracotta to-parchemin bg-clip-text text-transparent">
            {lang === "fr"
              ? "Carte des sites fossilifères"
              : "Fossil site map"}
          </h1>
          <p className="text-parchemin/60 text-lg max-w-2xl mx-auto">
            {lang === "fr"
              ? "Explorez les localités de notre base de données, filtrez par période géologique et découvrez les fossiles disponibles."
              : "Explore localities from our database, filter by geological period and discover available fossils."}
          </p>
        </div>

        {localities.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-parchemin/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-12 w-12 text-parchemin/30" />
            </div>
            <p className="text-parchemin/50 text-lg">
              {lang === "fr"
                ? "Aucune localité dans la base de données."
                : "No locality found in database."}
            </p>
          </div>
        ) : (
          <RealMapClient localities={localities} lang={lang} dict={dict} />
        )}
      </div>
    </div>
  );
}

