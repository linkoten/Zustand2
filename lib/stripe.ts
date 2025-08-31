import Stripe from "stripe";

// ✅ VÉRIFICATION DE LA CLÉ API
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    "STRIPE_SECRET_KEY is missing. Please add it to your environment variables."
  );
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil",
  typescript: true,
});
