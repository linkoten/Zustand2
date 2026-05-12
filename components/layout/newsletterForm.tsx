"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { subscribeToNewsletter } from "@/lib/actions/newsletterActions";

interface NewsletterFormProps {
  lang?: string;
}

export function NewsletterForm({ lang = "fr" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");

    const result = await subscribeToNewsletter(email, name || undefined, lang);
    if (result.success) {
      setStatus("success");
      setMessage(result.message);
      setEmail("");
      setName("");
    } else {
      setStatus("error");
      setMessage(result.message);
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-3 text-emerald-400">
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-sm">
      <div className="flex items-center gap-2 mb-1">
        <Mail className="w-4 h-4 text-[var(--terracotta)]" />
        <span className="text-sm font-semibold text-[var(--parchemin)]">
          Restez informé des nouvelles découvertes
        </span>
      </div>

      <Input
        type="text"
        placeholder="Votre prénom (optionnel)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="bg-white/5 border-[var(--parchemin)]/20 text-[var(--parchemin)] placeholder-[var(--parchemin)]/30 text-sm"
      />

      <div className="flex gap-2">
        <Input
          type="email"
          required
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white/5 border-[var(--parchemin)]/20 text-[var(--parchemin)] placeholder-[var(--parchemin)]/30 text-sm"
        />
        <Button
          type="submit"
          disabled={status === "loading"}
          className="bg-terracotta hover:bg-terracotta/90 text-primary-foreground flex-shrink-0"
        >
          {status === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "S'abonner"
          )}
        </Button>
      </div>

      {status === "error" && (
        <p className="text-xs text-red-400">{message}</p>
      )}

      <p className="text-xs text-[var(--parchemin)]/30">
        Désinscription possible à tout moment.
      </p>
    </form>
  );
}
