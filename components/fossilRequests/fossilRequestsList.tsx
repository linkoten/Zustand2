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
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Euro,
  Calendar,
  User,
  Sparkles,
  Plus,
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
  PENDING:
    "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200",
  IN_PROGRESS:
    "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200",
  COMPLETED:
    "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200",
  CANCELLED:
    "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200",
  REJECTED:
    "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200",
};

const statusIcons = {
  PENDING: Clock,
  IN_PROGRESS: Search,
  COMPLETED: CheckCircle,
  CANCELLED: XCircle,
  REJECTED: XCircle,
};

const priorityLabels = {
  LOW: "Faible",
  NORMAL: "Normal",
  HIGH: "Élevé",
  URGENT: "Urgent",
};

const priorityColors = {
  LOW: "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200",
  NORMAL:
    "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200",
  HIGH: "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200",
  URGENT:
    "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200",
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
  userRole,
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

  const getDetailUrl = (requestId: string) => {
    return userRole === UserRole.ADMIN
      ? `/${lang}/dashboard/requests/admin/${requestId}`
      : `/${lang}/dashboard/requests/user/${requestId}`;
  };

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
    <div className="space-y-8">
      {/* Filtres avec design premium */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
            <div className="p-2 bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl shadow-lg">
              <Filter className="h-5 w-5 text-white" />
            </div>
            {dict?.fossilRequests?.filtersTitle || "Filtres de recherche"}
          </CardTitle>
          <CardDescription>
            {dict?.fossilRequests?.filtersDesc ||
              "Affinez votre recherche avec nos filtres avancés"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            {/* Recherche */}
            <form onSubmit={handleSearch} className="space-y-3">
              <Label
                htmlFor="search"
                className="text-sm font-semibold text-slate-700"
              >
                {dict?.fossilRequests?.searchLabel || "Rechercher"}
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder={
                    dict?.fossilRequests?.searchPlaceholder ||
                    "Nom, email, type de fossile..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-200 focus:border-blue-300 focus:ring-blue-300"
                />
              </div>
            </form>

            {/* Statut */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">
                {dict?.fossilRequests?.statusLabel || "Statut"}
              </Label>
              <Select
                value={currentStatus || undefined}
                onValueChange={(value) =>
                  updateFilters({ status: value === "all" ? null : value })
                }
              >
                <SelectTrigger className="border-slate-200 focus:border-blue-300">
                  <SelectValue
                    placeholder={
                      dict?.fossilRequests?.allStatuses || "Tous les statuts"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-slate-400" />
                      Tous les statuts
                    </div>
                  </SelectItem>
                  {Object.entries(statusLabels).map(([value, label]) => {
                    const StatusIcon =
                      statusIcons[value as keyof typeof statusIcons];
                    return (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4" />
                          {label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Priorité */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">
                {dict?.fossilRequests?.priorityLabel || "Priorité"}
              </Label>
              <Select
                value={currentPriority || undefined}
                onValueChange={(value) =>
                  updateFilters({ priority: value === "all" ? null : value })
                }
              >
                <SelectTrigger className="border-slate-200 focus:border-blue-300">
                  <SelectValue
                    placeholder={
                      dict?.fossilRequests?.allPriorities ||
                      "Toutes les priorités"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-slate-400" />
                      {dict?.fossilRequests?.allPriorities ||
                        "Toutes les priorités"}
                    </div>
                  </SelectItem>
                  {Object.entries(priorityLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            value === "URGENT"
                              ? "bg-red-500"
                              : value === "HIGH"
                                ? "bg-orange-500"
                                : value === "NORMAL"
                                  ? "bg-blue-500"
                                  : "bg-gray-500"
                          }`}
                        />
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="submit"
                onClick={handleSearch}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
              >
                <Search className="h-4 w-4 mr-2" />
                {dict?.fossilRequests?.searchButton || "Rechercher"}
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="border-slate-300 hover:bg-slate-50"
                >
                  {dict?.fossilRequests?.clearButton || "Effacer"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résultats */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800">
                {userRole === UserRole.ADMIN
                  ? dict?.fossilRequests?.adminTitle ||
                    "Toutes les demandes de fossiles"
                  : dict?.fossilRequests?.userTitle || "Mes demandes"}
              </CardTitle>
              <CardDescription className="text-slate-600 mt-1">
                {userRole === UserRole.ADMIN
                  ? `${totalRequests} ${dict?.fossilRequests?.adminTotalLabel || "demandes au total"}`
                  : `${totalRequests} ${dict?.fossilRequests?.userTotalLabel || "demandes au total"}`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-blue-50 border-blue-200 text-blue-700"
              >
                {dict?.fossilRequests?.pageLabel || "Page"} {currentPage}{" "}
                {dict?.fossilRequests?.ofLabel || "sur"} {totalPages}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">
                {userRole === UserRole.ADMIN
                  ? dict?.fossilRequests?.emptyTitle || "Aucune demande trouvée"
                  : dict?.fossilRequests?.emptyDesc ||
                    "Vous n'avez pas encore fait de demande"}
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                {userRole === UserRole.USER &&
                  (dict?.fossilRequests?.emptyHint ||
                    "Commencez par créer votre première demande de fossile")}
              </p>
              {userRole === UserRole.USER && (
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
                >
                  <Link href={`/${lang}/fossiles/request`}>
                    <Plus className="mr-2 h-4 w-4" />
                    {dict?.fossilRequests?.createFirstRequest ||
                      "Créer ma première demande"}
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-0">
              {/* Version mobile - Cards */}
              <div className="block lg:hidden space-y-4 p-6">
                {requests.map((request, index) => {
                  const StatusIcon =
                    statusIcons[request.status as keyof typeof statusIcons];
                  return (
                    <Card
                      key={request.id}
                      className="group hover:shadow-lg transition-all duration-300 border border-slate-200 hover:border-blue-200"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-slate-800 mb-1">
                              {request.fossilType}
                            </h3>
                            {userRole === UserRole.ADMIN && (
                              <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                                <User className="h-4 w-4" />
                                <span>{request.name}</span>
                                <span className="text-slate-400">•</span>
                                <span>{request.email}</span>
                              </div>
                            )}
                            <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                              {request.description}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge
                              className={`${statusColors[request.status]} border text-xs`}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusLabels[request.status]}
                            </Badge>
                            <Badge
                              className={`${priorityColors[request.priority]} border text-xs`}
                            >
                              {priorityLabels[request.priority]}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(request.createdAt).toLocaleDateString(
                                "fr-FR"
                              )}
                            </div>
                            {request.maxBudget && (
                              <div className="flex items-center gap-1">
                                <Euro className="h-3 w-3" />
                                {request.maxBudget.toLocaleString("fr-FR")} €
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="border-blue-200 text-blue-700 hover:bg-blue-50"
                            >
                              <Link href={getDetailUrl(request.id)}>
                                <Eye className="h-3 w-3 mr-1" />
                                Voir
                              </Link>
                            </Button>
                            {userRole === UserRole.USER && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                                    disabled={deletingId === request.id}
                                  >
                                    <Trash2 className="h-3 w-3" />
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
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Version desktop - Table */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="border-b border-slate-200">
                      {userRole === UserRole.ADMIN && (
                        <TableHead className="font-semibold text-slate-700">
                          {dict?.fossilRequests?.clientCol || "Client"}
                        </TableHead>
                      )}
                      <TableHead className="font-semibold text-slate-700">
                        {dict?.fossilRequests?.fossilTypeCol ||
                          "Fossile recherché"}
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        {dict?.fossilRequests?.budgetCol || "Budget"}
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        {dict?.fossilRequests?.statusCol || "Statut"}
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        {dict?.fossilRequests?.priorityCol || "Priorité"}
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        {dict?.fossilRequests?.dateCol || "Date"}
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        {dict?.fossilRequests?.actionsCol || "Actions"}
                      </TableHead>
                      {userRole === UserRole.USER && (
                        <TableHead className="font-semibold text-slate-700">
                          {dict?.fossilRequests?.adminMsgCol || "Message admin"}
                        </TableHead>
                      )}
                      {userRole === UserRole.ADMIN && (
                        <>
                          <TableHead className="font-semibold text-slate-700">
                            {dict?.fossilRequests?.adminNotesCol ||
                              "Notes admin"}
                          </TableHead>
                          <TableHead className="font-semibold text-slate-700">
                            {dict?.fossilRequests?.clientMsgCol ||
                              "Message client"}
                          </TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request, index) => {
                      const StatusIcon =
                        statusIcons[request.status as keyof typeof statusIcons];
                      return (
                        <TableRow
                          key={request.id}
                          className="hover:bg-slate-50/50 transition-colors border-b border-slate-100"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {userRole === UserRole.ADMIN && (
                            <TableCell>
                              <div>
                                <div className="font-medium text-slate-800">
                                  {request.name}
                                </div>
                                <div className="text-sm text-slate-500">
                                  {request.email}
                                </div>
                              </div>
                            </TableCell>
                          )}
                          <TableCell>
                            <div>
                              <div className="font-medium text-slate-800">
                                {request.fossilType}
                              </div>
                              <div className="text-sm text-slate-600 line-clamp-2 max-w-xs">
                                {request.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {request.maxBudget ? (
                              <div className="flex items-center gap-1">
                                <Euro className="h-4 w-4 text-emerald-600" />
                                <span className="font-medium text-emerald-600">
                                  {request.maxBudget.toLocaleString("fr-FR")} €
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-sm">
                                {dict?.fossilRequests?.notSpecified ||
                                  "Non spécifié"}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`${statusColors[request.status]} border`}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusLabels[request.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`${priorityColors[request.priority]} border`}
                            >
                              {priorityLabels[request.priority]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              <Calendar className="h-3 w-3" />
                              {new Date(request.createdAt).toLocaleDateString(
                                "fr-FR"
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                              >
                                <Link href={getDetailUrl(request.id)}>
                                  <Eye className="h-3 w-3 mr-1" />
                                  {dict?.fossilRequests?.viewAction || "Voir"}
                                </Link>
                              </Button>

                              {userRole === UserRole.USER && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                                      disabled={deletingId === request.id}
                                    >
                                      <Trash2 className="h-3 w-3" />
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
                                  <p className="text-sm text-slate-600 line-clamp-3">
                                    {request.responseMessage}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400">
                                  {dict?.fossilRequests?.noAdminMsg ||
                                    "Aucun message"}
                                </span>
                              )}
                            </TableCell>
                          )}

                          {userRole === UserRole.ADMIN && (
                            <>
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
                                    <p className="text-sm text-slate-600 line-clamp-2">
                                      {request.adminNotes}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400">
                                    {dict?.fossilRequests?.noAdminNotes ||
                                      "Aucune note"}
                                  </span>
                                )}
                              </TableCell>
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
                                    <p className="text-sm text-slate-600 line-clamp-2">
                                      {request.responseMessage}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400">
                                    {dict?.fossilRequests?.noClientMsg ||
                                      "Pas de réponse"}
                                  </span>
                                )}
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination modernisée */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 p-6 bg-slate-50/50 border-t border-slate-200">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    disabled={currentPage === 1}
                    className="disabled:opacity-50"
                  >
                    <Link href={createPageUrl(currentPage - 1)}>
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      {dict?.fossilRequests?.prevPage || "Précédent"}
                    </Link>
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pageNum === currentPage ? "default" : "outline"
                          }
                          size="sm"
                          asChild
                          className={
                            pageNum === currentPage
                              ? "bg-blue-600 hover:bg-blue-700"
                              : ""
                          }
                        >
                          <Link href={createPageUrl(pageNum)}>{pageNum}</Link>
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    disabled={currentPage === totalPages}
                    className="disabled:opacity-50"
                  >
                    <Link href={createPageUrl(currentPage + 1)}>
                      {dict?.fossilRequests?.nextPage || "Suivant"}
                      <ChevronRight className="h-4 w-4 ml-1" />
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
