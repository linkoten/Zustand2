import { getUserOrders } from "@/lib/actions/dashboardActions";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDictionary } from "@/app/[lang]/dictionaries";
import {
  ArrowLeft,
  Sparkles,
  Package,
  Calendar,
  Euro,
  ShoppingBag,
  Receipt,
  CheckCircle,
  User,
  MapPin,
  Clock,
} from "lucide-react";

interface OrderDetailPageProps {
  params: Promise<{ id: string; lang: "en" | "fr" }>;
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const orders = await getUserOrders(userId);
  const { id, lang } = await params;
  const dict = await getDictionary(lang);

  const order = orders.find((o) => o.id === id);

  if (!order) {
    return notFound();
  }

  const orderTotal =
    order.total && typeof order.total.toNumber === "function"
      ? order.total.toNumber()
      : parseFloat(order.total?.toString() || "0");

  const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Background décoratif */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-indigo-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-purple-200/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
        {/* Navigation */}
        <div className="mb-8">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="mb-6 hover:bg-white/80 backdrop-blur-sm"
          >
            <Link
              href={`/${lang}/dashboard/orders`}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {dict.dashboard?.orderBackToOrders || "Retour à mes commandes"}
            </Link>
          </Button>

          {/* En-tête avec animation */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/20 mb-6">
              <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
              <span className="text-sm font-semibold text-slate-700">
                {dict.dashboard?.orderDetailHub || "Détail de ma commande"}
              </span>
            </div>

            <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              {dict.dashboard?.orderDetailTitle || "Détail de la commande"} #
              {order.id.slice(-8).toUpperCase()} 🧾
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {dict.dashboard?.orderDetailSubtitle ||
                "Consultez tous les détails de votre commande"}
            </p>
          </div>
        </div>

        {/* Header de commande avec design premium */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg">
                  <Receipt className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-800">
                    {dict.dashboard?.orderLabel || "Commande"} #
                    {order.id.slice(-8).toUpperCase()}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600">
                      {dict.dashboard?.orderPlacedOn || "Passée le"}{" "}
                      <span className="font-medium">
                        {new Date(order.createdAt).toLocaleDateString(
                          lang === "en" ? "en-GB" : "fr-FR",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-slate-600 mb-1">
                    {dict.dashboard?.orderTotal || "Total"}
                  </div>
                  <div className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                    {orderTotal.toLocaleString(
                      lang === "en" ? "en-GB" : "fr-FR",
                      {
                        style: "currency",
                        currency: "EUR",
                      }
                    )}
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200 px-4 py-2">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {dict.dashboard?.orderStatusCompleted || "Terminée"}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations de commande */}
          <div className="lg:col-span-1 space-y-6">
            {/* Résumé */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                  <div className="p-2 bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl shadow-lg">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  {dict.dashboard?.orderSummary || "Résumé"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="p-2 bg-slate-200 rounded-lg">
                    <ShoppingBag className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      {dict.dashboard?.itemsCount || "Articles"}
                    </div>
                    <div className="text-sm font-medium text-slate-800">
                      {itemsCount} {dict.dashboard?.itemsLabel || "article(s)"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                  <div className="p-2 bg-emerald-200 rounded-lg">
                    <Euro className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      {dict.dashboard?.paymentStatus || "Paiement"}
                    </div>
                    <div className="text-sm font-medium text-emerald-700">
                      {dict.dashboard?.paymentCompleted || "Confirmé"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="p-2 bg-blue-200 rounded-lg">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      {dict.dashboard?.orderTime || "Heure"}
                    </div>
                    <div className="text-sm font-medium text-blue-700">
                      {new Date(order.createdAt).toLocaleTimeString(
                        lang === "en" ? "en-GB" : "fr-FR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations client */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                  <div className="p-2 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl shadow-lg">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  {dict.dashboard?.customerInfo || "Informations client"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="p-4 bg-indigo-50 rounded-xl">
                  <div className="text-sm font-semibold text-indigo-900 mb-2">
                    {dict.dashboard?.orderNumber || "Numéro de commande"}
                  </div>
                  <div className="text-lg font-mono font-bold text-indigo-700">
                    #{order.id.slice(-8).toUpperCase()}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="text-sm font-semibold text-slate-700 mb-2">
                    {dict.dashboard?.orderFullId || "ID complet"}
                  </div>
                  <div className="text-xs font-mono text-slate-600 break-all">
                    {order.id}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-blue-900">
                  {dict.dashboard?.orderActions || "Actions"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
                >
                  <Link href={`/${lang}/fossiles`}>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    {dict.dashboard?.continueShopping || "Continuer mes achats"}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Link href={`/${lang}/dashboard/orders`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {dict.dashboard?.viewAllOrders ||
                      "Voir toutes mes commandes"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Produits de la commande */}
          <div className="lg:col-span-2">
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                  <div className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-lg">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  {dict.dashboard?.orderProducts || "Produits"} ({itemsCount})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {order.items.map((item, index) => {
                    const imageUrl =
                      item.product?.images && item.product.images.length > 0
                        ? item.product.images[0].imageUrl
                        : "/placeholder.svg";

                    const itemPrice =
                      item.price && typeof item.price.toNumber === "function"
                        ? item.price.toNumber()
                        : parseFloat(item.price?.toString() || "0");

                    const lineTotal = itemPrice * item.quantity;

                    return (
                      <Card
                        key={item.id}
                        className="group border border-emerald-100 hover:border-emerald-200 transition-all duration-300 hover:scale-[1.02] transform"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="relative">
                              <img
                                src={imageUrl}
                                alt={
                                  item.product?.title ||
                                  dict.dashboard?.orderProduct ||
                                  "Produit"
                                }
                                className="w-20 h-20 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-shadow"
                              />
                              <Badge className="absolute -top-2 -right-2 bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
                                #{index + 1}
                              </Badge>
                            </div>

                            <div className="flex-1 space-y-3">
                              <div>
                                <h3 className="font-bold text-lg text-slate-800 group-hover:text-emerald-700 transition-colors">
                                  {item.product?.title ||
                                    dict.dashboard?.orderProduct ||
                                    "Produit"}
                                </h3>
                                {item.product?.title && (
                                  <p className="text-sm italic text-slate-500">
                                    {item.product.title}
                                  </p>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                                  <Package className="h-4 w-4 text-slate-500" />
                                  <div>
                                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                      {dict.dashboard?.orderQuantity ||
                                        "Quantité"}
                                    </div>
                                    <div className="font-bold text-slate-800">
                                      {item.quantity}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                                  <Euro className="h-4 w-4 text-blue-500" />
                                  <div>
                                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                      {dict.dashboard?.orderUnitPrice ||
                                        "Prix unitaire"}
                                    </div>
                                    <div className="font-bold text-blue-700">
                                      {itemPrice.toLocaleString(
                                        lang === "en" ? "en-GB" : "fr-FR",
                                        {
                                          style: "currency",
                                          currency: "EUR",
                                        }
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
                                  <Receipt className="h-4 w-4 text-emerald-500" />
                                  <div>
                                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                      {dict.dashboard?.orderLineTotal ||
                                        "Total ligne"}
                                    </div>
                                    <div className="font-bold text-emerald-700">
                                      {lineTotal.toLocaleString(
                                        lang === "en" ? "en-GB" : "fr-FR",
                                        {
                                          style: "currency",
                                          currency: "EUR",
                                        }
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Total de la commande */}
                <div className="mt-8 pt-6 border-t border-emerald-200">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-200 rounded-lg">
                        <Receipt className="h-5 w-5 text-emerald-600" />
                      </div>
                      <span className="text-lg font-bold text-emerald-900">
                        {dict.dashboard?.orderGrandTotal ||
                          "Total de la commande"}
                      </span>
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
