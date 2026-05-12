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
    <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-xl hover:shadow-2xl transition-all duration-500">
      <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg">
              <Share2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-parchemin">
              {dict?.dashboard?.shareCollection || "Partagez votre collection"}
            </span>
          </CardTitle>
          {token ? (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
              <Globe className="w-3 h-3 mr-1" />
              {dict?.dashboard?.sharingActive || "Partage actif"}
            </Badge>
          ) : (
            <Badge className="bg-zinc-100 text-zinc-500 border-zinc-200">
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
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-amber-200">
            <Heart className="w-4 h-4 text-terracotta shrink-0" />
            <p className="text-xs text-parchemin/60 truncate flex-1 font-mono">
              {shareUrl}
            </p>
            <div className="flex gap-1 shrink-0">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 hover:bg-amber-100"
                onClick={handleCopy}
                title={dict?.dashboard?.copyShareLink || "Copier"}
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <LinkIcon className="w-3.5 h-3.5 text-parchemin/60" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 hover:bg-amber-100"
                asChild
                title={dict?.dashboard?.viewPublicCollection || "Voir"}
              >
                <Link href={`/${lang}/collection/shared/${token}`} target="_blank">
                  <ExternalLink className="w-3.5 h-3.5 text-parchemin/60" />
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
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
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
                className="border-red-200 text-red-600 hover:bg-red-50"
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
