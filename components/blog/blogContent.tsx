"use client";

import { BlogContentProps } from "@/types/blogType";
import { useMemo } from "react";

export default function BlogContent({ content }: BlogContentProps) {
  // Le contenu est déjà en HTML grâce à l'éditeur TipTap
  const processedContent = useMemo(() => {
    return content;
  }, [content]);

  return (
    <div
      className="blog-content prose prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}
