"use client";

import { useEffect, useRef } from "react";
import { incrementArticleViews } from "@/lib/actions/blogActions";

interface ViewTrackerProps {
  slug: string;
}

/**
 * Composant invisible qui incrémente le compteur de vues une seule fois
 * lors du montage côté navigateur (évite les doubles incréments liés à
 * generateMetadata ou aux rendu serveur successifs).
 */
export default function ViewTracker({ slug }: ViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    incrementArticleViews(slug);
  }, [slug]);

  return null;
}
