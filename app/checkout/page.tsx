import { redirect } from "next/navigation";
import { getCartAction } from "@/lib/actions/cart-actions";
import CheckoutComponent from "@/components/checkout/checkout";

export default async function CheckoutPage() {
  const cart = await getCartAction();

  // Rediriger si le panier est vide
  if (!cart || !cart.items.length) {
    redirect("/fossiles");
  }

  return <CheckoutComponent />;
}
