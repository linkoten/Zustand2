import { requireAdmin } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import Link from "next/link";
import { RequestPriority, RequestStatus } from "@/lib/generated/prisma";
import { getFossilRequests } from "@/lib/actions/fossilRequestsActions";
import FossilRequestsList from "@/components/fossilRequests/fossilRequestsList";
import { getDictionary } from "@/app/[lang]/dictionaries";

export default async function FossilRequestsPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{
    page?: string;
    status?: string;
    priority?: string;
    search?: string;
  }>;
  params: Promise<{ lang: "en" | "fr" }>;
}) {
  // Vérifier les permissions admin
  await requireAdmin();

  const { lang } = await params;

  const dict = await getDictionary(lang);

  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1");
  const status = resolvedSearchParams.status;
  const priority = resolvedSearchParams.priority;
  const search = resolvedSearchParams.search;

  const requestsData = await getFossilRequests(page, {
    status: status as RequestStatus,
    priority: priority as RequestPriority,
    search,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              Demandes de Fossiles
            </h1>
            <p className="text-muted-foreground">
              Gérez les demandes de recherche de fossiles des clients
            </p>
          </div>

          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/${lang}/dashboard`}>Retour au dashboard</Link>
            </Button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              {requestsData.totalRequests}
            </div>
            <div className="text-sm text-blue-600/80">Total demandes</div>
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
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {
                requestsData.requests.filter((r) => r.status === "IN_PROGRESS")
                  .length
              }
            </div>
            <div className="text-sm text-green-600/80">En cours</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              {
                requestsData.requests.filter((r) => r.priority === "HIGH")
                  .length
              }
            </div>
            <div className="text-sm text-purple-600/80">Priorité haute</div>
          </div>
        </div>
      </div>

      {/* Liste des demandes */}
      <FossilRequestsList {...requestsData} dict={dict} lang={lang} />
    </div>
  );
}
