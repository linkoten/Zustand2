"use client";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "../ui/button";

export function LanguageSwitcher({ lang }: { lang: "en" | "fr" }) {
  const pathname = usePathname();
  const router = useRouter();

  const otherLang = lang === "fr" ? "en" : "fr";
  const newPath = pathname.replace(/^\/(fr|en)/, `/${otherLang}`);

  return (
    <Button
      type="button"
      onClick={() => router.push(newPath)}
      variant="outline"
      style={{
        padding: 0,
        borderRadius: 4,
        width: 36,
        height: 24,
        minWidth: 36,
        minHeight: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
      aria-label={otherLang === "fr" ? "Français" : "English"}
    >
      <img
        src={`/${otherLang === "fr" ? "fr" : "gb"}.svg`}
        alt={otherLang === "fr" ? "Français" : "English"}
        width={32}
        height={20}
        style={{ display: "block" }}
      />
    </Button>
  );
}
