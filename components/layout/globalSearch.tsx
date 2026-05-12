"use client";

import { useState, useEffect, useRef, useCallback, useTransition } from "react";
import { Search, X, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { globalSearch, type GlobalSearchResult } from "@/lib/actions/searchActions";

interface GlobalSearchProps {
  lang: string;
}

export function GlobalSearch({ lang }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(
    (q: string) => {
      if (q.trim().length < 2) {
        setResults(null);
        setIsOpen(false);
        return;
      }
      startTransition(async () => {
        const data = await globalSearch(q, lang);
        setResults(data);
        setIsOpen(data.fossils.length > 0 || data.articles.length > 0);
      });
    },
    [lang],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(query), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  // Close on outside click or Escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleClose() {
    setQuery("");
    setResults(null);
    setIsOpen(false);
  }

  const hasResults =
    results && (results.fossils.length > 0 || results.articles.length > 0);

  return (
    <div ref={containerRef} className="relative w-full max-w-xs hidden md:block">
      {/* Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-[var(--parchemin)]/40 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher…"
          className="w-full pl-9 pr-8 py-1.5 text-sm bg-white/5 border border-[var(--parchemin)]/15 rounded-lg text-[var(--parchemin)] placeholder-[var(--parchemin)]/35 focus:outline-none focus:border-[var(--terracotta)]/50 focus:bg-white/8 transition-all duration-200"
        />
        {query.length > 0 && (
          <button
            onClick={handleClose}
            className="absolute right-2 text-[var(--parchemin)]/40 hover:text-[var(--parchemin)] transition-colors"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <X className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && hasResults && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-[var(--silex)] border border-[var(--parchemin)]/15 rounded-xl shadow-2xl overflow-hidden">
          {/* Fossiles */}
          {results!.fossils.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--parchemin)]/40 border-b border-[var(--parchemin)]/10">
                Fossiles
              </div>
              {results!.fossils.map((fossil) => (
                <Link
                  key={fossil.id}
                  href={`/${lang}/fossiles/${fossil.id}`}
                  onClick={handleClose}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors"
                >
                  {fossil.imageUrl ? (
                    <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-white/5">
                      <Image
                        src={fossil.imageUrl}
                        alt={fossil.title}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-white/5 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--parchemin)] truncate">
                      {fossil.title}
                    </p>
                    <p className="text-xs text-[var(--parchemin)]/50">
                      {fossil.category} · {fossil.price.toLocaleString("fr-FR")} €
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Articles */}
          {results!.articles.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--parchemin)]/40 border-b border-[var(--parchemin)]/10">
                Articles
              </div>
              {results!.articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/${lang}/blog/${article.slug}`}
                  onClick={handleClose}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors"
                >
                  {article.featuredImage ? (
                    <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-white/5">
                      <Image
                        src={article.featuredImage}
                        alt={article.title}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-white/5 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--parchemin)] truncate">
                      {article.title}
                    </p>
                    {article.excerpt && (
                      <p className="text-xs text-[var(--parchemin)]/50 truncate">
                        {article.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
