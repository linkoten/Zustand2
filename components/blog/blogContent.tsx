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
    <div className="blog-content-wrapper animate-fadeInUp">
      {/* Container premium avec design moderne */}
      <div className="relative">
        {/* Background décoratif */}
        <div className="absolute inset-0 bg-background/50 rounded-3xl border border-border/50 shadow-inner" />

        {/* Contenu avec prose amélioré */}
        <div
          className="blog-content relative prose prose-lg prose-slate max-w-none p-8 md:p-12 prose-headings:text-foreground prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-500 prose-img:rounded-xl prose-img:shadow-lg prose-blockquote:border-l-4 prose-blockquote:border-terracotta/50 prose-blockquote:bg-muted/30 prose-blockquote:p-4 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:text-muted-foreground prose-strong:text-foreground"
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
      </div>
    </div>
  );
}
