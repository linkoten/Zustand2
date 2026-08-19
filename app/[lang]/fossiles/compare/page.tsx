import { getDictionary } from "../../dictionaries";
import ComparePageClient from "./comparePageClient";
import { notFound } from "next/navigation";
import { FEATURES } from "@/lib/config/features";

export default async function ComparePage({
  params,
}: {
  params: Promise<{ lang: "fr" | "en" }>;
}) {
  if (!FEATURES.compare) {
    notFound();
  }

  const { lang } = await params;
  await getDictionary(lang); // preload dict for layout

  return <ComparePageClient lang={lang} />;
}
