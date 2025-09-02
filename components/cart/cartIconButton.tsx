import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { getCartAction } from "@/lib/actions/cart-actions";

export function CartIconButton({ onClick }: { onClick: () => void }) {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Charger le panier au montage
    getCartAction().then((cart) => {
      setCartCount(cart?.items?.length || 0);
    });
    // Tu peux ajouter un event ou un store pour réagir aux ajouts/suppressions
  }, []);

  return (
    <button onClick={onClick} className="relative">
      <ShoppingCart className="w-6 h-6" />
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border border-white">
          {cartCount}
        </span>
      )}
    </button>
  );
}
