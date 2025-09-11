import { Button } from "@/components/ui/button";
import { getUserOrders } from "@/lib/actions/dashboardActions";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { getDictionary } from "../../dictionaries";

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ lang: "en" | "fr" }>;
}) {
  const { userId } = await auth();
  if (!userId) return <div>Non connecté</div>;

  const orders = await getUserOrders(userId);

  const { lang } = await params;

  const dict = await getDictionary(lang);
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {dict.dashboard?.ordersTitle || "Mes commandes"}
      </h1>
      {orders.length === 0 ? (
        <p>
          {dict.dashboard?.ordersEmpty ||
            "Vous n'avez pas encore passé de commande."}
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-4 border rounded-lg flex justify-between items-center"
            >
              <div>
                <div className="font-semibold">
                  {dict.dashboard?.orderLabel || "Commande"} #
                  {order.id.slice(-8).toUpperCase()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {dict.dashboard?.orderPlacedOn || "Passée le"}{" "}
                  {new Date(order.createdAt).toLocaleDateString(
                    lang === "en" ? "en-GB" : "fr-FR"
                  )}
                </div>
                <div className="text-sm">
                  {dict.dashboard?.orderTotal || "Total"} :{" "}
                  {order.total && typeof order.total.toNumber === "function"
                    ? order.total
                        .toNumber()
                        .toLocaleString(lang === "en" ? "en-GB" : "fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        })
                    : order.total?.toString()}
                </div>
              </div>
              <Button asChild>
                <Link href={`/${lang}/dashboard/orders/${order.id}`}>
                  {dict.dashboard?.orderDetailsButton || "Voir le détail"}
                </Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
