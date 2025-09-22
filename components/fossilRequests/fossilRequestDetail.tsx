"use client";

import { useState } from "react";
import {
  UserRole,
  RequestStatus,
  RequestPriority,
} from "@/lib/generated/prisma";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Save,
  FileText,
  Calendar,
  User,
  MessageSquare,
  StickyNote,
  AlertCircle,
  Clock,
  CheckCircle,
  Search,
  XCircle,
  Euro,
  Globe,
  MapPin,
  Layers,
  Edit3,
  Phone,
  Mail,
} from "lucide-react";
import { updateFossilRequest } from "@/lib/actions/fossilRequestsActions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface FossilRequestDetailProps {
  request: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    fossilType: string;
    description: string;
    maxBudget: number | null;
    geologicalPeriod: string | null;
    category: string | null;
    countryOfOrigin: string | null;
    locality: string | null;
    status: RequestStatus;
    priority: RequestPriority;
    adminNotes: string | null;
    responseMessage: string | null;
    respondedBy: string | null;
    respondedAt: string | null;
    createdAt: string;
    updatedAt: string;
    clerkUserId?: string | null;
    userRole?: UserRole;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}

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

export default function FossilRequestDetail({
  request,
  dict,
}: FossilRequestDetailProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAdmin = request.userRole === UserRole.ADMIN;

  // États pour les champs modifiables (admin seulement)
  const [status, setStatus] = useState(request.status);
  const [priority, setPriority] = useState(request.priority);
  const [adminNotes, setAdminNotes] = useState(request.adminNotes || "");
  const [responseMessage, setResponseMessage] = useState(
    request.responseMessage || ""
  );

  const handleSave = async () => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      const result = await updateFossilRequest(request.id, {
        status,
        priority,
        adminNotes: adminNotes.trim() || null,
        responseMessage: responseMessage.trim() || null,
        respondedBy: "Admin",
      });

      if (result.success) {
        toast.success(
          dict.fossilRequests?.updateSuccess ||
            "Demande mise à jour avec succès"
        );
        setIsEditing(false);
        router.refresh();
      } else {
        toast.error(
          result.error ||
            dict.fossilRequests?.updateError ||
            "Erreur lors de la mise à jour"
        );
      }
    } catch (error) {
      toast.error(
        dict.fossilRequests?.updateError || "Erreur lors de la mise à jour"
      );
    } finally {
      setLoading(false);
    }
  };

  const StatusIcon = statusIcons[request.status as keyof typeof statusIcons];

  return (
    <div className="space-y-8">
      {/* Header avec design premium */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800">
                <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                {dict.fossilRequests?.requestTitle || "Demande"} #
                {request.id.slice(-8)}
              </CardTitle>
              <CardDescription className="text-lg mt-2 text-slate-600">
                <span className="font-medium">
                  {dict.fossilRequests?.fossilTypeLabel || "Type de fossile"}:
                </span>{" "}
                {request.fossilType}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                className={`${statusColors[request.status]} border text-sm px-3 py-1`}
              >
                <StatusIcon className="h-4 w-4 mr-2" />
                {dict.fossilRequests?.[`status_${request.status}`] ||
                  statusLabels[request.status]}
              </Badge>
              <Badge
                className={`${priorityColors[request.priority]} border text-sm px-3 py-1`}
              >
                {dict.fossilRequests?.[`priority_${request.priority}`] ||
                  priorityLabels[request.priority]}
              </Badge>
              {isAdmin &&
                (isEditing ? (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      size="sm"
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {dict.fossilRequests?.saveButton || "Sauvegarder"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={loading}
                      size="sm"
                      className="border-slate-300 hover:bg-slate-50"
                    >
                      {dict.fossilRequests?.cancelButton || "Annuler"}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    {dict.fossilRequests?.editButton || "Modifier"}
                  </Button>
                ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Informations client */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
              <div className="p-2 bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl shadow-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              {dict.fossilRequests?.clientInfoTitle || "Informations du client"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <div className="p-2 bg-slate-200 rounded-lg">
                  <User className="h-4 w-4 text-slate-600" />
                </div>
                <div className="flex-1">
                  <Label className="text-sm font-semibold text-slate-700">
                    {dict.fossilRequestForm?.fullNameLabel || "Nom complet"}
                  </Label>
                  <p className="text-slate-800 font-medium">{request.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <div className="p-2 bg-slate-200 rounded-lg">
                  <Mail className="h-4 w-4 text-slate-600" />
                </div>
                <div className="flex-1">
                  <Label className="text-sm font-semibold text-slate-700">
                    Email
                  </Label>
                  <p className="text-slate-800 font-medium">{request.email}</p>
                </div>
              </div>

              {request.phone && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <div className="p-2 bg-slate-200 rounded-lg">
                    <Phone className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm font-semibold text-slate-700">
                      {dict.fossilRequestForm?.phoneLabel || "Téléphone"}
                    </Label>
                    <p className="text-slate-800 font-medium">
                      {request.phone}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statut et priorité */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
              <div className="p-2 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl shadow-lg">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              {dict.fossilRequests?.statusSectionTitle ||
                "Statut de la demande"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {isAdmin && isEditing ? (
              <>
                <div className="space-y-3">
                  <Label
                    htmlFor="status"
                    className="text-sm font-semibold text-slate-700"
                  >
                    {dict.fossilRequests?.statusLabel || "Statut"}
                  </Label>
                  <Select
                    value={status}
                    onValueChange={(value: RequestStatus) => setStatus(value)}
                  >
                    <SelectTrigger className="border-slate-200 focus:border-blue-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => {
                        const Icon =
                          statusIcons[value as keyof typeof statusIcons];
                        return (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {dict.fossilRequests?.[`status_${value}`] ||
                                label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="priority"
                    className="text-sm font-semibold text-slate-700"
                  >
                    {dict.fossilRequests?.priorityLabel || "Priorité"}
                  </Label>
                  <Select
                    value={priority}
                    onValueChange={(value: RequestPriority) =>
                      setPriority(value)
                    }
                  >
                    <SelectTrigger className="border-slate-200 focus:border-blue-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                            {dict.fossilRequests?.[`priority_${value}`] ||
                              label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                    {dict.fossilRequests?.currentStatusLabel || "Statut actuel"}
                  </Label>
                  <Badge
                    className={`${statusColors[request.status]} border text-sm`}
                  >
                    <StatusIcon className="h-4 w-4 mr-2" />
                    {dict.fossilRequests?.[`status_${request.status}`] ||
                      statusLabels[request.status]}
                  </Badge>
                </div>
                <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl">
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                    {dict.fossilRequests?.priorityLabel || "Priorité"}
                  </Label>
                  <Badge
                    className={`${priorityColors[request.priority]} border text-sm`}
                  >
                    {dict.fossilRequests?.[`priority_${request.priority}`] ||
                      priorityLabels[request.priority]}
                  </Badge>
                </div>
              </>
            )}

            {request.respondedBy && request.respondedAt && (
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl">
                <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                  {dict.fossilRequests?.lastUpdateLabel ||
                    "Dernière mise à jour"}
                </Label>
                <p className="text-sm text-slate-600">
                  {dict.fossilRequests?.byLabel || "Par"}{" "}
                  <span className="font-medium">{request.respondedBy}</span>{" "}
                  {dict.fossilRequests?.onLabel || "le"}{" "}
                  <span className="font-medium">
                    {new Date(request.respondedAt).toLocaleDateString(
                      dict.lang || "fr-FR"
                    )}
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Détails de la demande */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
            <div className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            {dict.fossilRequests?.detailsSectionTitle ||
              "Détails de la demande"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="p-4 bg-emerald-50 rounded-xl">
            <Label className="text-sm font-semibold text-slate-700 mb-2 block">
              {dict.fossilRequests?.fossilTypeLabel || "Type de fossile"}
            </Label>
            <p className="text-slate-800 font-medium text-lg">
              {request.fossilType}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl">
            <Label className="text-sm font-semibold text-slate-700 mb-3 block">
              {dict.fossilRequestForm?.descLabel || "Description détaillée"}
            </Label>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {request.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {request.maxBudget && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl">
                <div className="p-2 bg-emerald-200 rounded-lg">
                  <Euro className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600">
                    {dict.fossilRequestForm?.budgetLabel || "Budget maximum"}
                  </Label>
                  <p className="text-sm font-bold text-emerald-600">
                    {request.maxBudget.toLocaleString(dict.lang || "fr-FR")} €
                  </p>
                </div>
              </div>
            )}
            {request.geologicalPeriod && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                <div className="p-2 bg-amber-200 rounded-lg">
                  <Layers className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600">
                    {dict.fossilRequestForm?.periodLabel ||
                      "Période géologique"}
                  </Label>
                  <p className="text-sm font-medium text-amber-700">
                    {request.geologicalPeriod}
                  </p>
                </div>
              </div>
            )}
            {request.category && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <div className="p-2 bg-blue-200 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600">
                    {dict.fossilRequestForm?.categoryLabel || "Catégorie"}
                  </Label>
                  <p className="text-sm font-medium text-blue-700">
                    {request.category}
                  </p>
                </div>
              </div>
            )}
            {request.countryOfOrigin && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl">
                <div className="p-2 bg-purple-200 rounded-lg">
                  <Globe className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600">
                    {dict.fossilRequestForm?.countryLabel || "Pays d'origine"}
                  </Label>
                  <p className="text-sm font-medium text-purple-700">
                    {request.countryOfOrigin}
                  </p>
                </div>
              </div>
            )}
            {request.locality && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl">
                <div className="p-2 bg-rose-200 rounded-lg">
                  <MapPin className="h-4 w-4 text-rose-600" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600">
                    {dict.fossilRequestForm?.localityLabel ||
                      "Localité spécifique"}
                  </Label>
                  <p className="text-sm font-medium text-rose-700">
                    {request.locality}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes admin - admin seulement */}
      {isAdmin && (
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
              <div className="p-2 bg-gradient-to-br from-orange-400 to-amber-600 rounded-xl shadow-lg">
                <StickyNote className="h-5 w-5 text-white" />
              </div>
              {dict.fossilRequests?.adminNotesTitle || "Notes administratives"}
            </CardTitle>
            <CardDescription>
              {dict.fossilRequests?.adminNotesDesc ||
                "Notes privées, visibles uniquement par les administrateurs"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {isEditing ? (
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={
                  dict.fossilRequests?.adminNotesPlaceholder ||
                  "Ajouter des notes privées..."
                }
                rows={4}
                className="border-slate-200 focus:border-orange-300 focus:ring-orange-300"
              />
            ) : (
              <div className="p-4 bg-orange-50 rounded-xl">
                <p className="text-slate-700 whitespace-pre-wrap">
                  {request.adminNotes ||
                    dict.fossilRequests?.noAdminNotes ||
                    "Aucune note administrative"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Message au client - admin seulement */}
      {isAdmin && (
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
              <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl shadow-lg">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              {dict.fossilRequests?.clientMsgTitle || "Message au client"}
            </CardTitle>
            <CardDescription>
              {dict.fossilRequests?.clientMsgDesc ||
                "Message qui sera envoyé au client concernant cette demande"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {isEditing ? (
              <Textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder={
                  dict.fossilRequests?.clientMsgPlaceholder ||
                  "Rédigez votre message au client..."
                }
                rows={4}
                className="border-slate-200 focus:border-green-300 focus:ring-green-300"
              />
            ) : (
              <div className="p-4 bg-green-50 rounded-xl">
                <p className="text-slate-700 whitespace-pre-wrap">
                  {request.responseMessage ||
                    dict.fossilRequests?.noClientMsg ||
                    "Aucun message envoyé au client"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Message admin vers utilisateur - utilisateur seulement */}
      {!isAdmin && request.responseMessage && (
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-xl hover:shadow-2xl transition-all duration-500 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 border-b border-blue-200">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-blue-800">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              {dict.fossilRequests?.adminMsgTitle ||
                "Message de l'équipe FossilShop"}
            </CardTitle>
            {request.respondedAt && (
              <CardDescription className="text-blue-700">
                {dict.fossilRequests?.receivedLabel || "Reçu le"}{" "}
                <span className="font-medium">
                  {new Date(request.respondedAt).toLocaleDateString(
                    dict.lang || "fr-FR"
                  )}
                </span>{" "}
                {dict.fossilRequests?.atLabel || "à"}{" "}
                <span className="font-medium">
                  {new Date(request.respondedAt).toLocaleTimeString(
                    dict.lang || "fr-FR",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </span>
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-6">
            <div className="p-4 bg-white rounded-xl border border-blue-200">
              <p className="text-blue-800 whitespace-pre-wrap leading-relaxed">
                {request.responseMessage}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informations sur la demande */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
            <div className="p-2 bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl shadow-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            {dict.fossilRequests?.infoSectionTitle ||
              "Informations sur la demande"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
              <div className="p-2 bg-slate-200 rounded-lg">
                <Calendar className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <Label className="text-sm font-semibold text-slate-700">
                  {dict.fossilRequests?.createdAtLabel || "Date de création"}
                </Label>
                <p className="text-slate-600 font-medium">
                  {new Date(request.createdAt).toLocaleDateString(
                    dict.lang || "fr-FR"
                  )}{" "}
                  {dict.fossilRequests?.atLabel || "à"}{" "}
                  {new Date(request.createdAt).toLocaleTimeString(
                    dict.lang || "fr-FR",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
              <div className="p-2 bg-slate-200 rounded-lg">
                <Clock className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <Label className="text-sm font-semibold text-slate-700">
                  {dict.fossilRequests?.updatedAtLabel ||
                    "Dernière modification"}
                </Label>
                <p className="text-slate-600 font-medium">
                  {new Date(request.updatedAt).toLocaleDateString(
                    dict.lang || "fr-FR"
                  )}{" "}
                  {dict.fossilRequests?.atLabel || "à"}{" "}
                  {new Date(request.updatedAt).toLocaleTimeString(
                    dict.lang || "fr-FR",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
