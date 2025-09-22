import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Package,
  FileText,
  Search,
  TrendingUp,
  Clock,
  Euro,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Sparkles,
  Crown,
  Shield,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AdminDashboardData, DashboardUser } from "@/types/dashboardType";

const statusColors = {
  PENDING:
    "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200",
  IN_PROGRESS:
    "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200",
  COMPLETED:
    "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200",
  CANCELLED:
    "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200",
  REJECTED:
    "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200",
};

const priorityColors = {
  LOW: "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200",
  NORMAL:
    "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200",
  HIGH: "bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-200",
  URGENT:
    "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200",
};

const statusIcons = {
  PENDING: AlertCircle,
  IN_PROGRESS: Clock,
  COMPLETED: CheckCircle,
  CANCELLED: XCircle,
  REJECTED: XCircle,
};

interface AdminDashboardProps {
  user: DashboardUser;
  data: AdminDashboardData;
  dict: any;
  lang: "fr" | "en";
}

export default function AdminDashboard({
  data,
  dict,
  lang,
}: AdminDashboardProps) {
  return (
    <div className="relative">
      {/* Background décoratif admin */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-indigo-200/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* En-tête admin premium */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/20 mb-6">
            <Crown className="w-5 h-5 text-amber-500 animate-pulse" />
            <span className="text-sm font-semibold text-slate-700">
              {dict?.dashboard?.adminPanel || "Panneau d'administration"}
            </span>
          </div>

          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
            Dashboard Admin 🛠️
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {dict?.dashboard?.adminIntro ||
              "Contrôlez et supervisez l'ensemble de votre plateforme FossilShop"}
          </p>
        </div>

        {/* Statistiques principales avec design premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-blue-50/50 to-blue-100/30 hover:scale-105 transform">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 rounded-t-lg"></div>
              <CardTitle className="text-sm font-semibold text-slate-700 relative z-10">
                {dict?.dashboard?.users || "Utilisateurs"}
              </CardTitle>
              <div className="relative z-10">
                <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg">
                  <Users className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-black mb-1 bg-gradient-to-br from-blue-600 to-blue-800 bg-clip-text text-transparent">
                {data.stats.totalUsers}
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {dict?.dashboard?.registeredAccounts || "Comptes enregistrés"}
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-emerald-50/50 to-emerald-100/30 hover:scale-105 transform">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 rounded-t-lg"></div>
              <CardTitle className="text-sm font-semibold text-slate-700 relative z-10">
                {dict?.dashboard?.products || "Produits"}
              </CardTitle>
              <div className="relative z-10">
                <div className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-lg">
                  <Package className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-black mb-1 bg-gradient-to-br from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                {data.stats.totalProducts}
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {data.stats.availableProducts}{" "}
                {dict?.dashboard?.available || "disponibles"}
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-purple-50/50 to-purple-100/30 hover:scale-105 transform">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10 rounded-t-lg"></div>
              <CardTitle className="text-sm font-semibold text-slate-700 relative z-10">
                {dict?.dashboard?.articles || "Articles"}
              </CardTitle>
              <div className="relative z-10">
                <div className="p-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-lg">
                  <FileText className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-black mb-1 bg-gradient-to-br from-purple-600 to-purple-800 bg-clip-text text-transparent">
                {data.stats.totalBlogArticles}
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {data.stats.publishedArticles}{" "}
                {dict?.dashboard?.published || "publiés"}
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-orange-50/50 to-orange-100/30 hover:scale-105 transform">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/10 rounded-t-lg"></div>
              <CardTitle className="text-sm font-semibold text-slate-700 relative z-10">
                {dict?.dashboard?.requests || "Demandes"}
              </CardTitle>
              <div className="relative z-10">
                <div className="p-2 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-lg">
                  <Search className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-black mb-1 bg-gradient-to-br from-orange-600 to-orange-800 bg-clip-text text-transparent">
                {data.stats.totalRequests}
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {data.stats.pendingRequests}{" "}
                {dict?.dashboard?.pending || "en attente"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides admin avec design premium */}
        <Card className="mb-12 border-0 bg-white/80 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center pb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
            <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold text-slate-800">
              <Shield className="h-6 w-6 text-blue-500" />
              {dict?.dashboard?.adminActions || "Actions d'administration"}
            </CardTitle>
            <p className="text-slate-600 mt-2">
              {dict?.dashboard?.adminActionsDesc ||
                "Gérez efficacement votre plateforme"}
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Button
                asChild
                className="h-16 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-0 shadow-lg group"
              >
                <Link
                  href={`/${lang}/fossiles/create`}
                  className="flex flex-col items-center gap-2"
                >
                  <Package className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-sm">
                    {dict?.dashboard?.newProduct || "Nouveau produit"}
                  </span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-16 border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 group"
              >
                <Link
                  href={`/${lang}/blog/create`}
                  className="flex flex-col items-center gap-2"
                >
                  <FileText className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-sm text-purple-700">
                    {dict?.dashboard?.newArticle || "Nouvel article"}
                  </span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-16 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 group"
              >
                <Link
                  href={`/${lang}/dashboard/requests/admin`}
                  className="flex flex-col items-center gap-2"
                >
                  <Search className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-sm text-blue-700">
                    {dict?.dashboard?.manageRequests || "Gérer demandes"}
                  </span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-16 border-2 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 group"
              >
                <Link
                  href={`/${lang}/dashboard/analytics`}
                  className="flex flex-col items-center gap-2"
                >
                  <BarChart3 className="h-5 w-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-sm text-indigo-700">
                    {dict?.dashboard?.analytics || "Analytics"}
                  </span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Demandes de fossiles avec design amélioré */}
          <Card className="lg:col-span-2 border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
            <CardHeader className="border-b border-orange-100 bg-gradient-to-r from-orange-50 to-red-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-lg">
                    <Search className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-slate-800">
                    {dict?.dashboard?.fossilRequests ||
                      "Demandes de fossiles récentes"}
                  </span>
                </CardTitle>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <Link href={`/${lang}/dashboard/requests/admin`}>
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {dict?.dashboard?.seeAll || "Voir toutes"}
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {data.fossilRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-10 w-10 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    {dict?.dashboard?.noRequests || "Aucune demande de fossile"}
                  </h3>
                  <p className="text-slate-600">
                    {dict?.dashboard?.noRequestsDesc ||
                      "Les nouvelles demandes apparaîtront ici"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {data.fossilRequests.slice(0, 10).map((request, index) => {
                    const StatusIcon =
                      statusIcons[request.status as keyof typeof statusIcons];
                    return (
                      <div
                        key={request.id}
                        className="group p-5 rounded-xl border border-slate-200 hover:border-orange-200 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-red-50/50 transition-all duration-300"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <StatusIcon className="h-4 w-4 text-orange-600" />
                            <h4 className="font-semibold text-slate-800 group-hover:text-orange-700 transition-colors">
                              {request.fossilType}
                            </h4>
                          </div>
                          <div className="flex gap-2">
                            <Badge
                              className={`${priorityColors[request.priority as keyof typeof priorityColors]} border text-xs`}
                            >
                              {request.priority}
                            </Badge>
                            <Badge
                              className={`${statusColors[request.status as keyof typeof statusColors]} border text-xs`}
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
                            <span className="font-medium">{request.name}</span>
                            <span className="text-slate-400">•</span>
                            <span>{request.email}</span>
                            {request.maxBudget && (
                              <>
                                <span className="text-slate-400">•</span>
                                <span className="flex items-center gap-1 font-medium">
                                  <Euro className="h-3 w-3" />
                                  {request.maxBudget.toLocaleString("fr-FR")} €
                                </span>
                              </>
                            )}
                          </div>
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="border-orange-200 text-orange-700 hover:bg-orange-50"
                          >
                            <Link
                              href={`/${lang}/dashboard/requests/admin/${request.id}`}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              {dict?.dashboard?.view || "Voir"}
                            </Link>
                          </Button>
                        </div>

                        <div className="mt-3 text-xs text-slate-400">
                          {dict?.dashboard?.createdOn || "Créée le"}{" "}
                          {new Date(request.createdAt).toLocaleDateString(
                            "fr-FR"
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activité récente */}
          <div className="space-y-8">
            {/* Nouveaux utilisateurs */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
              <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg font-bold text-slate-800">
                    {dict?.dashboard?.newUsers || "Nouveaux utilisateurs"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {data.recentUsers.slice(0, 5).map((user, index) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div>
                        <p className="font-semibold text-sm text-slate-800">
                          {user.name || "Anonyme"}
                        </p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className="text-xs bg-blue-50 border-blue-200 text-blue-700"
                        >
                          {user.role}
                        </Badge>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Produits récents */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
              <CardHeader className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-lg">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg font-bold text-slate-800">
                    {dict?.dashboard?.recentProducts || "Produits récents"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {data.recentProducts.slice(0, 5).map((product, index) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50 transition-colors"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-md">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0].imageUrl}
                            alt={product.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                            <Package className="h-4 w-4 text-emerald-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-800 truncate">
                          {product.title}
                        </p>
                        <p className="text-sm font-bold text-emerald-600">
                          {product.price.toLocaleString("fr-FR")} €
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
