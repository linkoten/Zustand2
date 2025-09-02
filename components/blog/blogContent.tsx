"use client";

import { useMemo } from "react";

interface BlogContentProps {
  content: string;
}
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
