import { getUserOrders } from "@/lib/actions/dashboardActions";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/app/[lang]/dictionaries";

interface OrderDetailPageProps {
  params: Promise<{ id: string; lang: "en" | "fr" }>;
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { userId } = await auth();
  if (!userId) return <div>Non connecté</div>;

  const orders = await getUserOrders(userId);

  const { id, lang } = await params;

  const dict = await getDictionary(lang);

  const order = orders.find((o) => o.id === id);

  if (!order) return notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {dict.dashboard?.orderDetailTitle || "Détail de la commande"} #
        {order.id.slice(-8).toUpperCase()}
      </h1>
      <div className="mb-4 text-muted-foreground">
        {dict.dashboard?.orderPlacedOn || "Passée le"}{" "}
        {new Date(order.createdAt).toLocaleDateString(
          lang === "en" ? "en-GB" : "fr-FR"
        )}
      </div>
      <div className="mb-4">
        <span className="font-semibold">
          {dict.dashboard?.orderTotal || "Total"} :
        </span>{" "}
        {order.total && typeof order.total.toNumber === "function"
          ? order.total
              .toNumber()
              .toLocaleString(lang === "en" ? "en-GB" : "fr-FR", {
                style: "currency",
                currency: "EUR",
              })
          : order.total?.toString()}
      </div>

      <div className="mb-6">
        <span className="font-semibold">
          {dict.dashboard?.orderProducts || "Produits"} :
        </span>
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
                  alt={
                    item.product?.title ||
                    dict.dashboard?.orderProduct ||
                    "Produit"
                  }
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="font-semibold">
                    {item.product?.title ||
                      dict.dashboard?.orderProduct ||
                      "Produit"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {dict.dashboard?.orderQuantity || "Quantité"} :{" "}
                    {item.quantity}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {dict.dashboard?.orderUnitPrice || "Prix unitaire"} :{" "}
                    {item.price && typeof item.price.toNumber === "function"
                      ? item.price
                          .toNumber()
                          .toLocaleString(lang === "en" ? "en-GB" : "fr-FR", {
                            style: "currency",
                            currency: "EUR",
                          })
                      : item.price?.toString()}
                  </div>
                  <div className="text-sm">
                    {dict.dashboard?.orderLineTotal || "Total ligne"} :{" "}
                    {typeof item.price === "number"
                      ? (item.price * item.quantity).toLocaleString(
                          lang === "en" ? "en-GB" : "fr-FR",
                          {
                            style: "currency",
                            currency: "EUR",
                          }
                        )
                      : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Button asChild variant="outline">
        <Link href={`/${lang}/dashboard/orders`}>
          {dict.dashboard?.orderBackToOrders || "Retour à mes commandes"}
        </Link>
      </Button>
    </div>
  );
}
