import { requireAdmin } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  ArrowLeft,
  Users,
  Clock,
  Search,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Filter,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { RequestPriority, RequestStatus } from "@/lib/generated/prisma";
import { getFossilRequests } from "@/lib/actions/fossilRequestsActions";
import FossilRequestsList from "@/components/fossilRequests/fossilRequestsList";
import { getDictionary } from "@/app/[lang]/dictionaries";

export default async function FossilRequestsPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{
    page?: string;
    status?: string;
    priority?: string;
    search?: string;
  }>;
  params: Promise<{ lang: "en" | "fr" }>;
}) {
  // Vérifier les permissions admin
  await requireAdmin();

  const { lang } = await params;
  const dict = await getDictionary(lang);

  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1");
  const status = resolvedSearchParams.status;
  const priority = resolvedSearchParams.priority;
  const search = resolvedSearchParams.search;

  const requestsData = await getFossilRequests(page, {
    status: status as RequestStatus,
    priority: priority as RequestPriority,
    search,
  });

  // Calculs des statistiques
  const pendingCount = requestsData.requests.filter(
    (r) => r.status === "PENDING"
  ).length;
  const inProgressCount = requestsData.requests.filter(
    (r) => r.status === "IN_PROGRESS"
  ).length;
  const completedCount = requestsData.requests.filter(
    (r) => r.status === "COMPLETED"
  ).length;
  const highPriorityCount = requestsData.requests.filter(
    (r) => r.priority === "HIGH"
  ).length;
  const urgentCount = requestsData.requests.filter(
    (r) => r.priority === "URGENT"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Background décoratif */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-indigo-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-purple-200/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
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
              Retour au dashboard
            </Link>
          </Button>

          {/* En-tête avec animation */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/20 mb-6">
              <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
              <span className="text-sm font-semibold text-slate-700">
                Centre d'administration
              </span>
            </div>

            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Demandes de Fossiles 🦖
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Gérez et supervisez toutes les demandes de recherche de fossiles
              des clients
            </p>

            {/* Badges d'état */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 px-4 py-2">
                <Users className="h-4 w-4 mr-2" />
                {requestsData.totalRequests} demandes totales
              </Badge>
              <Badge className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200 px-4 py-2">
                <Clock className="h-4 w-4 mr-2" />
                {pendingCount} en attente
              </Badge>
              <Badge className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200 px-4 py-2">
                <Search className="h-4 w-4 mr-2" />
                {inProgressCount} en cours
              </Badge>
            </div>
          </div>

          {/* Statistiques détaillées avec design premium */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            {/* Total demandes */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-blue-50/50 to-blue-100/30 hover:scale-105 transform">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 rounded-t-lg"></div>
                <CardTitle className="text-sm font-semibold text-slate-700 relative z-10">
                  Total demandes
                </CardTitle>
                <div className="relative z-10">
                  <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg">
                    <FileText className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-black mb-1 bg-gradient-to-br from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  {requestsData.totalRequests}
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Toutes les demandes
                </p>
              </CardContent>
            </Card>

            {/* En attente */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-amber-50/50 to-amber-100/30 hover:scale-105 transform">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/10 rounded-t-lg"></div>
                <CardTitle className="text-sm font-semibold text-slate-700 relative z-10">
                  En attente
                </CardTitle>
                <div className="relative z-10">
                  <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-lg">
                    <Clock className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-black mb-1 bg-gradient-to-br from-amber-600 to-amber-800 bg-clip-text text-transparent">
                  {pendingCount}
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Nécessitent une action
                </p>
              </CardContent>
            </Card>

            {/* En cours */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-indigo-50/50 to-indigo-100/30 hover:scale-105 transform">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-indigo-600/10 rounded-t-lg"></div>
                <CardTitle className="text-sm font-semibold text-slate-700 relative z-10">
                  En cours
                </CardTitle>
                <div className="relative z-10">
                  <div className="p-2 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl shadow-lg">
                    <Search className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-black mb-1 bg-gradient-to-br from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                  {inProgressCount}
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  En cours de traitement
                </p>
              </CardContent>
            </Card>

            {/* Terminées */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-emerald-50/50 to-emerald-100/30 hover:scale-105 transform">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 rounded-t-lg"></div>
                <CardTitle className="text-sm font-semibold text-slate-700 relative z-10">
                  Terminées
                </CardTitle>
                <div className="relative z-10">
                  <div className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-lg">
                    <CheckCircle className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-black mb-1 bg-gradient-to-br from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                  {completedCount}
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Succès réalisés
                </p>
              </CardContent>
            </Card>

            {/* Priorité urgente */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-red-50/50 to-red-100/30 hover:scale-105 transform">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/10 rounded-t-lg"></div>
                <CardTitle className="text-sm font-semibold text-slate-700 relative z-10">
                  Urgent
                </CardTitle>
                <div className="relative z-10">
                  <div className="p-2 bg-gradient-to-br from-red-400 to-red-600 rounded-xl shadow-lg">
                    <AlertTriangle className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-black mb-1 bg-gradient-to-br from-red-600 to-red-800 bg-clip-text text-transparent">
                  {urgentCount}
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Priorité maximale
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Conseils et analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Conseils d'administration */}
            <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-blue-900">
                  <TrendingUp className="h-5 w-5" />
                  Conseils d'administration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">
                        Priorisez les demandes urgentes
                      </h4>
                      <p className="text-sm text-blue-700">
                        {urgentCount > 0
                          ? `${urgentCount} demande(s) urgente(s) nécessitent votre attention immédiate.`
                          : "Aucune demande urgente en cours - excellent travail !"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">
                        Réactivité client
                      </h4>
                      <p className="text-sm text-blue-700">
                        Répondez aux demandes en attente sous 24h pour maintenir
                        la satisfaction client.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">
                        Notes administratives
                      </h4>
                      <p className="text-sm text-blue-700">
                        Utilisez les notes privées pour coordonner l'équipe et
                        suivre les recherches.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics rapides */}
            <Card className="border-0 bg-gradient-to-r from-emerald-50 to-green-50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-emerald-900">
                  <BarChart3 className="h-5 w-5" />
                  Analytics rapides
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-800">
                      Taux de completion
                    </span>
                    <span className="text-sm font-bold text-emerald-600">
                      {requestsData.totalRequests > 0
                        ? Math.round(
                            (completedCount / requestsData.totalRequests) * 100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-emerald-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          requestsData.totalRequests > 0
                            ? (completedCount / requestsData.totalRequests) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-800">
                      Demandes en cours
                    </span>
                    <span className="text-sm font-bold text-emerald-600">
                      {Math.round(
                        ((pendingCount + inProgressCount) /
                          Math.max(requestsData.totalRequests, 1)) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-emerald-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round(((pendingCount + inProgressCount) / Math.max(requestsData.totalRequests, 1)) * 100)}%`,
                      }}
                    ></div>
                  </div>

                  <div className="pt-2 border-t border-emerald-200">
                    <p className="text-xs text-emerald-700 text-center">
                      Dernière mise à jour:{" "}
                      {new Date().toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions rapides */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl mb-12">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                <div className="p-2 bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl shadow-lg">
                  <Filter className="h-5 w-5 text-white" />
                </div>
                Actions rapides
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  asChild
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg h-12"
                >
                  <Link
                    href={`?status=PENDING`}
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    Voir les demandes en attente
                  </Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg h-12"
                >
                  <Link
                    href={`?priority=URGENT`}
                    className="flex items-center gap-2"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Traiter les urgences
                  </Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white shadow-lg h-12"
                >
                  <Link
                    href={`?status=IN_PROGRESS`}
                    className="flex items-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                    Suivre les recherches
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des demandes */}
        <FossilRequestsList {...requestsData} dict={dict} lang={lang} />
      </div>
    </div>
  );
}
