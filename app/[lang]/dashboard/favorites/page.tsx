import { getUserFavorites } from "@/lib/actions/dashboardActions";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FossilCard } from "@/components/fossils/fossil-card";
import { getDictionary } from "../../dictionaries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Sparkles,
  Search,
  Star,
  ShoppingBag,
  TrendingUp,
  Package,
} from "lucide-react";

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ lang: "en" | "fr" }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const favorites = await getUserFavorites(userId);
  const { lang } = await params;
  const dict = await getDictionary(lang);

  // Calculs des statistiques
  const totalFavorites = favorites.length;
  const totalValue = favorites.reduce((sum, product) => sum + product.price, 0);
  const averagePrice = totalFavorites > 0 ? totalValue / totalFavorites : 0;

  // Catégories des favoris
  const categoriesCount = favorites.reduce(
    (acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const topCategory = Object.entries(categoriesCount).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-pink-50/20">
      {/* Background décoratif */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-pink-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-rose-200/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Navigation */}
        <div className="mb-8">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="mb-6 hover:bg-white/80 backdrop-blur-sm"
          >
            <Link
              href={`/${lang}/dashboard`}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {dict.dashboard?.backToDashboard || "Retour au dashboard"}
            </Link>
          </Button>

          {/* En-tête avec animation */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/20 mb-6">
              <Sparkles className="w-5 h-5 text-red-500 animate-pulse" />
              <span className="text-sm font-semibold text-slate-700">
                {dict.dashboard?.favoritesHub || "Centre de mes favoris"}
              </span>
            </div>

            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-red-600 via-pink-500 to-rose-600 bg-clip-text text-transparent">
              {dict.dashboard?.favorites || "Mes favoris"} ❤️
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {dict.dashboard?.favoritesSubtitle ||
                "Retrouvez tous vos fossiles préférés sauvegardés"}
            </p>

            {/* Action principale */}
            <div className="mt-8">
              <Button
                asChild
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <Link href={`/${lang}/fossiles`}>
                  <Search className="mr-2 h-5 w-5" />
                  {dict.dashboard?.discoverMore || "Découvrir plus de fossiles"}
                </Link>
              </Button>
            </div>
          </div>

          {/* Statistiques avec design premium */}
          {totalFavorites > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {/* Total favoris */}
              <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-red-50/50 to-red-100/30 hover:scale-105 transform">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/10 rounded-t-lg"></div>
                  <CardTitle className="text-sm font-semibold text-slate-700 relative z-10">
                    {dict.dashboard?.totalFavorites || "Total favoris"}
                  </CardTitle>
                  <div className="relative z-10">
                    <div className="p-2 bg-gradient-to-br from-red-400 to-red-600 rounded-xl shadow-lg">
                      <Heart className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-black mb-1 bg-gradient-to-br from-red-600 to-red-800 bg-clip-text text-transparent">
                    {totalFavorites}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {dict.dashboard?.fossilsSaved || "Fossiles sauvegardés"}
                  </p>
                </CardContent>
              </Card>

              {/* Valeur totale */}
              <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-emerald-50/50 to-emerald-100/30 hover:scale-105 transform">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 rounded-t-lg"></div>
                  <CardTitle className="text-sm font-semibold text-slate-700 relative z-10">
                    {dict.dashboard?.totalValue || "Valeur totale"}
                  </CardTitle>
                  <div className="relative z-10">
                    <div className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-lg">
                      <TrendingUp className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-black mb-1 bg-gradient-to-br from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                    {totalValue.toLocaleString(
                      lang === "en" ? "en-GB" : "fr-FR",
                      {
                        style: "currency",
                        currency: "EUR",
                        maximumFractionDigits: 0,
                      }
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {dict.dashboard?.wishlishValue || "Valeur de ma wishlist"}
                  </p>
                </CardContent>
              </Card>

              {/* Prix moyen */}
              <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-amber-50/50 to-amber-100/30 hover:scale-105 transform">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/10 rounded-t-lg"></div>
                  <CardTitle className="text-sm font-semibold text-slate-700 relative z-10">
                    {dict.dashboard?.averagePrice || "Prix moyen"}
                  </CardTitle>
                  <div className="relative z-10">
                    <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-lg">
                      <Star className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-black mb-1 bg-gradient-to-br from-amber-600 to-amber-800 bg-clip-text text-transparent">
                    {averagePrice.toLocaleString(
                      lang === "en" ? "en-GB" : "fr-FR",
                      {
                        style: "currency",
                        currency: "EUR",
                        maximumFractionDigits: 0,
                      }
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {dict.dashboard?.perFossil || "Par fossile"}
                  </p>
                </CardContent>
              </Card>

              {/* Catégorie préférée */}
              <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-purple-50/50 to-purple-100/30 hover:scale-105 transform">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10 rounded-t-lg"></div>
                  <CardTitle className="text-sm font-semibold text-slate-700 relative z-10">
                    {dict.dashboard?.topCategory || "Catégorie favorite"}
                  </CardTitle>
                  <div className="relative z-10">
                    <div className="p-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-lg">
                      <Package className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-2xl font-black mb-1 bg-gradient-to-br from-purple-600 to-purple-800 bg-clip-text text-transparent">
                    {topCategory?.[0] || "Aucune"}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {topCategory
                      ? `${topCategory[1]} fossile${topCategory[1] > 1 ? "s" : ""}`
                      : dict.dashboard?.noPreference || "Aucune préférence"}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Liste des favoris */}
        {favorites.length === 0 ? (
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl text-center py-16">
            <CardContent>
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center">
                  <Heart className="h-10 w-10 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  {dict.dashboard?.noFavorites || "Aucun favori pour le moment"}
                </h3>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  {dict.dashboard?.noFavoritesDesc ||
                    "Commencez à explorer notre collection et ajoutez vos fossiles préférés à votre liste de favoris !"}
                </p>
                <Button
                  asChild
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg"
                >
                  <Link href={`/${lang}/fossiles`}>
                    <Search className="mr-2 h-4 w-4" />
                    {dict.dashboard?.startExploring ||
                      "Commencer l'exploration"}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Grille des favoris */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {favorites.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <FossilCard fossil={product} dict={dict} lang={lang} />
                </div>
              ))}
            </div>

            {/* Conseils et suggestions */}
            <Card className="border-0 bg-gradient-to-r from-red-50 to-pink-50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-red-900">
                  <Heart className="h-5 w-5" />
                  {dict.dashboard?.favoriteTips || "Conseils pour vos favoris"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-red-900">
                      {dict.dashboard?.watchPrices || "Surveillez les prix"}
                    </h4>
                    <p className="text-sm text-red-700">
                      {dict.dashboard?.watchPricesDesc ||
                        "Les prix des fossiles peuvent varier. Vos favoris vous permettent de suivre les évolutions tarifaires."}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-red-900">
                      {dict.dashboard?.shareCollection ||
                        "Partagez votre collection"}
                    </h4>
                    <p className="text-sm text-red-700">
                      {dict.dashboard?.shareCollectionDesc ||
                        "Montrez vos fossiles favoris à d'autres passionnés de paléontologie et échangez vos découvertes."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
