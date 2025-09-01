"use client";

import { useState } from "react";
import {
  UserRole,
  RequestStatus,
  RequestPriority,
} from "@/lib/generated/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
}

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

export default function FossilRequestDetail({
  request,
}: FossilRequestDetailProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Déterminer si l'utilisateur est admin
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
        respondedBy: "Admin", // Ou récupérer le nom de l'admin connecté
      });

      if (result.success) {
        toast.success("Demande mise à jour avec succès");
        setIsEditing(false);
        router.refresh();
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Demande #{request.id.slice(-8)}
              </CardTitle>
              <CardDescription>
                Type de fossile recherché : {request.fossilType}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={statusColors[request.status]}>
                {statusLabels[request.status]}
              </Badge>
              <Badge className={priorityColors[request.priority]}>
                {priorityLabels[request.priority]}
              </Badge>
              {/* ✅ Bouton d'édition seulement pour les admins */}
              {isAdmin &&
                (isEditing ? (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={loading} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={loading}
                      size="sm"
                    >
                      Annuler
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                  >
                    Modifier
                  </Button>
                ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations du client */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations du client
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Nom</Label>
                <p className="text-sm text-muted-foreground">{request.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">{request.email}</p>
              </div>
            </div>
            {request.phone && (
              <div>
                <Label className="text-sm font-medium">Téléphone</Label>
                <p className="text-sm text-muted-foreground">{request.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statut et priorité - Modifiable pour admin seulement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Statut de la demande
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAdmin && isEditing ? (
              <>
                <div>
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    value={status}
                    onValueChange={(value: RequestStatus) => setStatus(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priorité</Label>
                  <Select
                    value={priority}
                    onValueChange={(value: RequestPriority) =>
                      setPriority(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorityLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label className="text-sm font-medium">Statut actuel</Label>
                  <div className="mt-1">
                    <Badge className={statusColors[request.status]}>
                      {statusLabels[request.status]}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priorité</Label>
                  <div className="mt-1">
                    <Badge className={priorityColors[request.priority]}>
                      {priorityLabels[request.priority]}
                    </Badge>
                  </div>
                </div>
              </>
            )}

            {request.respondedBy && request.respondedAt && (
              <div>
                <Label className="text-sm font-medium">
                  Dernière mise à jour
                </Label>
                <p className="text-sm text-muted-foreground">
                  Par {request.respondedBy} le{" "}
                  {new Date(request.respondedAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Détails de la demande */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Détails de la demande
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">
              Type de fossile recherché
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              {request.fossilType}
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium">Description détaillée</Label>
            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
              {request.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {request.maxBudget && (
              <div>
                <Label className="text-sm font-medium">Budget maximum</Label>
                <p className="text-sm text-muted-foreground">
                  {request.maxBudget.toLocaleString("fr-FR")} €
                </p>
              </div>
            )}
            {request.geologicalPeriod && (
              <div>
                <Label className="text-sm font-medium">
                  Période géologique
                </Label>
                <p className="text-sm text-muted-foreground">
                  {request.geologicalPeriod}
                </p>
              </div>
            )}
            {request.category && (
              <div>
                <Label className="text-sm font-medium">Catégorie</Label>
                <p className="text-sm text-muted-foreground">
                  {request.category}
                </p>
              </div>
            )}
            {request.countryOfOrigin && (
              <div>
                <Label className="text-sm font-medium">
                  Pays d`&apos;origine souhaité
                </Label>
                <p className="text-sm text-muted-foreground">
                  {request.countryOfOrigin}
                </p>
              </div>
            )}
            {request.locality && (
              <div>
                <Label className="text-sm font-medium">
                  Localité spécifique
                </Label>
                <p className="text-sm text-muted-foreground">
                  {request.locality}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ✅ Notes administratives - Seulement pour les admins */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5" />
              Notes administratives
            </CardTitle>
            <CardDescription>
              Notes privées, visibles uniquement par les administrateurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Ajouter des notes privées..."
                rows={4}
              />
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {request.adminNotes || "Aucune note administrative"}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ✅ Message au client - Seulement pour les admins */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Message au client
            </CardTitle>
            <CardDescription>
              Message qui sera envoyé au client concernant cette demande
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Rédigez votre message au client..."
                rows={4}
              />
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {request.responseMessage || "Aucun message envoyé au client"}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ✅ Message de l'administrateur - Seulement pour les utilisateurs */}
      {!isAdmin && request.responseMessage && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <MessageSquare className="h-5 w-5" />
              Message de l`&apos;équipe FossilShop
            </CardTitle>
            {request.respondedAt && (
              <CardDescription>
                Reçu le{" "}
                {new Date(request.respondedAt).toLocaleDateString("fr-FR")} à{" "}
                {new Date(request.respondedAt).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800 whitespace-pre-wrap">
              {request.responseMessage}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Informations sur la demande */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Informations sur la demande
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Date de création</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(request.createdAt).toLocaleDateString("fr-FR")} à{" "}
                {new Date(request.createdAt).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">
                Dernière modification
              </Label>
              <p className="text-sm text-muted-foreground">
                {new Date(request.updatedAt).toLocaleDateString("fr-FR")} à{" "}
                {new Date(request.updatedAt).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
