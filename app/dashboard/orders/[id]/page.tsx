import { getUserOrders } from "@/lib/actions/dashboardActions";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { userId } = await auth();
  if (!userId) return <div>Non connecté</div>;

  const { id } = await params;
  const orders = await getUserOrders(userId);
  const order = orders.find((o) => o.id === id);

  if (!order) return notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Détail de la commande #{order.id.slice(-8).toUpperCase()}
      </h1>
      <div className="mb-4 text-muted-foreground">
        Passée le {new Date(order.createdAt).toLocaleDateString("fr-FR")}
      </div>
      <div className="mb-4">
        <span className="font-semibold">Total :</span>{" "}
        {order.total && typeof order.total.toNumber === "function"
          ? order.total.toNumber().toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
            })
          : order.total?.toString()}
      </div>
      <div className="mb-6">
        <span className="font-semibold">Produits :</span>
        <ul className="list-disc ml-6 mt-2">
          {order.items.map((item) => (
            <li key={item.id}>
              {item.product?.title || "Produit"} &times; {item.quantity} —{" "}
              {item.price && typeof item.price.toNumber === "function"
                ? item.price.toNumber().toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })
                : item.price?.toString()}
            </li>
          ))}
        </ul>
      </div>
      <Button asChild variant="outline">
        <Link href="/dashboard/orders">Retour à mes commandes</Link>
      </Button>
    </div>
  );
}
