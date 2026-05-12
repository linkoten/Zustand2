import { resend, EMAIL_CONFIG } from "@/lib/resend";
import { NewsletterEmail } from "@/components/resend/newsletterEmail";
import { render } from "@react-email/render";

export interface NewsletterEmailData {
  to: string;
  name?: string;
  subject: string;
  content: string;
  unsubscribeEmail: string;
}

export async function sendNewsletterEmail(data: NewsletterEmailData) {
  const emailHtml = await render(
    NewsletterEmail({
      name: data.name,
      subject: data.subject,
      content: data.content,
      unsubscribeEmail: data.unsubscribeEmail,
    }),
  );

  const result = await resend.emails.send({
    from: EMAIL_CONFIG.from,
    to: data.to,
    subject: data.subject,
    html: emailHtml,
  });

  return result;
}
