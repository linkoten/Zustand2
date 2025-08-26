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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { UserDashboardProps } from "@/types/dashboardType";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

const priorityColors = {
  LOW: "bg-gray-100 text-gray-800",
  NORMAL: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
};

export default function UserDashboard({ user, data }: UserDashboardProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Bonjour {user.name || "Utilisateur"} ! 👋
        </h1>
        <p className="text-muted-foreground">
          Voici un aperçu de votre activité sur FossilShop
        </p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favoris</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalFavorites}</div>
            <p className="text-xs text-muted-foreground">
              Fossiles sauvegardés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demandes</CardTitle>
            <Search className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              Recherches de fossiles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membre depuis</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                month: "short",
                year: "numeric",
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Date d&apos;inscription
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Statut</CardTitle>
            <Package className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant="secondary">{user.role}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Niveau de compte</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Actions rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button asChild className="h-12">
              <Link href="/fossiles" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Parcourir les fossiles
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12">
              <Link
                href="/fossiles/request"
                className="flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Nouvelle demande
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12">
              <Link
                href="/dashboard/requests"
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Mes demandes
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12">
              <Link href="/blog" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Lire le blog
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Favoris récents */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Mes favoris récents
              </CardTitle>
              {data.totalFavorites > 0 && (
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/favorites">Voir tout</Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {data.favorites.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Vous n&apos;avez pas encore de favoris
                </p>
                <Button asChild>
                  <Link href="/fossiles">Découvrir des fossiles</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {data.favorites.map((favorite) => (
                  <div
                    key={favorite.id}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative w-16 h-16 rounded-md overflow-hidden">
                      {favorite.images?.[0] ? (
                        <Image
                          src={favorite.images[0].imageUrl}
                          alt={favorite.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{favorite.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {favorite.category} • {favorite.geologicalPeriod}
                      </p>
                      <p className="text-sm font-medium text-primary">
                        {favorite.price.toLocaleString("fr-FR")} €
                      </p>
                    </div>
                    <Button asChild size="sm">
                      <Link href={`/fossiles/${favorite.id}`}>Voir</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demandes récentes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-500" />
                Mes demandes récentes
              </CardTitle>
              {data.totalRequests > 0 && (
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/requests">Voir tout</Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {data.fossilRequests.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Aucune demande de recherche
                </p>
                <Button asChild>
                  <Link href="/fossiles/request">Faire une demande</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {data.fossilRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{request.fossilType}</h4>
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

                      <Button asChild size="sm" variant="outline">
                        <Link href={`/dashboard/requests/${request.id}`}>
                          <Eye className="h-3 w-3 mr-1" />
                          Voir
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
  );
}
