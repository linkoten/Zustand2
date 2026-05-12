"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Users,
  Send,
  Trash2,
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  getNewsletterSubscribers,
  deleteNewsletterSubscriber,
  sendNewsletterToAll,
} from "@/lib/actions/newsletterActions";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  lang: string;
  isActive: boolean;
  createdAt: string;
}

interface AdminNewsletterProps {
  initialSubscribers: Subscriber[];
  initialTotal: number;
  initialActive: number;
}

export default function AdminNewsletter({
  initialSubscribers,
  initialTotal,
  initialActive,
}: AdminNewsletterProps) {
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [total, setTotal] = useState(initialTotal);
  const [active, setActive] = useState(initialActive);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSending, setIsSending] = useState(false);

  function handleSearch() {
    startTransition(async () => {
      const data = await getNewsletterSubscribers(1, search || undefined);
      setSubscribers(data.subscribers as Subscriber[]);
      setTotal(data.total);
      setActive(data.active);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteNewsletterSubscriber(id);
      if (result.success) {
        setSubscribers((prev) => prev.filter((s) => s.id !== id));
        setTotal((t) => t - 1);
        toast.success("Abonné supprimé.");
      } else {
        toast.error("Erreur lors de la suppression.");
      }
    });
  }

  async function handleSend() {
    if (!subject.trim() || !content.trim()) {
      toast.error("Objet et contenu requis.");
      return;
    }
    setIsSending(true);
    setSendResult(null);
    try {
      const result = await sendNewsletterToAll(subject, content);
      if (result.success) {
        setSendResult(result.message ?? "Envoyée.");
        toast.success(result.message ?? "Newsletter envoyée !");
        setSubject("");
        setContent("");
      } else {
        toast.error(result.message ?? "Erreur.");
      }
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border/40">
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="w-8 h-8 text-[var(--terracotta)] flex-shrink-0" />
            <div>
              <p className="text-2xl font-bold text-[var(--parchemin)]">{total}</p>
              <p className="text-xs text-muted-foreground">Total abonnés</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/40">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-2xl font-bold text-[var(--parchemin)]">{active}</p>
              <p className="text-xs text-muted-foreground">Actifs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/40">
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-2xl font-bold text-[var(--parchemin)]">{total - active}</p>
              <p className="text-xs text-muted-foreground">Désabonnés</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compose */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[var(--parchemin)]">
            <Mail className="w-5 h-5 text-[var(--terracotta)]" />
            Envoyer une newsletter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nl-subject">Objet *</Label>
            <Input
              id="nl-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Nouvelles acquisitions — Mai 2026"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="nl-content">Contenu *</Label>
            <Textarea
              id="nl-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Rédigez votre message. Séparez les paragraphes par une ligne vide."
              rows={8}
              className="mt-1 font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Texte brut — les paragraphes séparés par une ligne vide seront mis en forme automatiquement.
            </p>
          </div>

          {sendResult && (
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 rounded-lg px-3 py-2">
              <CheckCircle className="w-4 h-4" />
              <p className="text-sm">{sendResult}</p>
            </div>
          )}

          <Button
            onClick={handleSend}
            disabled={isSending || active === 0}
            className="bg-terracotta hover:bg-terracotta/90 text-primary-foreground"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Envoi en cours…
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Envoyer à {active} abonné{active > 1 ? "s" : ""}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Subscriber list */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-[var(--parchemin)]">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--terracotta)]" />
              Liste des abonnés
            </span>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-8 text-sm w-48"
              />
              <Button size="sm" variant="outline" onClick={handleSearch} disabled={isPending}>
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setSearch(""); handleSearch(); }}
                title="Réinitialiser"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscribers.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              Aucun abonné trouvé.
            </p>
          ) : (
            <div className="space-y-2">
              {subscribers.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white/3 border border-border/20 hover:bg-white/5 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--parchemin)] truncate">
                      {sub.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {sub.name ? `${sub.name} · ` : ""}
                      {sub.lang.toUpperCase()} ·{" "}
                      {new Date(sub.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      variant={sub.isActive ? "default" : "secondary"}
                      className={`text-xs ${sub.isActive ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}
                    >
                      {sub.isActive ? "Actif" : "Inactif"}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(sub.id)}
                      disabled={isPending}
                      className="h-7 w-7 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
