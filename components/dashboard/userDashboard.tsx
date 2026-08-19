import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Search,
  Calendar,
  Package,
  Clock,
  Euro,
  MapPin,
  AlertCircle,
  Eye,
  Sparkles,
  TrendingUp,
  Gift,
  Star,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { DashboardUser, UserDashboardData } from "@/types/dashboardType";
import { CollectionShareWidget } from "@/components/dashboard/collectionShareWidget";
import { getMyShareToken } from "@/lib/actions/collectionShareActions";
import { FEATURES } from "@/lib/config/features";

const statusColors = {
  PENDING: "bg-terracotta/10 text-terracotta border-terracotta/30",
  IN_PROGRESS: "bg-cyan-900/40 text-cyan-300 border-cyan-700/30",
  COMPLETED: "bg-emerald-900/40 text-emerald-300 border-emerald-700/30",
  REJECTED: "bg-red-900/40 text-red-300 border-red-700/30",
  CANCELLED: "bg-zinc-800 text-zinc-300 border-zinc-700",
};

const priorityColors = {
  LOW: "bg-zinc-800 text-zinc-300 border-zinc-700",
  NORMAL: "bg-cyan-900/40 text-cyan-300 border-cyan-700/30",
  HIGH: "bg-terracotta/20 text-terracotta border-terracotta/50",
  URGENT: "bg-red-900/40 text-red-300 border-red-700/30",
};

interface UserDashboardProps {
  user: DashboardUser;
  data: UserDashboardData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
  lang: "fr" | "en";
}

export default async function UserDashboard({
  user,
  data,
  dict,
  lang,
}: UserDashboardProps) {
  const { token: initialShareToken } = await getMyShareToken();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://paleolitho.com";

  return (
    <div className="relative">
      {/* Background décoratif supprimé ici car maintenant inclus globalement dans page.tsx pour être persistant mais propre */}

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* En-tête avec animation */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 bg-silex border border-parchemin/10 px-6 py-3 rounded-full shadow-xl mb-6">
            <Sparkles className="w-5 h-5 text-terracotta animate-glow" />
            <span className="text-sm font-semibold text-parchemin">
              {dict?.dashboard?.welcomeBack || "Bon retour"}
            </span>
          </div>

          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-parchemin via-terracotta to-parchemin bg-clip-text text-transparent animate-shimmer-gold">
            {dict?.dashboard?.greeting || "Bonjour"}{" "}
            {user.name || dict?.dashboard?.user || "Utilisateur"} ! 👋
          </h1>
          <p className="text-xl text-parchemin/70 max-w-2xl mx-auto leading-relaxed">
            {dict?.dashboard?.intro ||
              "Découvrez votre univers paléontologique et suivez vos trouvailles"}
          </p>
        </div>

        {/* Statistiques avec design premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="group hover:shadow-2xl transition-all duration-500 border border-parchemin/10 bg-silex/80 hover:scale-105 transform">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-terracotta/10 to-terracotta/5 rounded-t-lg"></div>
              <CardTitle className="text-sm font-semibold text-parchemin relative z-10">
                {dict?.dashboard?.favorites || "Favoris"}
              </CardTitle>
              <div className="relative z-10">
                <div className="p-2 bg-terracotta/20 rounded-xl shadow-lg border border-terracotta/30">
                  <Heart className="h-4 w-4 text-terracotta group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-black mb-1 text-parchemin">
                {data.totalFavorites}
              </div>
              <p className="text-xs text-parchemin/70 font-medium">
                {dict?.dashboard?.savedFossils || "Fossiles sauvegardés"}
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 border border-parchemin/10 bg-silex/80 hover:scale-105 transform">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-terracotta/10 to-terracotta/5 rounded-t-lg"></div>
              <CardTitle className="text-sm font-semibold text-parchemin relative z-10">
                {dict?.dashboard?.requests || "Demandes"}
              </CardTitle>
              <div className="relative z-10">
                <div className="p-2 bg-terracotta/20 rounded-xl shadow-lg border border-terracotta/30">
                  <Search className="h-4 w-4 text-terracotta group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-black mb-1 text-parchemin">
                {data.totalRequests}
              </div>
              <p className="text-xs text-parchemin/70 font-medium">
                {dict?.dashboard?.fossilRequests || "Recherches actives"}
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 border border-parchemin/10 bg-silex/80 hover:scale-105 transform">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-terracotta/10 to-terracotta/5 rounded-t-lg"></div>
              <CardTitle className="text-sm font-semibold text-parchemin relative z-10">
                {dict?.dashboard?.memberSince || "Membre depuis"}
              </CardTitle>
              <div className="relative z-10">
                <div className="p-2 bg-terracotta/20 rounded-xl shadow-lg border border-terracotta/30">
                  <Calendar className="h-4 w-4 text-terracotta group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-black mb-1 text-parchemin">
                {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <p className="text-xs text-parchemin/70 font-medium">
                {dict?.dashboard?.signupDate || "Exploration continue"}
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 border border-parchemin/10 bg-silex/80 hover:scale-105 transform">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-terracotta/10 to-terracotta/5 rounded-t-lg"></div>
              <CardTitle className="text-sm font-semibold text-parchemin relative z-10">
                {dict?.dashboard?.orders || "Commandes"}
              </CardTitle>
              <div className="relative z-10">
                <div className="p-2 bg-terracotta/20 rounded-xl shadow-lg border border-terracotta/30">
                  <Package className="h-4 w-4 text-terracotta group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-black mb-1 text-parchemin">
                {data.orders.length}
              </div>
              <p className="text-xs text-parchemin/70 font-medium mb-3">
                {dict?.dashboard?.ordersPlaced || "Achats réalisés"}
              </p>
              <Button
                asChild
                className="w-full bg-terracotta hover:bg-terracotta/90 text-primary-foreground border-0 shadow-lg"
                size="sm"
              >
                <Link href={`/${lang}/dashboard/orders`}>
                  <Gift className="w-3 h-3 mr-1" />
                  {dict?.dashboard?.see || "Voir"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides redesignées */}
        <Card className="mb-12 border-0 bg-silex/80 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold text-parchemin">
              <TrendingUp className="h-6 w-6 text-amber-500" />
              {dict?.dashboard?.quickActions || "Actions rapides"}
            </CardTitle>
            <p className="text-parchemin/70 mt-2">
              {dict?.dashboard?.quickActionsDesc ||
                "Accédez rapidement à vos fonctionnalités favorites"}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Button
                asChild
                className="h-16 bg-terracotta hover:bg-terracotta/90 text-primary-foreground border-0 shadow-lg group"
              >
                <Link
                  href={`/${lang}/fossiles`}
                  className="flex flex-col items-center gap-2"
                >
                  <Search className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-sm">
                    {dict?.dashboard?.browseFossils || "Explorer"}
                  </span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-16 border-2 border-parchemin/30 text-parchemin hover:border-terracotta hover:bg-terracotta/10 group"
              >
                <Link
                  href={`/${lang}/fossiles/request`}
                  className="flex flex-col items-center gap-2"
                >
                  <AlertCircle className="h-5 w-5 text-terracotta group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-sm text-parchemin">
                    {dict?.dashboard?.newRequest || "Demander"}
                  </span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-16 border-2 border-parchemin/30 text-parchemin hover:border-terracotta hover:bg-terracotta/10 group"
              >
                <Link
                  href={`/${lang}/dashboard/requests/user`}
                  className="flex flex-col items-center gap-2"
                >
                  <Search className="h-5 w-5 text-terracotta group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-sm text-parchemin">
                    {dict?.dashboard?.myRequests || "Mes demandes"}
                  </span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-16 border-2 border-parchemin/30 text-parchemin hover:border-terracotta hover:bg-terracotta/10 group"
              >
                <Link
                  href={`/${lang}/blog`}
                  className="flex flex-col items-center gap-2"
                >
                  <Calendar className="h-5 w-5 text-terracotta group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-sm text-parchemin">
                    {dict?.dashboard?.readBlog || "Blog"}
                  </span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Favoris récents avec design amélioré */}
          <Card className="border-0 bg-silex/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
            <CardHeader className="border-b border-parchemin/10 bg-silex">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-terracotta/20 rounded-xl shadow-lg border border-terracotta/30">
                    <Heart className="h-5 w-5 text-terracotta" />
                  </div>
                  <span className="text-xl font-bold text-parchemin">
                    {dict?.dashboard?.recentFavorites || "Mes favoris récents"}
                  </span>
                </CardTitle>
                {data.totalFavorites > 0 && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-parchemin/30 text-parchemin hover:border-terracotta hover:bg-terracotta/10"
                  >
                    <Link href={`/${lang}/dashboard/favorites`}>
                      <Star className="w-3 h-3 mr-1" />
                      {dict?.dashboard?.seeAll || "Voir tout"}
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {data.favorites.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-terracotta/20">
                    <Heart className="h-10 w-10 text-terracotta" />
                  </div>
                  <h3 className="text-lg font-semibold text-parchemin mb-2">
                    {dict?.dashboard?.noFavorites ||
                      "Aucun favori pour le moment"}
                  </h3>
                  <p className="text-parchemin/70 mb-6">
                    {dict?.dashboard?.noFavoritesDesc ||
                      "Commencez à explorer notre collection de fossiles exceptionnels"}
                  </p>
                  <Button
                    asChild
                    className="bg-terracotta hover:bg-terracotta/90 text-primary-foreground"
                  >
                    <Link href={`/${lang}/fossiles`}>
                      <Search className="w-4 h-4 mr-2" />
                      {dict?.dashboard?.discoverFossils || "Découvrir"}
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.favorites.map((favorite, index) => (
                    <div
                      key={favorite.id}
                      className="group flex items-center gap-4 p-4 rounded-xl border border-parchemin/10 hover:border-terracotta/40 hover:bg-terracotta/5 transition-all duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                        {favorite.images?.[0] ? (
                          <Image
                            src={favorite.images[0].imageUrl}
                            alt={favorite.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-terracotta/10 flex items-center justify-center">
                            <Package className="h-6 w-6 text-terracotta" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-parchemin truncate group-hover:text-terracotta transition-colors">
                          {favorite.title}
                        </h4>
                        <p className="text-sm text-parchemin/70 mb-1">
                          {favorite.category} • {favorite.geologicalPeriod}
                        </p>
                        <p className="text-lg font-bold text-terracotta">
                          {favorite.price.toLocaleString("fr-FR")} €
                        </p>
                      </div>
                      <Button
                        asChild
                        size="sm"
                        className="bg-terracotta hover:bg-terracotta/90 text-primary-foreground"
                      >
                        <Link href={`/${lang}/fossiles/${favorite.id}`}>
                          <Eye className="w-3 h-3 mr-1" />
                          Voir
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Demandes récentes avec design amélioré */}
          <Card className="border-0 bg-silex/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
            <CardHeader className="border-b border-parchemin/10 bg-silex">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-terracotta/20 rounded-xl shadow-lg border border-terracotta/30">
                    <Search className="h-5 w-5 text-terracotta" />
                  </div>
                  <span className="text-xl font-bold text-parchemin">
                    {dict?.dashboard?.recentRequests || "Mes demandes récentes"}
                  </span>
                </CardTitle>
                {data.totalRequests > 0 && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-parchemin/30 text-parchemin hover:border-terracotta hover:bg-terracotta/10 group"
                  >
                    <Link href={`/${lang}/dashboard/requests/user`}>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {dict?.dashboard?.seeAll || "Voir tout"}
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {data.fossilRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-terracotta/20">
                    <Search className="h-10 w-10 text-terracotta" />
                  </div>
                  <h3 className="text-lg font-semibold text-parchemin mb-2">
                    {dict?.dashboard?.noRequests || "Aucune demande active"}
                  </h3>
                  <p className="text-parchemin/70 mb-6">
                    {dict?.dashboard?.noRequestsDesc ||
                      "Vous cherchez un fossile spécifique ? Nous pouvons vous aider !"}
                  </p>
                  <Button
                    asChild
                    className="bg-terracotta hover:bg-terracotta/90 text-primary-foreground"
                  >
                    <Link href={`/${lang}/fossiles/request`}>
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {dict?.dashboard?.makeRequest || "Faire une demande"}
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.fossilRequests.map((request, index) => (
                    <div
                      key={request.id}
                      className="group p-5 rounded-xl border border-parchemin/10 hover:border-terracotta/40 hover:bg-terracotta/5 transition-all duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-parchemin group-hover:text-terracotta transition-colors">
                          {request.fossilType}
                        </h4>
                        <div className="flex gap-2">
                          <Badge
                            className={`${priorityColors[request.priority as keyof typeof priorityColors]} border`}
                          >
                            {request.priority}
                          </Badge>
                          <Badge
                            className={`${statusColors[request.status as keyof typeof statusColors]} border`}
                          >
                            {request.status}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-parchemin/70 mb-4 line-clamp-2 leading-relaxed">
                        {request.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-parchemin/50">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(request.createdAt).toLocaleDateString(
                              "fr-FR",
                            )}
                          </span>
                          {request.maxBudget && (
                            <span className="flex items-center gap-1">
                              <Euro className="h-3 w-3" />
                              Max {request.maxBudget.toLocaleString("fr-FR")} €
                            </span>
                          )}
                          {request.countryOfOrigin && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {request.countryOfOrigin}
                            </span>
                          )}
                        </div>

                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="border-parchemin/30 text-parchemin hover:border-terracotta hover:bg-terracotta/10 group"
                        >
                          <Link
                            href={`/${lang}/dashboard/requests/user/${request.id}`}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            {dict?.dashboard?.see || "Voir"}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Partage de collection */}
        {FEATURES.collectionShare && (
          <div className="mt-12 max-w-xl">
            <CollectionShareWidget
              initialToken={initialShareToken}
              lang={lang}
              dict={dict}
              appUrl={appUrl}
            />
          </div>
        )}
      </div>
    </div>
  );
}
