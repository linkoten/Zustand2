import { requireAdmin } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getFossilRequestById } from "@/lib/actions/fossilRequestsActions";
import FossilRequestDetail from "@/components/fossilRequests/fossilRequestDetail";
import { getDictionary } from "@/app/[lang]/dictionaries";

interface FossilRequestDetailPageProps {
  params: Promise<{ id: string; lang: "en" | "fr" }>;
}

export default async function FossilRequestDetailPage({
  params,
}: FossilRequestDetailPageProps) {
  await requireAdmin();

  const { id, lang } = await params;
  const request = await getFossilRequestById(id);

  const dict = await getDictionary(lang);

  if (!request) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${lang}/dashboard`} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour aux demandes
          </Link>
        </Button>
      </div>

      <FossilRequestDetail request={request} dict={dict} />
    </div>
  );
}
