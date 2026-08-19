"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Share2,
  Link as LinkIcon,
  Check,
  X,
  ExternalLink,
  Heart,
  Globe,
  EyeOff,
} from "lucide-react";
import {
  generateCollectionShareToken,
  revokeCollectionShareToken,
} from "@/lib/actions/collectionShareActions";
import Link from "next/link";

interface CollectionShareWidgetProps {
  initialToken: string | null;
  lang: "fr" | "en";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
  appUrl: string;
}

export function CollectionShareWidget({
  initialToken,
  lang,
  dict,
  appUrl,
}: CollectionShareWidgetProps) {
  const [token, setToken] = useState<string | null>(initialToken);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const shareUrl = token ? `${appUrl}/${lang}/collection/shared/${token}` : null;

  async function handleGenerate() {
    setLoading(true);
    try {
      const result = await generateCollectionShareToken();
      if (result.token) setToken(result.token);
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke() {
    setLoading(true);
    try {
      await revokeCollectionShareToken();
      setToken(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="border border-parchemin/10 bg-silex/80 shadow-xl hover:shadow-2xl transition-all duration-500">
      <CardHeader className="border-b border-parchemin/10 bg-silex">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-terracotta/20 rounded-xl shadow-lg border border-terracotta/30">
              <Share2 className="h-5 w-5 text-terracotta" />
            </div>
            <span className="text-xl font-bold text-parchemin">
              {dict?.dashboard?.shareCollection || "Partagez votre collection"}
            </span>
          </CardTitle>
          {token ? (
            <Badge className="bg-emerald-900/40 text-emerald-300 border-emerald-700/30">
              <Globe className="w-3 h-3 mr-1" />
              {dict?.dashboard?.sharingActive || "Partage actif"}
            </Badge>
          ) : (
            <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700">
              <EyeOff className="w-3 h-3 mr-1" />
              {dict?.dashboard?.sharingInactive || "Privé"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-5">
        <p className="text-sm text-parchemin/70 leading-relaxed">
          {dict?.dashboard?.shareCollectionDesc ||
            "Partagez un lien vers votre collection de favoris avec d'autres passionnés."}
        </p>

        {/* Lien actif */}
        {shareUrl && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-silex/60 border border-parchemin/20">
            <Heart className="w-4 h-4 text-terracotta shrink-0" />
            <p className="text-xs text-parchemin/60 truncate flex-1 font-mono">
              {shareUrl}
            </p>
            <div className="flex gap-1 shrink-0">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-parchemin/70 hover:text-parchemin hover:bg-terracotta/10"
                onClick={handleCopy}
                title={dict?.dashboard?.copyShareLink || "Copier"}
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <LinkIcon className="w-3.5 h-3.5" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-parchemin/70 hover:text-parchemin hover:bg-terracotta/10"
                asChild
                title={dict?.dashboard?.viewPublicCollection || "Voir"}
              >
                <Link href={`/${lang}/collection/shared/${token}`} target="_blank">
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex flex-wrap gap-3">
          {!token ? (
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-terracotta hover:bg-terracotta/90 text-primary-foreground"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {dict?.dashboard?.generateShareLink || "Générer un lien"}
            </Button>
          ) : (
            <>
              <Button
                onClick={handleCopy}
                variant="outline"
                className="border-parchemin/30 text-parchemin hover:border-terracotta hover:bg-terracotta/10"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-emerald-500" />
                    {dict?.dashboard?.linkCopied || "Copié !"}
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    {dict?.dashboard?.copyShareLink || "Copier le lien"}
                  </>
                )}
              </Button>
              <Button
                onClick={handleRevoke}
                disabled={loading}
                variant="outline"
                className="border-red-700/40 text-red-300 hover:bg-red-900/30"
              >
                <X className="w-4 h-4 mr-2" />
                {dict?.dashboard?.disableSharing || "Désactiver"}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
