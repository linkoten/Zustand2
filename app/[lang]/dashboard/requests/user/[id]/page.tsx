import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserData } from "@/lib/actions/dashboardActions";
import { getFossilRequestById } from "@/lib/actions/fossilRequestsActions";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import FossilRequestDetail from "@/components/fossilRequests/fossilRequestDetail";
import { getDictionary } from "@/app/[lang]/dictionaries";

interface UserFossilRequestDetailPageProps {
  params: Promise<{ id: string; lang: "en" | "fr" }>;
}

export default async function UserFossilRequestDetailPage({
  params,
}: UserFossilRequestDetailPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserData(userId);

  if (!user) {
    redirect("/sign-in");
  }

  const { id, lang } = await params;
  const request = await getFossilRequestById(id);

  const dict = await getDictionary(lang);

  if (!request) {
    notFound();
  }

  // ✅ Pour les utilisateurs normaux, vérifier qu'ils sont propriétaires
  // La fonction getFossilRequestById fait déjà cette vérification
  // Si l'utilisateur n'est pas propriétaire, elle retourne null

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link
            href={`/${lang}/dashboard/requests/user`}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {dict.dashboardRequests.backToDashboard || "Back to dashboard"}
          </Link>
        </Button>
      </div>

      {/* ✅ Passer seulement la request, sans user */}
      <FossilRequestDetail request={request} dict={dict} />
    </div>
  );
}
