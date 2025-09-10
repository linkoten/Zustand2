import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getFossilRequests } from "@/lib/actions/fossilRequestsActions";
import { getUserData } from "@/lib/actions/dashboardActions";
import {
  UserRole,
  RequestStatus,
  RequestPriority,
} from "@/lib/generated/prisma";
import FossilRequestsList from "@/components/fossilRequests/fossilRequestsList";
import { Button } from "@/components/ui/button";
import { FileText, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function UserFossilRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    status?: string;
    priority?: string;
    search?: string;
  }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserData(userId);

  if (!user) {
    redirect("/sign-in");
  }

  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1");
  const status = resolvedSearchParams.status;
  const priority = resolvedSearchParams.priority;
  const search = resolvedSearchParams.search;

  // ✅ Force le filtrage par utilisateur (userOnly: true)
  const requestsData = await getFossilRequests(page, {
    status: status as RequestStatus,
    priority: priority as RequestPriority,
    search,
    userOnly: true, // Force l'affichage uniquement des demandes de l'utilisateur
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour au dashboard
            </Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              Mes demandes de fossiles
            </h1>
            <p className="text-muted-foreground">
              Suivez l&apos;état de vos demandes de recherche de fossiles
            </p>
          </div>

          <div className="flex gap-2">
            <Button asChild>
              <Link href="/fossiles/request">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle demande
              </Link>
            </Button>
          </div>
        </div>

        {/* Statistiques rapides - Version utilisateur */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              {requestsData.totalRequests}
            </div>
            <div className="text-sm text-blue-600/80">Mes demandes</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {
                requestsData.requests.filter((r) => r.status === "PENDING")
                  .length
              }
            </div>
            <div className="text-sm text-yellow-600/80">En attente</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              {
                requestsData.requests.filter((r) => r.status === "IN_PROGRESS")
                  .length
              }
            </div>
            <div className="text-sm text-blue-600/80">En cours</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {
                requestsData.requests.filter((r) => r.status === "COMPLETED")
                  .length
              }
            </div>
            <div className="text-sm text-green-600/80">Terminées</div>
          </div>
        </div>

        {/* Message d'aide pour les utilisateurs */}
        {requestsData.totalRequests === 0 && (
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Vous n&apos;avez pas encore de demandes
                </h3>
                <p className="text-blue-700 mb-4">
                  Vous cherchez un fossile spécifique ? Notre équipe
                  d&apos;experts peut vous aider à le trouver ! Décrivez ce que
                  vous recherchez et nous ferons de notre mieux pour vous aider.
                </p>
                <Button asChild>
                  <Link href="/fossiles/request">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer ma première demande
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Liste des demandes */}
      <FossilRequestsList {...requestsData} />
    </div>
  );
}
