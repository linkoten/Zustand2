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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AdminDashboardData, DashboardUser } from "@/types/dashboardType";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-800",
  REJECTED: "bg-red-100 text-red-800",
};

const priorityColors = {
  LOW: "bg-gray-100 text-gray-800",
  NORMAL: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
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
}

export default function AdminDashboard({ data }: AdminDashboardProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard Admin 🛠️</h1>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble de la plateforme FossilShop
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Comptes enregistrés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {data.stats.availableProducts} disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.totalBlogArticles}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.stats.publishedArticles} publiés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demandes</CardTitle>
            <Search className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              {data.stats.pendingRequests} en attente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Actions rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button asChild className="h-12">
              <Link href="/fossiles/create" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Nouveau produit
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12">
              <Link href="/blog/create" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Nouvel article
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12">
              <Link
                href="/dashboard/analytics"
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Statistiques
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Demandes de fossiles */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-orange-500" />
                Demandes de fossiles récentes
              </CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/requests/admin">Voir toutes</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {data.fossilRequests.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Aucune demande de fossile
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {data.fossilRequests.slice(0, 10).map((request) => {
                  const StatusIcon =
                    statusIcons[request.status as keyof typeof statusIcons];
                  return (
                    <div
                      key={request.id}
                      className="p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4" />
                          <h4 className="font-medium">{request.fossilType}</h4>
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            className={
                              priorityColors[
                                request.priority as keyof typeof priorityColors
                              ]
                            }
                          >
                            {request.priority}
                          </Badge>
                          <Badge
                            className={
                              statusColors[
                                request.status as keyof typeof statusColors
                              ]
                            }
                          >
                            {request.status}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {request.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{request.name}</span>
                          <span>{request.email}</span>
                          {request.maxBudget && (
                            <span className="flex items-center gap-1">
                              <Euro className="h-3 w-3" />
                              {request.maxBudget.toLocaleString("fr-FR")} €
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link
                              href={`/dashboard/requests/admin/${request.id}`}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Voir
                            </Link>
                          </Button>
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-muted-foreground">
                        Créée le{" "}
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
        <div className="space-y-6">
          {/* Nouveaux utilisateurs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-blue-500" />
                Nouveaux utilisateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentUsers.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {user.name || "Anonyme"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Produits récents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4 text-green-500" />
                Produits récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-md overflow-hidden">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0].imageUrl}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Package className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {product.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
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
  );
}
