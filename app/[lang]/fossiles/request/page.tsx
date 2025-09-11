import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FossilRequestForm from "@/components/fossils/fossilRequestForm";
import { getDictionary } from "../../dictionaries";

export default async function FossilRequestPage({
  params,
}: {
  params: Promise<{ lang: "en" | "fr" }>;
}) {
  const { lang } = await params;

  const dict = await getDictionary(lang);
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${lang}/fossiles`} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {dict?.fossilRequest?.backToFossils || "Retour aux fossiles"}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {dict?.fossilRequest?.title || "Demande de recherche de fossile"}
          </CardTitle>
          <CardDescription>
            {dict?.fossilRequest?.description ||
              "Vous recherchez un fossile spécifique ? Décrivez-nous ce que vous cherchez et nous vous aiderons à le trouver dans notre réseau de partenaires."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FossilRequestForm dict={dict} />
        </CardContent>
      </Card>
    </div>
  );
}
