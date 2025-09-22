import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUserOrders } from "@/lib/actions/dashboardActions";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  ShoppingCart,
  Package,
  Calendar,
  Euro,
  Eye,
  ShoppingBag,
  TrendingUp,
  Receipt,
  Clock,
} from "lucide-react";
import { getDictionary } from "@/app/[lang]/dictionaries";

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ lang: "en" | "fr" }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const orders = await getUserOrders(userId);
  const { lang } = await params;
  const dict = await getDictionary(lang);

  // Calculs des statistiques
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => {
    const orderTotal =
      order.total && typeof order.total.toNumber === "function"
        ? order.total.toNumber()
        : parseFloat(order.total?.toString() || "0");
    return sum + orderTotal;
  }, 0);

  const averageOrder = totalOrders > 0 ? totalSpent / totalOrders : 0;
  const recentOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return orderDate >= thirtyDaysAgo;
  }).length;

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
              {dict.dashboard?.backToDashboard || "Retour au dashboard"}
            </Link>
          </Button>

          {/* En-tête avec animation */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/20 mb-6">
              <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
              <span className="text-sm font-semibold text-slate-700">
                {dict.dashboard?.ordersHub || "Centre de mes commandes"}
              </span>
            </div>

            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              {dict.dashboard?.ordersTitle || "Mes commandes"} 🛒
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {dict.dashboard?.ordersSubtitle ||
                "Retrouvez l'historique complet de vos achats de fossiles"}
            </p>

            {/* Action principale */}
            <div className="mt-8">
              <Button
                asChild
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <Link href={`/${lang}/fossiles`}>
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  {dict.dashboard?.continueShopping || "Continuer mes achats"}
                </Link>
              </Button>
            </div>
          </div>

          {/* Statistiques avec design premium */}
          {totalOrders > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {/* Total commandes */}
              <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-blue-50/50 to-blue-100/30 hover:scale-105 transform">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 rounded-t-lg"></div>
                  <CardTitle className="text-sm font-semibold text-slate-700 relative z-10">
                    {dict.dashboard?.totalOrders || "Total commandes"}
                  </CardTitle>
                  <div className="relative z-10">
                    <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg">
                      <ShoppingCart className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-black mb-1 bg-gradient-to-br from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    {totalOrders}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {dict.dashboard?.ordersPlaced || "Commandes passées"}
                  </p>
                </CardContent>
              </Card>

              {/* Total dépensé */}
              <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-emerald-50/50 to-emerald-100/30 hover:scale-105 transform">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 rounded-t-lg"></div>
                  <CardTitle className="text-sm font-semibold text-slate-700 relative z-10">
                    {dict.dashboard?.totalSpent || "Total dépensé"}
                  </CardTitle>
                  <div className="relative z-10">
                    <div className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-lg">
                      <Euro className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-black mb-1 bg-gradient-to-br from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                    {totalSpent.toLocaleString(
                      lang === "en" ? "en-GB" : "fr-FR",
                      {
                        style: "currency",
                        currency: "EUR",
                        maximumFractionDigits: 0,
                      }
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {dict.dashboard?.investmentTotal || "Investissement total"}
                  </p>
                </CardContent>
              </Card>

              {/* Panier moyen */}
              <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-amber-50/50 to-amber-100/30 hover:scale-105 transform">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/10 rounded-t-lg"></div>
                  <CardTitle className="text-sm font-semibold text-slate-700 relative z-10">
                    {dict.dashboard?.averageOrder || "Panier moyen"}
                  </CardTitle>
                  <div className="relative z-10">
                    <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-lg">
                      <TrendingUp className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-black mb-1 bg-gradient-to-br from-amber-600 to-amber-800 bg-clip-text text-transparent">
                    {averageOrder.toLocaleString(
                      lang === "en" ? "en-GB" : "fr-FR",
                      {
                        style: "currency",
                        currency: "EUR",
                        maximumFractionDigits: 0,
                      }
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {dict.dashboard?.perOrder || "Par commande"}
                  </p>
                </CardContent>
              </Card>

              {/* Commandes récentes */}
              <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-indigo-50/50 to-indigo-100/30 hover:scale-105 transform">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-indigo-600/10 rounded-t-lg"></div>
                  <CardTitle className="text-sm font-semibold text-slate-700 relative z-10">
                    {dict.dashboard?.recentOrders || "Ce mois-ci"}
                  </CardTitle>
                  <div className="relative z-10">
                    <div className="p-2 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl shadow-lg">
                      <Clock className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-black mb-1 bg-gradient-to-br from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                    {recentOrders}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {dict.dashboard?.lastThirtyDays || "Derniers 30 jours"}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Liste des commandes */}
        {orders.length === 0 ? (
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl text-center py-16">
            <CardContent>
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                  <Package className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  {dict.dashboard?.noOrdersTitle ||
                    "Aucune commande pour le moment"}
                </h3>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  {dict.dashboard?.ordersEmpty ||
                    "Vous n'avez pas encore passé de commande. Découvrez notre collection exceptionnelle de fossiles !"}
                </p>
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
                >
                  <Link href={`/${lang}/fossiles`}>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    {dict.dashboard?.startShopping || "Commencer mes achats"}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => {
              const orderTotal =
                order.total && typeof order.total.toNumber === "function"
                  ? order.total.toNumber()
                  : parseFloat(order.total?.toString() || "0");

              return (
                <Card
                  key={order.id}
                  className="group border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] transform"
                >
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg">
                          <Receipt className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-slate-800">
                            {dict.dashboard?.orderLabel || "Commande"} #
                            {order.id.slice(-8).toUpperCase()}
                          </CardTitle>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              <Calendar className="h-4 w-4" />
                              {dict.dashboard?.orderPlacedOn ||
                                "Passée le"}{" "}
                              <span className="font-medium">
                                {new Date(order.createdAt).toLocaleDateString(
                                  lang === "en" ? "en-GB" : "fr-FR"
                                )}
                              </span>
                            </div>
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-blue-800 border-blue-200"
                            >
                              #{index + 1}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-slate-600 mb-1">
                            {dict.dashboard?.orderTotal || "Total"}
                          </div>
                          <div className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                            {orderTotal.toLocaleString(
                              lang === "en" ? "en-GB" : "fr-FR",
                              {
                                style: "currency",
                                currency: "EUR",
                              }
                            )}
                          </div>
                        </div>

                        <Button
                          asChild
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Link href={`/${lang}/dashboard/orders/${order.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            {dict.dashboard?.orderDetailsButton ||
                              "Voir le détail"}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="p-2 bg-slate-200 rounded-lg">
                          <Package className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            {dict.dashboard?.orderStatus || "Statut"}
                          </div>
                          <div className="text-sm font-medium text-slate-800">
                            {dict.dashboard?.orderStatusCompleted || "Terminée"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                        <div className="p-2 bg-emerald-200 rounded-lg">
                          <Euro className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            {dict.dashboard?.paymentMethod || "Paiement"}
                          </div>
                          <div className="text-sm font-medium text-emerald-700">
                            {dict.dashboard?.paymentCompleted || "Confirmé"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="p-2 bg-blue-200 rounded-lg">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            {dict.dashboard?.orderDate || "Date"}
                          </div>
                          <div className="text-sm font-medium text-blue-700">
                            {new Date(order.createdAt).toLocaleDateString(
                              lang === "en" ? "en-GB" : "fr-FR",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Conseils d'achat */}
        {orders.length > 0 && (
          <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-xl mt-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-blue-900">
                <TrendingUp className="h-5 w-5" />
                {dict.dashboard?.shoppingTips || "Conseils d'achat"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-900">
                    {dict.dashboard?.loyaltyProgram || "Programme de fidélité"}
                  </h4>
                  <p className="text-sm text-blue-700">
                    {dict.dashboard?.loyaltyDesc ||
                      "Plus vous commandez, plus vous bénéficiez d'avantages exclusifs et de réductions."}
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-900">
                    {dict.dashboard?.expertAdvice || "Conseils d'experts"}
                  </h4>
                  <p className="text-sm text-blue-700">
                    {dict.dashboard?.expertDesc ||
                      "Notre équipe de paléontologues est disponible pour vous conseiller dans vos achats."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
