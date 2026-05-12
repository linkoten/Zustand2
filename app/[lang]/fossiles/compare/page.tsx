import { getDictionary } from "../../dictionaries";
import ComparePageClient from "./comparePageClient";

export default async function ComparePage({
  params,
}: {
  params: Promise<{ lang: "fr" | "en" }>;
}) {
  const { lang } = await params;
  await getDictionary(lang); // preload dict for layout

  return <ComparePageClient lang={lang} />;
}
