"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RequestStatus, UserRole } from "@/lib/generated/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Trash2,
  MessageSquare,
  FileText,
  StickyNote,
} from "lucide-react";
import Link from "next/link";
import { FossilRequest } from "@/types/fossilRequestType";
import { deleteFossilRequest } from "@/lib/actions/fossilRequestsActions";
import { toast } from "sonner";

const statusLabels: Record<RequestStatus, string> = {
  PENDING: "En attente",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
  REJECTED: "Rejeté",
};

const statusColors: Record<RequestStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REJECTED: "bg-gray-100 text-gray-800",
};

const priorityLabels = {
  LOW: "Faible",
  NORMAL: "Normal",
  HIGH: "Élevé",
  URGENT: "Urgent",
};

const priorityColors = {
  LOW: "bg-gray-100 text-gray-800",
  NORMAL: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
};
interface FossilRequestListProps {
  requests: FossilRequest[];
  totalPages: number;
  currentPage: number;
  totalRequests: number;
  userRole: UserRole;
  lang: "fr" | "en";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}

export default function FossilRequestsList({
  requests,
  totalPages,
  currentPage,
  totalRequests,
  userRole, // ✅ Récupérer le rôle utilisateur
  lang,
  dict,
}: FossilRequestListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const currentStatus = searchParams.get("status");
  const currentPriority = searchParams.get("priority");

  // ✅ Fonction pour supprimer une demande (utilisateur uniquement)
  const handleDelete = async (requestId: string) => {
    setDeletingId(requestId);
    try {
      const result = await deleteFossilRequest(requestId);
      if (result.success) {
        toast.success("Demande supprimée avec succès");
        router.refresh();
      } else {
        toast.error(
          "error" in result ? result.error : "Erreur lors de la suppression"
        );
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  };

  // ✅ Fonction pour générer l'URL de détail selon le rôle
  const getDetailUrl = (requestId: string) => {
    return userRole === UserRole.ADMIN
      ? `/${lang}/dashboard/requests/admin/${requestId}`
      : `/${lang}/dashboard/requests/user/${requestId}`;
  };

  // ✅ Fonction pour générer l'URL de base selon le rôle
  const getBaseUrl = () => {
    return userRole === UserRole.ADMIN
      ? `/${lang}/dashboard/requests/admin`
      : `/${lang}/dashboard/requests/user`;
  };

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    params.delete("page");
    router.push(`${getBaseUrl()}?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    router.push(getBaseUrl());
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchTerm || null });
  };

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${getBaseUrl()}?${params.toString()}`;
  };

  const hasActiveFilters =
    currentStatus || currentPriority || searchParams.get("search");

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {dict?.fossilRequests?.filtersTitle || "Filtres"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Recherche */}
            <form onSubmit={handleSearch} className="space-y-2">
              <Label htmlFor="search">
                {dict?.fossilRequests?.searchLabel || "Rechercher"}
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder={
                    dict?.fossilRequests?.searchPlaceholder ||
                    "Nom, email, type de fossile..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>

            {/* Statut */}
            <div className="space-y-2">
              <Label>{dict?.fossilRequests?.statusLabel || "Statut"}</Label>
              <Select
                value={currentStatus || undefined}
                onValueChange={(value) =>
                  updateFilters({ status: value === "all" ? null : value })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      dict?.fossilRequests?.allStatuses || "Tous les statuts"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priorité */}
            <div className="space-y-2">
              <Label>{dict?.fossilRequests?.priorityLabel || "Priorité"}</Label>
              <Select
                value={currentPriority || undefined}
                onValueChange={(value) =>
                  updateFilters({ priority: value === "all" ? null : value })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      dict?.fossilRequests?.allPriorities ||
                      "Toutes les priorités"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {dict?.fossilRequests?.allPriorities}
                  </SelectItem>
                  {Object.entries(priorityLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button type="submit" onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                {dict?.fossilRequests?.searchButton || "Rechercher"}
              </Button>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  {dict?.fossilRequests?.clearButton || "Effacer"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résultats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {userRole === UserRole.ADMIN
                  ? dict?.fossilRequests?.adminTitle || "Fossil requests"
                  : dict?.fossilRequests?.userTitle || "My requests"}
              </CardTitle>
              <CardDescription>
                {userRole === UserRole.ADMIN
                  ? `${totalRequests} ${dict?.fossilRequests?.adminTotalLabel || "requests in total"}`
                  : `${totalRequests} ${dict?.fossilRequests?.userTotalLabel || "requests in total"}`}
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              {dict?.fossilRequests?.pageLabel || "Page"} {currentPage}{" "}
              {dict?.fossilRequests?.ofLabel || "of"} {totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {userRole === UserRole.ADMIN
                  ? dict?.fossilRequests?.emptyTitle || "No requests found"
                  : dict?.fossilRequests?.emptyDesc ||
                    "You have not made any fossil requests yet."}
              </p>
              {userRole === UserRole.USER && (
                <Button asChild className="mt-4">
                  <Link href={`/${lang}/fossiles/request`}>
                    {dict?.fossilRequests?.createFirstRequest ||
                      "Create my first request"}
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table responsive */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {/* ✅ Afficher la colonne Client seulement pour les admins */}
                      {userRole === UserRole.ADMIN && (
                        <TableHead>
                          {dict?.fossilRequests?.clientCol || "Client"}
                        </TableHead>
                      )}
                      <TableHead>
                        {dict?.fossilRequests?.fossilTypeCol ||
                          "Fossile recherché"}
                      </TableHead>
                      <TableHead>
                        {dict?.fossilRequests?.budgetCol || "Budget"}
                      </TableHead>
                      <TableHead>
                        {dict?.fossilRequests?.statusCol || "Statut"}
                      </TableHead>
                      <TableHead>
                        {dict?.fossilRequests?.priorityCol || "Priorité"}
                      </TableHead>
                      <TableHead>
                        {dict?.fossilRequests?.dateCol || "Date"}
                      </TableHead>
                      <TableHead>
                        {dict?.fossilRequests?.actionsCol || "Actions"}
                      </TableHead>
                      {/* ✅ Nouvelles colonnes selon le rôle */}
                      {userRole === UserRole.USER && (
                        <TableHead>
                          {dict?.fossilRequests?.adminMsgCol || "Message admin"}
                        </TableHead>
                      )}
                      {userRole === UserRole.ADMIN && (
                        <TableHead>
                          {dict?.fossilRequests?.adminNotesCol || "Notes admin"}
                        </TableHead>
                      )}
                      {userRole === UserRole.ADMIN && (
                        <TableHead>
                          {dict?.fossilRequests?.clientMsgCol ||
                            "Message client"}
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        {/* ✅ Afficher les infos client seulement pour les admins */}
                        {userRole === UserRole.ADMIN && (
                          <TableCell>
                            <div>
                              <div className="font-medium">{request.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {request.email}
                              </div>
                            </div>
                          </TableCell>
                        )}
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {request.fossilType}
                            </div>
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {request.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {request.maxBudget ? (
                            <span className="font-medium">
                              {request.maxBudget.toLocaleString("fr-FR")} €
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              {dict?.fossilRequests?.notSpecified ||
                                "Non spécifié"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[request.status]}>
                            {statusLabels[request.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={priorityColors[request.priority]}>
                            {priorityLabels[request.priority]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(request.createdAt).toLocaleDateString(
                              "fr-FR"
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {/* ✅ URL dynamique selon le rôle */}
                            <Button asChild size="sm" variant="outline">
                              <Link href={getDetailUrl(request.id)}>
                                <Eye className="h-4 w-4 mr-1" />
                                {dict?.fossilRequests?.viewAction || "Voir"}
                              </Link>
                            </Button>

                            {/* ✅ Bouton delete pour les utilisateurs */}
                            {userRole === UserRole.USER && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700"
                                    disabled={deletingId === request.id}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {dict?.fossilRequests?.deleteTitle ||
                                        "Confirmer la suppression"}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {dict?.fossilRequests?.deleteDescription
                                        ? dict.fossilRequests.deleteDescription.replace(
                                            "{title}",
                                            request.fossilType
                                          )
                                        : `Êtes-vous sûr de vouloir supprimer cette demande pour "${request.fossilType}" ? Cette action est irréversible.`}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      {dict?.fossilRequests?.deleteCancel ||
                                        "Annuler"}
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(request.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      {dict?.fossilRequests?.deleteConfirm ||
                                        "Supprimer"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>

                        {/* ✅ Message admin pour les utilisateurs */}
                        {userRole === UserRole.USER && (
                          <TableCell>
                            {request.responseMessage ? (
                              <div className="max-w-xs">
                                <div className="flex items-center gap-1 mb-1">
                                  <MessageSquare className="h-3 w-3 text-blue-500" />
                                  <span className="text-xs font-medium text-blue-600">
                                    {dict?.fossilRequests?.adminMsgReceived ||
                                      "Message reçu"}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                  {request.responseMessage}
                                </p>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {dict?.fossilRequests?.noAdminMsg ||
                                  "Aucun message"}
                              </span>
                            )}
                          </TableCell>
                        )}

                        {/* ✅ Notes admin pour les admins */}
                        {userRole === UserRole.ADMIN && (
                          <TableCell>
                            {request.adminNotes ? (
                              <div className="max-w-xs">
                                <div className="flex items-center gap-1 mb-1">
                                  <StickyNote className="h-3 w-3 text-orange-500" />
                                  <span className="text-xs font-medium text-orange-600">
                                    {dict?.fossilRequests?.privateNotes ||
                                      "Notes privées"}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {request.adminNotes}
                                </p>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {dict?.fossilRequests?.noAdminNotes ||
                                  "Aucune note"}
                              </span>
                            )}
                          </TableCell>
                        )}

                        {/* ✅ Message client pour les admins */}
                        {userRole === UserRole.ADMIN && (
                          <TableCell>
                            {request.responseMessage ? (
                              <div className="max-w-xs">
                                <div className="flex items-center gap-1 mb-1">
                                  <FileText className="h-3 w-3 text-green-500" />
                                  <span className="text-xs font-medium text-green-600">
                                    {dict?.fossilRequests?.sentToClient ||
                                      "Envoyé au client"}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {request.responseMessage}
                                </p>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {dict?.fossilRequests?.noClientMsg ||
                                  "Pas de réponse"}
                              </span>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    disabled={currentPage === 1}
                  >
                    <Link href={createPageUrl(currentPage - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                      {dict?.fossilRequests?.prevPage || "Précédent"}
                    </Link>
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <Button
                        key={pageNum}
                        variant={
                          pageNum === currentPage ? "default" : "outline"
                        }
                        size="sm"
                        asChild
                      >
                        <Link href={createPageUrl(pageNum)}>{pageNum}</Link>
                      </Button>
                    )
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    disabled={currentPage === totalPages}
                  >
                    <Link href={createPageUrl(currentPage + 1)}>
                      {dict?.fossilRequests?.nextPage || "Suivant"}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
