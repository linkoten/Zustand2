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

export default function FossilRequestPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/fossiles" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour aux fossiles
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Demande de recherche de fossile
          </CardTitle>
          <CardDescription>
            Vous recherchez un fossile spécifique ? Décrivez-nous ce que vous
            cherchez et nous vous aiderons à le trouver dans notre réseau de
            partenaires.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FossilRequestForm />
        </CardContent>
      </Card>
    </div>
  );
}
