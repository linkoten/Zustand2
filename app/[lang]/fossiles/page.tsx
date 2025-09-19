import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import FossilesClient from "@/components/fossils/fossilesClient";
import { getFilterOptions, getFossils } from "@/lib/actions/productActions";
import { SearchParams } from "@/types/productType";
import { getUserData } from "@/lib/actions/dashboardActions";
import UserProvider from "@/components/provider/userProvider";
import { redirect } from "next/navigation";
import { getDictionary } from "../dictionaries";

export default async function FossilesPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: "en" | "fr" }>;
  searchParams: Promise<SearchParams & { page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const { lang } = await params;

  const dict = await getDictionary(lang);

  // ✅ Récupérer userId AVANT l'appel à getFossils
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  const user = await getUserData(userId!);
  if (!user) {
    redirect("/sign-in");
  }

  // Pagination
  const currentPage = parseInt(resolvedSearchParams.page || "1", 10);
  const limit = 20;

  // ✅ Passer userId à getFossils pour inclure les infos favoris avec pagination
  const fossilsData = await getFossils(
    resolvedSearchParams,
    userId,
    currentPage,
    limit
  );
  const filterOptionsRaw = await getFilterOptions();
  const filterOptions = {
    ...filterOptionsRaw,
    localities: filterOptionsRaw.localities.map((loc) => loc.name),
  };

  return (
    <UserProvider user={user}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-stone-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header moderne */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-end gap-6 mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="border-amber-200 hover:bg-amber-50 hover:border-amber-300"
                >
                  <Link href={`/${lang}/fossiles/request`}>
                    <Search className="mr-2 h-4 w-4" />
                    {dict.fossilRequest.title}
                  </Link>
                </Button>

                {user && user.role === "ADMIN" && (
                  <Button asChild className="bg-amber-600 hover:bg-amber-700">
                    <Link href={`/${lang}/fossiles/create`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Créer un produit
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserProvider>
  );
}
