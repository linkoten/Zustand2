import { getUserOrders } from "@/lib/actions/dashboardActions";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();
  if (!userId) return <div>Non connecté</div>;

  const orders = await getUserOrders(userId);
  const order = orders.find((o) => o.id === params.id);

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
        <div className="mt-4 grid gap-4">
          {order.items.map((item) => {
            const imageUrl =
              item.product?.images && item.product.images.length > 0
                ? item.product.images[0].imageUrl
                : "/placeholder.svg";
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 border rounded-lg p-3 bg-muted"
              >
                <img
                  src={imageUrl}
                  alt={item.product?.title || "Produit"}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="font-semibold">
                    {item.product?.title || "Produit"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Quantité : {item.quantity}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Prix unitaire :{" "}
                    {item.price && typeof item.price.toNumber === "function"
                      ? item.price.toNumber().toLocaleString("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        })
                      : item.price?.toString()}
                  </div>
                  <div className="text-sm">
                    Total ligne :{" "}
                    {typeof item.price === "number"
                      ? (item.price * item.quantity).toLocaleString("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        })
                      : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Button asChild variant="outline">
        <Link href="/dashboard/orders">Retour à mes commandes</Link>
      </Button>
    </div>
  );
}
