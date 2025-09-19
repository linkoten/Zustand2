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
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/30 to-white rounded-3xl" />

        {/* Contenu avec prose amélioré */}
        <div
          className="blog-content relative prose prose-lg prose-slate max-w-none p-8 md:p-12"
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
      </div>
    </div>
  );
}
