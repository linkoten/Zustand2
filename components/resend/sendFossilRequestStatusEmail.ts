import { resend, EMAIL_CONFIG } from "@/lib/resend";
import { FossilRequestStatusEmail } from "@/components/resend/fossilRequestStatusEmail";
import { render } from "@react-email/render";
import { RequestStatus } from "@/lib/generated/prisma";

export interface FossilRequestStatusEmailData {
  customerEmail: string;
  customerName: string;
  fossilType: string;
  newStatus: RequestStatus;
  responseMessage?: string | null;
  requestId: string;
  lang?: string;
}

export async function sendFossilRequestStatusEmail(
  data: FossilRequestStatusEmailData,
) {
  try {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://paleolitho.com"}/${data.lang ?? "fr"}/dashboard`;

    const emailHtml = await render(
      FossilRequestStatusEmail({
        customerName: data.customerName,
        fossilType: data.fossilType,
        newStatus: data.newStatus,
        responseMessage: data.responseMessage,
        requestId: data.requestId,
        dashboardUrl,
      }),
    );

    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: data.customerEmail,
      replyTo: EMAIL_CONFIG.replyTo,
      subject: `Mise à jour de votre demande de fossile — Paleolitho`,
      html: emailHtml,
    });

    console.log("✅ Email statut fossile envoyé:", result.data?.id);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("❌ Erreur envoi email statut fossile:", error);
    return { success: false, error };
  }
}
