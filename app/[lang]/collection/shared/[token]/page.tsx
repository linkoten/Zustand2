import { getPublicCollectionByToken } from "@/lib/actions/collectionShareActions";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Heart, ArrowLeft } from "lucide-react";

export default async function PublicCollectionPage({
  params,
}: {
  params: Promise<{ lang: "en" | "fr"; token: string }>;
}) {
  const { lang, token } = await params;
  const dict = await getDictionary(lang);

  const data = await getPublicCollectionByToken(token);

  if (!data) notFound();

  const { ownerName, favorites } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-silex via-silex/95 to-silex/90">
      {/* Header */}
      <div className="border-b border-parchemin/10 bg-silex/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button asChild variant="ghost" size="sm" className="text-parchemin/70 hover:text-parchemin">
            <Link href={`/${lang}/fossiles`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {lang === "fr" ? "Explorer les fossiles" : "Explore fossils"}
            </Link>
          </Button>
          <div className="flex items-center gap-2 text-sm text-parchemin/50">
            <Heart className="w-4 h-4 text-terracotta" />
            <span>Paleolitho</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-silex border border-parchemin/10 px-6 py-3 rounded-full shadow-xl mb-6">
            <Heart className="w-5 h-5 text-terracotta" />
            <span className="text-sm font-semibold text-parchemin">
              {dict?.dashboard?.publicCollectionOf || "Collection de"}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-parchemin via-terracotta to-parchemin bg-clip-text text-transparent">
            {ownerName || (lang === "fr" ? "Collectionneur" : "Collector")}
          </h1>
          <p className="text-parchemin/60 text-lg">
            {favorites.length}{" "}
            {lang === "fr"
              ? favorites.length > 1
                ? "fossiles dans la collection"
                : "fossile dans la collection"
              : favorites.length > 1
              ? "fossils in the collection"
              : "fossil in the collection"}
          </p>
        </div>

        {/* Grid de fossiles */}
        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-parchemin/10 to-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-12 w-12 text-parchemin/30" />
            </div>
            <p className="text-parchemin/50 text-lg">
              {dict?.dashboard?.noFavoritesPublic || "Cette collection est vide pour l'instant."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((fossil) => (
              <Card
                key={fossil.id}
                className="group border-0 bg-silex/60 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-parchemin/5 to-terracotta/5">
                  {fossil.mainImageUrl ? (
                    <Image
                      src={fossil.mainImageUrl}
                      alt={fossil.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-16 w-16 text-parchemin/20" />
                    </div>
                  )}
                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-silex/80 backdrop-blur-sm text-parchemin border-parchemin/20 text-xs">
                      {fossil.category}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-bold text-parchemin text-sm leading-tight mb-2 line-clamp-2 group-hover:text-terracotta transition-colors">
                    {fossil.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-black text-terracotta">
                      {fossil.price.toLocaleString("fr-FR")} €
                    </p>
                    <Button
                      asChild
                      size="sm"
                      className="bg-terracotta hover:bg-terracotta/90 text-primary-foreground text-xs h-8 px-3"
                    >
                      <Link href={`/${lang}/fossiles/${fossil.id}`}>
                        {lang === "fr" ? "Voir" : "View"}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer CTA */}
        <div className="text-center mt-16">
          <p className="text-parchemin/50 text-sm mb-4">
            {lang === "fr"
              ? "Vous souhaitez créer votre propre collection ?"
              : "Want to create your own collection?"}
          </p>
          <Button asChild className="bg-terracotta hover:bg-terracotta/90 text-primary-foreground">
            <Link href={`/${lang}/sign-up`}>
              {lang === "fr" ? "Rejoindre Paleolitho" : "Join Paleolitho"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
