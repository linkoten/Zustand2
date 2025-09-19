"use client";

import { useMemo } from "react";
import "./blogContent.css"; // Fichier CSS pour les styles personnalisés

interface BlogContentProps {
  content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
  // Le contenu est déjà en HTML grâce à l'éditeur TipTap
  const processedContent = useMemo(() => {
    return content;
  }, [content]);

  return (
    <div className="blog-content-wrapper">
      {/* Container premium avec design moderne */}
      <div className="relative">
        {/* Background décoratif */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/30 to-white rounded-3xl" />

        {/* Contenu avec prose amélioré */}
        <div
          className="blog-content relative prose prose-lg prose-slate max-w-none 
                     prose-headings:font-black prose-headings:tracking-tight
                     prose-h1:text-4xl prose-h1:mb-8 prose-h1:bg-gradient-to-r prose-h1:from-slate-900 prose-h1:to-slate-600 prose-h1:bg-clip-text prose-h1:text-transparent
                     prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-12 prose-h2:text-slate-800
                     prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8 prose-h3:text-slate-700
                     prose-p:text-lg prose-p:leading-relaxed prose-p:text-slate-700 prose-p:mb-6
                     prose-a:text-blue-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:text-blue-700 hover:prose-a:underline prose-a:transition-all
                     prose-strong:text-slate-900 prose-strong:font-bold
                     prose-em:text-slate-600 prose-em:italic
                     prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:bg-amber-50 prose-blockquote:rounded-r-xl prose-blockquote:p-6 prose-blockquote:my-8
                     prose-blockquote:text-amber-800 prose-blockquote:font-medium prose-blockquote:italic
                     prose-code:bg-slate-100 prose-code:text-slate-800 prose-code:px-2 prose-code:py-1 prose-code:rounded-lg prose-code:font-mono prose-code:text-sm
                     prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-2xl prose-pre:p-6 prose-pre:my-8 prose-pre:overflow-x-auto
                     prose-ul:my-6 prose-ul:space-y-2 prose-li:text-slate-700
                     prose-ol:my-6 prose-ol:space-y-2
                     prose-img:rounded-2xl prose-img:shadow-xl prose-img:my-12 prose-img:mx-auto
                     prose-table:rounded-xl prose-table:overflow-hidden prose-table:shadow-lg prose-table:my-8
                     prose-th:bg-slate-100 prose-th:text-slate-800 prose-th:font-bold prose-th:p-4
                     prose-td:p-4 prose-td:border-slate-200
                     p-8 md:p-12"
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
      </div>

      {/* Styles CSS intégrés */}
      <style jsx>{`
        .blog-content-wrapper {
          /* Animations pour le contenu */
          animation: fadeInUp 0.8s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Styles pour les éléments spéciaux */
        .blog-content :global(figure) {
          margin: 3rem 0;
          text-align: center;
        }

        .blog-content :global(figcaption) {
          margin-top: 1rem;
          font-size: 0.875rem;
          color: #64748b;
          font-style: italic;
          background: #f8fafc;
          padding: 0.75rem 1.5rem;
          border-radius: 1rem;
          display: inline-block;
        }

        /* Tables premium */
        .blog-content :global(table) {
          border-collapse: separate;
          border-spacing: 0;
          background: white;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .blog-content :global(thead tr:first-child th:first-child) {
          border-top-left-radius: 0.75rem;
        }

        .blog-content :global(thead tr:first-child th:last-child) {
          border-top-right-radius: 0.75rem;
        }

        .blog-content :global(tbody tr:last-child td:first-child) {
          border-bottom-left-radius: 0.75rem;
        }

        .blog-content :global(tbody tr:last-child td:last-child) {
          border-bottom-right-radius: 0.75rem;
        }

        /* Listes améliorées */
        .blog-content :global(ul) {
          list-style: none;
          padding-left: 0;
        }

        .blog-content :global(ul li) {
          position: relative;
          padding-left: 2rem;
          margin-bottom: 0.75rem;
        }

        .blog-content :global(ul li::before) {
          content: "→";
          position: absolute;
          left: 0;
          color: #f59e0b;
          font-weight: bold;
          font-size: 1.125rem;
        }

        .blog-content :global(ol li) {
          padding-left: 0.5rem;
          margin-bottom: 0.75rem;
        }

        /* Citations spéciales */
        .blog-content :global(blockquote p) {
          margin-bottom: 0 !important;
        }

        .blog-content :global(blockquote::before) {
          content: """;
          font-size: 4rem;
          color: #f59e0b;
          line-height: 1;
          position: absolute;
          left: 1rem;
          top: 0.5rem;
        }

        /* Liens externes avec icône */
        .blog-content :global(a[href^="http"]::after) {
          content: "↗";
          display: inline-block;
          margin-left: 0.25rem;
          font-size: 0.875rem;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .blog-content :global(a[href^="http"]:hover::after) {
          opacity: 1;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .blog-content {
            padding: 1.5rem !important;
          }
          
          .blog-content :global(h1) {
            font-size: 2rem !important;
          }
          
          .blog-content :global(h2) {
            font-size: 1.75rem !important;
          }
          
          .blog-content :global(h3) {
            font-size: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
