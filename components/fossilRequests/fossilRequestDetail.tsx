"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
import { toast } from "sonner";
import {
  Save,
  Trash2,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
} from "lucide-react";
import { FossilRequest } from "@/types/fossilRequestType";
import {
  deleteFossilRequest,
  updateFossilRequest,
} from "@/lib/actions/fossilRequestsActions";
import { RequestPriority, RequestStatus } from "@/lib/generated/prisma";

const statusLabels = {
  PENDING: "En attente",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
  REJECTED: "Rejeté",
};
const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REJECTED: "bg-red-100 text-red-800",
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

interface FossilRequestDetailProps {
  request: FossilRequest;
}

export default function FossilRequestDetail({
  request,
}: FossilRequestDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    status: request.status,
    priority: request.priority,
    adminNotes: request.adminNotes || "",
    responseMessage: request.responseMessage || "",
  });

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const result = await updateFossilRequest(request.id, formData);

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
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteFossilRequest(request.id);

      if (result.success) {
        toast.success("Demande supprimée avec succès");
        router.push("/admin/fossil-requests");
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                Demande de {request.name}
              </CardTitle>
              <CardDescription>
                Créée le{" "}
                {new Date(request.createdAt).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={statusColors[request.status]}>
                {statusLabels[request.status]}
              </Badge>
              <Badge className={priorityColors[request.priority]}>
                {priorityLabels[request.priority]}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
            >
              {isEditing ? "Annuler" : "Modifier"}
            </Button>

            {isEditing && (
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Confirmer la suppression
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer cette demande ? Cette
                    action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations client */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Informations client
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Nom
                </Label>
                <p className="font-medium">{request.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Email
                </Label>
                <p className="font-medium">{request.email}</p>
              </div>
            </div>

            {request.phone && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Téléphone
                </Label>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {request.phone}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gestion admin */}
        <Card>
          <CardHeader>
            <CardTitle>Gestion administrative</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Statut</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: value as RequestStatus,
                        }))
                      }
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
                      value={formData.priority}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          priority: value as RequestPriority,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(priorityLabels).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Statut
                  </Label>
                  <div className="mt-1">
                    <Badge className={statusColors[request.status]}>
                      {statusLabels[request.status]}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Priorité
                  </Label>
                  <div className="mt-1">
                    <Badge className={priorityColors[request.priority]}>
                      {priorityLabels[request.priority]}
                    </Badge>
                  </div>
                </div>
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
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Type de fossile
              </Label>
              <p className="font-medium">{request.fossilType}</p>
            </div>

            {request.category && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Catégorie
                </Label>
                <p className="font-medium">{request.category}</p>
              </div>
            )}

            {request.geologicalPeriod && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Période géologique
                </Label>
                <p className="font-medium">{request.geologicalPeriod}</p>
              </div>
            )}

            {request.countryOfOrigin && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Pays d&apos;origine
                </Label>
                <p className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {request.countryOfOrigin}
                </p>
              </div>
            )}

            {request.locality && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Localité
                </Label>
                <p className="font-medium">{request.locality}</p>
              </div>
            )}

            {request.maxBudget && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Budget maximum
                </Label>
                <p className="font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {request.maxBudget.toLocaleString("fr-FR")} €
                </p>
              </div>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              Description
            </Label>
            <div className="mt-2 p-4 bg-muted rounded-lg">
              <p className="whitespace-pre-wrap">{request.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes et messages admin */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Notes administratives</CardTitle>
            <CardDescription>
              Notes internes (non visibles par le client)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                placeholder="Ajoutez vos notes internes..."
                value={formData.adminNotes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    adminNotes: e.target.value,
                  }))
                }
                rows={6}
              />
            ) : (
              <div className="min-h-[100px] p-4 bg-muted rounded-lg">
                {request.adminNotes ? (
                  <p className="whitespace-pre-wrap">{request.adminNotes}</p>
                ) : (
                  <p className="text-muted-foreground italic">
                    Aucune note administrative
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Message au client</CardTitle>
            <CardDescription>Message qui sera envoyé au client</CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                placeholder="Rédigez un message pour le client..."
                value={formData.responseMessage}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    responseMessage: e.target.value,
                  }))
                }
                rows={6}
              />
            ) : (
              <div className="min-h-[100px] p-4 bg-muted rounded-lg">
                {request.responseMessage ? (
                  <p className="whitespace-pre-wrap">
                    {request.responseMessage}
                  </p>
                ) : (
                  <p className="text-muted-foreground italic">
                    Aucun message client
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Historique */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historique
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium">Demande créée</span>
              <span className="text-muted-foreground">
                {new Date(request.createdAt).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {request.updatedAt !== request.createdAt && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">Dernière modification</span>
                <span className="text-muted-foreground">
                  {new Date(request.updatedAt).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
