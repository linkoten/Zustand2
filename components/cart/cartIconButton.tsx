import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";

export function CartIconButton({ onClick }: { onClick: () => void }) {
  const totalItems = useCartStore((state) => state.totalItems);

  return (
    <button onClick={onClick} className="relative">
      <ShoppingCart className="w-6 h-6" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center border border-white">
          {totalItems}
        </span>
      )}
    </button>
  );
}
