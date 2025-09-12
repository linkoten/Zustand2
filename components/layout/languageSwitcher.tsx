"use client";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "../ui/button";
import "flag-icons/css/flag-icons.min.css";

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
      aria-label={otherLang === "fr" ? "Français" : "English"}
    >
      {otherLang === "fr" ? (
        <span
          className="fi fi-fr"
          style={{ fontSize: 32, width: 32, height: 20, display: "block" }}
        ></span>
      ) : (
        <span
          className="fi fi-gb"
          style={{ fontSize: 32, width: 32, height: 20, display: "block" }}
        ></span>
      )}
    </Button>
  );
}
