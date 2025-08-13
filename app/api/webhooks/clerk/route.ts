import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

// Types pour les données Clerk
interface ClerkEmailAddress {
  id: string;
  email_address: string;
  verification?: {
    status: string;
    strategy: string;
  };
}

interface ClerkUserData {
  id: string;
  email_addresses: ClerkEmailAddress[];
  first_name?: string;
  last_name?: string;
  primary_email_address_id?: string;
}

interface ClerkWebhookEvent {
  type: string;
  data: ClerkUserData;
}

export async function POST(req: NextRequest) {
  try {
    const evt = (await verifyWebhook(req)) as ClerkWebhookEvent;
    const { id } = evt.data;
    const eventType = evt.type;

    console.log(
      `Received webhook with ID ${id} and event type of ${eventType}`
    );
    console.log("Event data:", JSON.stringify(evt.data, null, 2)); // Debug

    if (eventType === "user.created") {
      const {
        id,
        email_addresses,
        first_name,
        last_name,
        primary_email_address_id,
      } = evt.data;

      // Debug des données reçues
      console.log("Email addresses:", email_addresses);
      console.log("Primary email ID:", primary_email_address_id);

      // Trouver l'email principal
      let primaryEmail = "";

      if (email_addresses && email_addresses.length > 0) {
        // Chercher l'email principal par ID
        const primaryEmailObj = email_addresses.find(
          (email: ClerkEmailAddress) => email.id === primary_email_address_id
        );

        // Si trouvé, utiliser cet email, sinon prendre le premier
        primaryEmail = primaryEmailObj
          ? primaryEmailObj.email_address
          : email_addresses[0].email_address;
      }

      // Vérifier que nous avons un email
      if (!primaryEmail) {
        console.error("No email found for user", id);
        return new Response("No email found", { status: 400 });
      }

      // Construire le nom complet
      const fullName = `${first_name || ""} ${last_name || ""}`.trim() || null;

      console.log("Creating user with:", {
        id,
        email: primaryEmail,
        name: fullName,
      });

      // Créer ou mettre à jour l'utilisateur
      await prisma.user.upsert({
        where: { clerkId: id },
        update: {
          email: primaryEmail,
          name: fullName,
        },
        create: {
          clerkId: id,
          email: primaryEmail,
          name: fullName,
          role: "USER", // Ajout du rôle par défaut
        },
      });

      console.log(`✅ User ${id} created/updated successfully`);
    }

    if (eventType === "user.updated") {
      const {
        id,
        email_addresses,
        first_name,
        last_name,
        primary_email_address_id,
      } = evt.data;

      let primaryEmail = "";

      if (email_addresses && email_addresses.length > 0) {
        const primaryEmailObj = email_addresses.find(
          (email: ClerkEmailAddress) => email.id === primary_email_address_id
        );
        primaryEmail = primaryEmailObj
          ? primaryEmailObj.email_address
          : email_addresses[0].email_address;
      }

      if (!primaryEmail) {
        console.error("No email found for user update", id);
        return new Response("No email found", { status: 400 });
      }

      const fullName = `${first_name || ""} ${last_name || ""}`.trim() || null;

      await prisma.user.update({
        where: { clerkId: id },
        data: {
          email: primaryEmail,
          name: fullName,
        },
      });

      console.log(`✅ User ${id} updated successfully`);
    }

    if (eventType === "user.deleted") {
      const { id } = evt.data;

      await prisma.user.delete({
        where: { clerkId: id },
      });

      console.log(`✅ User ${id} deleted successfully`);
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error verifying webhook:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
