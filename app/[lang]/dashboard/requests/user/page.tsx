import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getFossilRequests } from "@/lib/actions/fossilRequestsActions";
import { getUserData } from "@/lib/actions/dashboardActions";
import { RequestStatus, RequestPriority } from "@/lib/generated/prisma";
import FossilRequestsList from "@/components/fossilRequests/fossilRequestsList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { getDictionary } from "@/app/[lang]/dictionaries";

export default async function UserFossilRequestsPage({
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
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserData(userId);

  if (!user) {
    redirect("/sign-in");
  }

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
    userOnly: true,
  });

  const pendingCount = requestsData.requests.filter(
    (r) => r.status === "PENDING"
  ).length;
  const inProgressCount = requestsData.requests.filter(
    (r) => r.status === "IN_PROGRESS"
  ).length;
  const completedCount = requestsData.requests.filter(
    (r) => r.status === "COMPLETED"
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
              {dict?.dashboardRequests?.backToDashboard ||
                "Retour au dashboard"}
            </Link>
          </Button>

          {/* En-tête avec animation */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/20 mb-6">
              <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
              <span className="text-sm font-semibold text-slate-700">
                {dict?.dashboardRequests?.myRequestsHub ||
                  "Centre de mes demandes"}
              </span>
            </div>

            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              {dict?.dashboardRequests?.title || "Mes demandes de fossiles"} 🦖
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {dict?.dashboardRequests?.subtitle ||
                "Suivez l'état de vos demandes de recherche de fossiles"}
            </p>

            {/* Action principale */}
            <div className="mt-8">
              <Button
                asChild
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <Link href={`/${lang}/fossiles/request`}>
                  <Plus className="mr-2 h-5 w-5" />
                  {dict?.dashboardRequests?.newRequest || "Nouvelle demande"}
                </Link>
              </Button>
            </div>
          </div>

          {/* Statistiques avec design premium */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-blue-50/50 to-blue-100/30 hover:scale-105 transform">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 rounded-t-lg"></div>
                <CardTitle className="text-sm font-semibold text-slate-700 relative z-10">
                  {dict?.dashboardRequests?.myRequests || "Mes demandes"}
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
                  {dict?.dashboardRequests?.totalRequests || "Total demandes"}
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-amber-50/50 to-amber-100/30 hover:scale-105 transform">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/10 rounded-t-lg"></div>
                <CardTitle className="text-sm font-semibold text-slate-700 relative z-10">
                  {dict?.dashboardRequests?.pending || "En attente"}
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
                  {dict?.dashboardRequests?.awaitingResponse ||
                    "En attente de réponse"}
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-indigo-50/50 to-indigo-100/30 hover:scale-105 transform">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-indigo-600/10 rounded-t-lg"></div>
                <CardTitle className="text-sm font-semibold text-slate-700 relative z-10">
                  {dict?.dashboardRequests?.inProgress || "En cours"}
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
                  {dict?.dashboardRequests?.beingProcessed ||
                    "En cours de traitement"}
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-emerald-50/50 to-emerald-100/30 hover:scale-105 transform">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 rounded-t-lg"></div>
                <CardTitle className="text-sm font-semibold text-slate-700 relative z-10">
                  {dict?.dashboardRequests?.completed || "Terminées"}
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
                  {dict?.dashboardRequests?.successfullyCompleted ||
                    "Traitées avec succès"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Message d'aide pour les nouveaux utilisateurs */}
          {requestsData.totalRequests === 0 && (
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-2xl mb-12">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="h-12 w-12 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">
                    {dict?.dashboardRequests?.noRequestsTitle ||
                      "Aucune demande pour le moment"}
                  </h3>
                  <p className="text-slate-600 max-w-md mx-auto mb-8 leading-relaxed">
                    {dict?.dashboardRequests?.noRequestsDesc ||
                      "Vous cherchez un fossile spécifique ? Notre équipe d'experts peut vous aider à le trouver ! Décrivez ce que vous recherchez et nous ferons de notre mieux pour vous aider."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      asChild
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
                    >
                      <Link href={`/${lang}/fossiles/request`}>
                        <Plus className="mr-2 h-4 w-4" />
                        {dict?.dashboardRequests?.createFirstRequest ||
                          "Créer ma première demande"}
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Link href={`/${lang}/fossiles`}>
                        <Search className="mr-2 h-4 w-4" />
                        {dict?.dashboardRequests?.browseFossils ||
                          "Explorer les fossiles"}
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conseils et aide */}
          {requestsData.totalRequests > 0 && (
            <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-xl mb-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-blue-900">
                  <TrendingUp className="h-5 w-5" />
                  {dict?.dashboardRequests?.tipsTitle ||
                    "Conseils pour vos demandes"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <AlertCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-blue-900 mb-2">
                      {dict?.dashboardRequests?.tip1Title || "Soyez précis"}
                    </h4>
                    <p className="text-sm text-blue-700">
                      {dict?.dashboardRequests?.tip1Desc ||
                        "Plus votre description est détaillée, mieux nous pourrons vous aider"}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h4 className="font-semibold text-indigo-900 mb-2">
                      {dict?.dashboardRequests?.tip2Title || "Délai de réponse"}
                    </h4>
                    <p className="text-sm text-indigo-700">
                      {dict?.dashboardRequests?.tip2Desc ||
                        "Nous répondons généralement sous 24-48h ouvrées"}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-purple-900 mb-2">
                      {dict?.dashboardRequests?.tip3Title ||
                        "Suivi en temps réel"}
                    </h4>
                    <p className="text-sm text-purple-700">
                      {dict?.dashboardRequests?.tip3Desc ||
                        "Vous recevrez des notifications pour chaque mise à jour"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Liste des demandes */}
        <FossilRequestsList {...requestsData} dict={dict} lang={lang} />
      </div>
    </div>
  );
}
