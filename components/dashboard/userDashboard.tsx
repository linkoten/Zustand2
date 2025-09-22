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

const statusColors = {
  PENDING:
    "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200",
  IN_PROGRESS:
    "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200",
  COMPLETED:
    "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200",
  REJECTED:
    "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200",
  CANCELLED:
    "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200",
};

const priorityColors = {
  LOW: "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200",
  NORMAL:
    "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200",
  HIGH: "bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-200",
  URGENT:
    "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200",
};

interface UserDashboardProps {
  user: DashboardUser;
  data: UserDashboardData;
  dict: any;
  lang: "fr" | "en";
}

export default async function UserDashboard({
  user,
  data,
  dict,
  lang,
}: UserDashboardProps) {
  return (
    <div className="relative">
      {/* Background décoratif */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-emerald-200/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* En-tête avec animation */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/20 mb-6">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            <span className="text-sm font-semibold text-slate-700">
              {dict?.dashboard?.welcomeBack || "Bon retour"}
            </span>
          </div>

          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 bg-clip-text text-transparent">
            {dict?.dashboard?.greeting || "Bonjour"}{" "}
            {user.name || dict?.dashboard?.user || "Utilisateur"} ! 👋
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {dict?.dashboard?.intro ||
              "Découvrez votre univers paléontologique et suivez vos trouvailles"}
          </p>
        </div>

        {/* Statistiques avec design premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-red-50/50 to-red-100/30 hover:scale-105 transform">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/10 rounded-t-lg"></div>
              <CardTitle className="text-sm font-semibold text-slate-700 relative z-10">
                {dict?.dashboard?.favorites || "Favoris"}
              </CardTitle>
              <div className="relative z-10">
                <div className="p-2 bg-gradient-to-br from-red-400 to-red-600 rounded-xl shadow-lg">
                  <Heart className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-black mb-1 bg-gradient-to-br from-red-600 to-red-800 bg-clip-text text-transparent">
                {data.totalFavorites}
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {dict?.dashboard?.savedFossils || "Fossiles sauvegardés"}
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-blue-50/50 to-blue-100/30 hover:scale-105 transform">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 rounded-t-lg"></div>
              <CardTitle className="text-sm font-semibold text-slate-700 relative z-10">
                {dict?.dashboard?.requests || "Demandes"}
              </CardTitle>
              <div className="relative z-10">
                <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg">
                  <Search className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-black mb-1 bg-gradient-to-br from-blue-600 to-blue-800 bg-clip-text text-transparent">
                {data.totalRequests}
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {dict?.dashboard?.fossilRequests || "Recherches actives"}
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-emerald-50/50 to-emerald-100/30 hover:scale-105 transform">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 rounded-t-lg"></div>
              <CardTitle className="text-sm font-semibold text-slate-700 relative z-10">
                {dict?.dashboard?.memberSince || "Membre depuis"}
              </CardTitle>
              <div className="relative z-10">
                <div className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-lg">
                  <Calendar className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-black mb-1 bg-gradient-to-br from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {dict?.dashboard?.signupDate || "Exploration continue"}
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-purple-50/50 to-purple-100/30 hover:scale-105 transform">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10 rounded-t-lg"></div>
              <CardTitle className="text-sm font-semibold text-slate-700 relative z-10">
                {dict?.dashboard?.orders || "Commandes"}
              </CardTitle>
              <div className="relative z-10">
                <div className="p-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-lg">
                  <Package className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-black mb-1 bg-gradient-to-br from-purple-600 to-purple-800 bg-clip-text text-transparent">
                {data.orders.length}
              </div>
              <p className="text-xs text-slate-600 font-medium mb-3">
                {dict?.dashboard?.ordersPlaced || "Achats réalisés"}
              </p>
              <Button
                asChild
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-lg"
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
        <Card className="mb-12 border-0 bg-white/80 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold text-slate-800">
              <TrendingUp className="h-6 w-6 text-amber-500" />
              {dict?.dashboard?.quickActions || "Actions rapides"}
            </CardTitle>
            <p className="text-slate-600 mt-2">
              {dict?.dashboard?.quickActionsDesc ||
                "Accédez rapidement à vos fonctionnalités favorites"}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Button
                asChild
                className="h-16 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg group"
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
                className="h-16 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 group"
              >
                <Link
                  href={`/${lang}/fossiles/request`}
                  className="flex flex-col items-center gap-2"
                >
                  <AlertCircle className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-sm text-blue-700">
                    {dict?.dashboard?.newRequest || "Demander"}
                  </span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-16 border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 group"
              >
                <Link
                  href={`/${lang}/dashboard/requests/user`}
                  className="flex flex-col items-center gap-2"
                >
                  <Search className="h-5 w-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-sm text-emerald-700">
                    {dict?.dashboard?.myRequests || "Mes demandes"}
                  </span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-16 border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 group"
              >
                <Link
                  href={`/${lang}/blog`}
                  className="flex flex-col items-center gap-2"
                >
                  <Calendar className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-sm text-purple-700">
                    {dict?.dashboard?.readBlog || "Blog"}
                  </span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Favoris récents avec design amélioré */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
            <CardHeader className="border-b border-red-100 bg-gradient-to-r from-red-50 to-pink-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-red-400 to-red-600 rounded-xl shadow-lg">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-slate-800">
                    {dict?.dashboard?.recentFavorites || "Mes favoris récents"}
                  </span>
                </CardTitle>
                {data.totalFavorites > 0 && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-700 hover:bg-red-50"
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
                  <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="h-10 w-10 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    {dict?.dashboard?.noFavorites ||
                      "Aucun favori pour le moment"}
                  </h3>
                  <p className="text-slate-600 mb-6">
                    {dict?.dashboard?.noFavoritesDesc ||
                      "Commencez à explorer notre collection de fossiles exceptionnels"}
                  </p>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
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
                      className="group flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-gradient-to-r hover:from-red-50/50 hover:to-pink-50/50 transition-all duration-300"
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
                          <div className="w-full h-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
                            <Package className="h-6 w-6 text-red-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 truncate group-hover:text-red-700 transition-colors">
                          {favorite.title}
                        </h4>
                        <p className="text-sm text-slate-600 mb-1">
                          {favorite.category} • {favorite.geologicalPeriod}
                        </p>
                        <p className="text-lg font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                          {favorite.price.toLocaleString("fr-FR")} €
                        </p>
                      </div>
                      <Button
                        asChild
                        size="sm"
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
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
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
            <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg">
                    <Search className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-slate-800">
                    {dict?.dashboard?.recentRequests || "Mes demandes récentes"}
                  </span>
                </CardTitle>
                {data.totalRequests > 0 && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
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
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-10 w-10 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    {dict?.dashboard?.noRequests || "Aucune demande active"}
                  </h3>
                  <p className="text-slate-600 mb-6">
                    {dict?.dashboard?.noRequestsDesc ||
                      "Vous cherchez un fossile spécifique ? Nous pouvons vous aider !"}
                  </p>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
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
                      className="group p-5 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
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

                      <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                        {request.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(request.createdAt).toLocaleDateString(
                              "fr-FR"
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
                          className="border-blue-200 text-blue-700 hover:bg-blue-50"
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
      </div>
    </div>
  );
}
