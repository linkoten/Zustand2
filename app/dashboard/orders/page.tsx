import { Button } from "@/components/ui/button";
import { getUserOrders } from "@/lib/actions/dashboardActions";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function OrdersPage() {
  const { userId } = await auth();
  if (!userId) return <div>Non connecté</div>;

  const orders = await getUserOrders(userId);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mes commandes</h1>
      {orders.length === 0 ? (
        <p>Vous n&apos;avez pas encore passé de commande.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-4 border rounded-lg flex justify-between items-center"
            >
              <div>
                <div className="font-semibold">
                  Commande #{order.id.slice(-8).toUpperCase()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Passée le{" "}
                  {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                </div>
                <div className="text-sm">
                  Total :{" "}
                  {order.total && typeof order.total.toNumber === "function"
                    ? order.total.toNumber().toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      })
                    : order.total?.toString()}
                </div>
              </div>
              <Button asChild>
                <Link href={`/dashboard/orders/${order.id}`}>
                  Voir le détail
                </Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
