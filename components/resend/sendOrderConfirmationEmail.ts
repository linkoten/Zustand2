import { resend, EMAIL_CONFIG } from "@/lib/resend";
import { OrderConfirmationEmail } from "@/components/resend/orderConfirmationEmail"; // ✅ Correction du chemin
import { render } from "@react-email/render";

export interface OrderEmailData {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  orderTotal: string;
  orderItems: Array<{
    name: string;
    price: string;
    quantity: number;
  }>;
  shippingAddress: {
    name: string;
    line1: string;
    city: string;
    postal_code: string;
    country: string;
  };
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    console.log("📧 Envoi email de confirmation à:", data.customerEmail);

    // ✅ Await le render pour obtenir une string
    const emailHtml = await render(
      OrderConfirmationEmail({
        customerName: data.customerName,
        orderNumber: data.orderNumber,
        orderTotal: data.orderTotal,
        orderItems: data.orderItems,
        shippingAddress: data.shippingAddress,
      })
    );

    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: data.customerEmail,
      replyTo: EMAIL_CONFIG.replyTo,
      subject: `Confirmation de votre commande #${data.orderNumber}`,
      html: emailHtml,
    });

    console.log("✅ Email envoyé avec succès:", result.data?.id);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("❌ Erreur envoi email:", error);
    return { success: false, error };
  }
}

// Email de notification admin (optionnel)
export async function sendAdminNotificationEmail(data: OrderEmailData) {
  try {
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: "admin@votre-domaine.com",
      subject: `Nouvelle commande #${data.orderNumber}`,
      html: `
        <h2>Nouvelle commande reçue</h2>
        <p><strong>Client:</strong> ${data.customerName} (${data.customerEmail})</p>
        <p><strong>Commande:</strong> #${data.orderNumber}</p>
        <p><strong>Montant:</strong> ${data.orderTotal}</p>
        <p><strong>Articles:</strong> ${data.orderItems.length}</p>
        
        <h3>Adresse de livraison:</h3>
        <p>
          ${data.shippingAddress.name}<br>
          ${data.shippingAddress.line1}<br>
          ${data.shippingAddress.postal_code} ${data.shippingAddress.city}<br>
          ${data.shippingAddress.country}
        </p>
      `,
    });

    console.log("✅ Email admin envoyé");
  } catch (error) {
    console.error("❌ Erreur email admin:", error);
  }
}
