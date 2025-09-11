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
  dict,
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
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {`${dict.fossilRequests?.requestTitle || "Request"} #${request.id.slice(-8)}`}
              </CardTitle>
              <CardDescription>
                {dict.fossilRequests?.fossilTypeLabel || "Fossil type"}:{" "}
                {request.fossilType}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={statusColors[request.status]}>
                {dict.fossilRequests?.[`status_${request.status}`] ||
                  statusLabels[request.status]}
              </Badge>
              <Badge className={priorityColors[request.priority]}>
                {dict.fossilRequests?.[`priority_${request.priority}`] ||
                  priorityLabels[request.priority]}
              </Badge>
              {/* Edit button for admins only */}
              {isAdmin &&
                (isEditing ? (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={loading} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      {dict.fossilRequests?.saveButton || "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={loading}
                      size="sm"
                    >
                      {dict.fossilRequests?.cancelButton || "Cancel"}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                  >
                    {dict.fossilRequests?.editButton || "Edit"}
                  </Button>
                ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {dict.fossilRequests?.clientInfoTitle || "Client information"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">
                  {dict.fossilRequestForm?.fullNameLabel || "Full name"}
                </Label>
                <p className="text-sm text-muted-foreground">{request.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">{request.email}</p>
              </div>
            </div>
            {request.phone && (
              <div>
                <Label className="text-sm font-medium">
                  {dict.fossilRequestForm?.phoneLabel || "Phone"}
                </Label>
                <p className="text-sm text-muted-foreground">{request.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status and priority - editable for admin only */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {dict.fossilRequests?.statusSectionTitle || "Request status"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAdmin && isEditing ? (
              <>
                <div>
                  <Label htmlFor="status">
                    {dict.fossilRequests?.statusLabel || "Status"}
                  </Label>
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
                          {dict.fossilRequests?.[`status_${value}`] || label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">
                    {dict.fossilRequests?.priorityLabel || "Priority"}
                  </Label>
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
                          {dict.fossilRequests?.[`priority_${value}`] || label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label className="text-sm font-medium">
                    {dict.fossilRequests?.currentStatusLabel ||
                      "Current status"}
                  </Label>
                  <div className="mt-1">
                    <Badge className={statusColors[request.status]}>
                      {dict.fossilRequests?.[`status_${request.status}`] ||
                        statusLabels[request.status]}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    {dict.fossilRequests?.priorityLabel || "Priority"}
                  </Label>
                  <div className="mt-1">
                    <Badge className={priorityColors[request.priority]}>
                      {dict.fossilRequests?.[`priority_${request.priority}`] ||
                        priorityLabels[request.priority]}
                    </Badge>
                  </div>
                </div>
              </>
            )}

            {request.respondedBy && request.respondedAt && (
              <div>
                <Label className="text-sm font-medium">
                  {dict.fossilRequests?.lastUpdateLabel || "Last update"}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {dict.fossilRequests?.byLabel || "By"} {request.respondedBy}{" "}
                  {dict.fossilRequests?.onLabel || "on"}{" "}
                  {new Date(request.respondedAt).toLocaleDateString(
                    dict.lang || "fr-FR"
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Request details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {dict.fossilRequests?.detailsSectionTitle || "Request details"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">
              {dict.fossilRequests?.fossilTypeLabel || "Fossil type"}
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              {request.fossilType}
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium">
              {dict.fossilRequestForm?.descLabel || "Detailed description"}
            </Label>
            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
              {request.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {request.maxBudget && (
              <div>
                <Label className="text-sm font-medium">
                  {dict.fossilRequestForm?.budgetLabel || "Maximum budget"}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {request.maxBudget.toLocaleString(dict.lang || "fr-FR")} €
                </p>
              </div>
            )}
            {request.geologicalPeriod && (
              <div>
                <Label className="text-sm font-medium">
                  {dict.fossilRequestForm?.periodLabel || "Geological period"}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {request.geologicalPeriod}
                </p>
              </div>
            )}
            {request.category && (
              <div>
                <Label className="text-sm font-medium">
                  {dict.fossilRequestForm?.categoryLabel || "Category"}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {request.category}
                </p>
              </div>
            )}
            {request.countryOfOrigin && (
              <div>
                <Label className="text-sm font-medium">
                  {dict.fossilRequestForm?.countryLabel || "Country of origin"}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {request.countryOfOrigin}
                </p>
              </div>
            )}
            {request.locality && (
              <div>
                <Label className="text-sm font-medium">
                  {dict.fossilRequestForm?.localityLabel || "Specific locality"}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {request.locality}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Admin notes - admin only */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5" />
              {dict.fossilRequests?.adminNotesTitle || "Admin notes"}
            </CardTitle>
            <CardDescription>
              {dict.fossilRequests?.adminNotesDesc ||
                "Private notes, visible only to administrators"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={
                  dict.fossilRequests?.adminNotesPlaceholder ||
                  "Add private notes..."
                }
                rows={4}
              />
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {request.adminNotes ||
                  dict.fossilRequests?.noAdminNotes ||
                  "No admin notes"}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Message to client - admin only */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {dict.fossilRequests?.clientMsgTitle || "Message to client"}
            </CardTitle>
            <CardDescription>
              {dict.fossilRequests?.clientMsgDesc ||
                "Message that will be sent to the client regarding this request"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder={
                  dict.fossilRequests?.clientMsgPlaceholder ||
                  "Write your message to the client..."
                }
                rows={4}
              />
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {request.responseMessage ||
                  dict.fossilRequests?.noClientMsg ||
                  "No message sent to client"}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Admin message to user - user only */}
      {!isAdmin && request.responseMessage && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <MessageSquare className="h-5 w-5" />
              {dict.fossilRequests?.adminMsgTitle ||
                "Message from the FossilShop team"}
            </CardTitle>
            {request.respondedAt && (
              <CardDescription>
                {dict.fossilRequests?.receivedLabel || "Received on"}{" "}
                {new Date(request.respondedAt).toLocaleDateString(
                  dict.lang || "fr-FR"
                )}{" "}
                {dict.fossilRequests?.atLabel || "at"}{" "}
                {new Date(request.respondedAt).toLocaleTimeString(
                  dict.lang || "fr-FR",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
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

      {/* Request info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {dict.fossilRequests?.infoSectionTitle || "Request information"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">
                {dict.fossilRequests?.createdAtLabel || "Created at"}
              </Label>
              <p className="text-sm text-muted-foreground">
                {new Date(request.createdAt).toLocaleDateString(
                  dict.lang || "fr-FR"
                )}{" "}
                {dict.fossilRequests?.atLabel || "at"}{" "}
                {new Date(request.createdAt).toLocaleTimeString(
                  dict.lang || "fr-FR",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">
                {dict.fossilRequests?.updatedAtLabel || "Last modified"}
              </Label>
              <p className="text-sm text-muted-foreground">
                {new Date(request.updatedAt).toLocaleDateString(
                  dict.lang || "fr-FR"
                )}{" "}
                {dict.fossilRequests?.atLabel || "at"}{" "}
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
        </CardContent>
      </Card>
    </div>
  );
}
