import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_CONFIG = {
  from: process.env.RESEND_FROM_EMAIL || "noreply@exemple.com",
  replyTo: "support@votre-domaine.com",
} as const;
