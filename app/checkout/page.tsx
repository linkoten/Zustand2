import { redirect } from "next/navigation";
import { getCartAction } from "@/lib/actions/cart-actions";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OrderSummary } from "@/components/checkout/orderSummary";

export default async function CheckoutPage() {
  const cart = await getCartAction();

  // Rediriger si le panier est vide
  if (!cart || !cart.items.length) {
    redirect("/fossiles");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Finaliser votre commande</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire de checkout */}
          <div className="lg:col-span-2">
            <CheckoutForm cart={cart} />
          </div>

          {/* Résumé de commande */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <OrderSummary cart={cart} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
