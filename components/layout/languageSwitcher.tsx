"use client";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";

export function LanguageSwitcher({ locale }: { locale: "fr" | "en" }) {
  const pathname = usePathname();
  const router = useRouter();

  const otherLocale = locale === "fr" ? "en" : "fr";
  const newPath = pathname.replace(/^\/(fr|en)/, `/${otherLocale}`);

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
      {otherLocale === "fr" ? "Français" : "English"}
    </Button>
  );
}
