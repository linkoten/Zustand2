import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ClerkEmailAddress, ClerkWebhookEvent } from "@/types/type";

export async function POST(req: NextRequest) {
  try {
    const evt = (await verifyWebhook(req)) as ClerkWebhookEvent;
    const eventType = evt.type;

    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name } = evt.data;
      await prisma.user.upsert({
        where: { clerkId: id },
        update: {},
        create: {
          clerkId: id,
          email: email_addresses[0].email_address,
          name: `${first_name} ${last_name}`,
        },
      });
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
    }

    if (eventType === "user.deleted") {
      const { id } = evt.data;

      await prisma.user.delete({
        where: { clerkId: id },
      });
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err: unknown) {
    return new Response("Error verifying webhook", { status: 400 });
  }
}
