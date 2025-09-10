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
      style={{
        padding: "0.5em 1em",
        borderRadius: 4,
        border: "1px solid #ccc",
        background: "#fff",
        cursor: "pointer",
      }}
    >
      {otherLang === "fr" ? "Français" : "English"}
    </Button>
  );
}
