"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";

interface CheckoutButtonProps {
  productId: number;
  priceId: string;
  amount: number;
}
export default function CheckoutButton({
  productId,
  priceId,
  amount,
}: CheckoutButtonProps) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, priceId }),
      });

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Erreur checkout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <p>Connectez-vous pour acheter</p>;
  }

  return (
    <Button onClick={handleCheckout} disabled={isLoading} className="w-full">
      {isLoading ? "Redirection..." : `Acheter - ${amount}€`}
    </Button>
  );
}
