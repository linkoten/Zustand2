"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowLeft, Search, X } from "lucide-react";
import { EnrichedSpeciesFacet } from "@/types/collectionType";

// ─── Constants ────────────────────────────────────────────────────────────────

const PERIOD_LABELS: Record<string, string> = {
  CAMBRIEN: "Cambrien",
  ORDOVICIEN: "Ordovicien",
  SILURIEN: "Silurien",
  DEVONIEN: "Dévonien",
  CARBONIFERE: "Carbonifère",
  PERMIEN: "Permien",
  TRIAS: "Trias",
  JURASSIQUE: "Jurassique",
  CRETACE: "Crétacé",
  PALEOGENE: "Paléogène",
  NEOGENE: "Néogène",
  QUATERNAIRE: "Quaternaire",
};

const PERIOD_ORDER = [
  "CAMBRIEN",
  "ORDOVICIEN",
  "SILURIEN",
  "DEVONIEN",
  "CARBONIFERE",
  "PERMIEN",
  "TRIAS",
  "JURASSIQUE",
  "CRETACE",
  "PALEOGENE",
  "NEOGENE",
  "QUATERNAIRE",
];

const CATEGORY_COLORS: Record<string, string> = {
  TRILOBITE: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  AMMONITE: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  DENT: "bg-red-500/20 text-red-300 border-red-500/30",
  ECHINODERME: "bg-green-500/20 text-green-300 border-green-500/30",
  POISSON: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  VERTEBRE: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  GASTROPODE: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  AUTRE_ARTHROPODE: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  AUTRES: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
};

const CATEGORY_LABELS: Record<string, string> = {
  TRILOBITE: "Trilobite",
  AMMONITE: "Ammonite",
  DENT: "Dent",
  ECHINODERME: "Échinoderme",
  POISSON: "Poisson",
  VERTEBRE: "Vertébré",
  GASTROPODE: "Gastéropode",
  AUTRE_ARTHROPODE: "Autre arthropode",
  AUTRES: "Autres",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({
  owned,
  total,
  wishlist,
}: {
  owned: number;
  total: number;
  wishlist: number;
}) {
  const pctOwned = total > 0 ? Math.round((owned / total) * 100) : 0;
  const pctWishlist = total > 0 ? Math.round((wishlist / total) * 100) : 0;
  return (
    <div className="h-1.5 bg-silex/50 rounded-full overflow-hidden flex">
      <div
        className="bg-green-500 h-full transition-all"
        style={{ width: `${pctOwned}%` }}
      />
      <div
        className="bg-amber-500 h-full transition-all"
        style={{ width: `${pctWishlist}%` }}
      />
    </div>
  );
}

function DrillCard({
  name,
  subLabel,
  total,
  owned,
  wishlist,
  badges,
  isLeaf,
  onClick,
}: {
  name: string;
  subLabel: string;
  total: number;
  owned: number;
  wishlist: number;
  badges?: string[];
  isLeaf?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-silex/20 hover:bg-silex/40 border border-silex/20 hover:border-terracotta/40 rounded-xl p-4 space-y-3 transition-all group"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-parchemin leading-tight group-hover:text-parchemin">
          {name}
        </p>
        <ChevronRight className="w-4 h-4 shrink-0 text-parchemin/25 group-hover:text-terracotta/60 transition-colors" />
      </div>

      <p className="text-xs text-parchemin/50">{subLabel}</p>

      <ProgressBar owned={owned} total={total} wishlist={wishlist} />

      <div className="flex items-center justify-between text-xs">
        <span
          className={
            owned > 0 ? "text-green-400 font-medium" : "text-parchemin/40"
          }
        >
          {owned}/{total} possédés
        </span>
        {wishlist > 0 && (
          <span className="text-amber-400">{wishlist} wishlist</span>
        )}
      </div>

      {badges && badges.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {badges.map((b) => (
            <Badge
              key={b}
              variant="outline"
              className={`text-xs ${CATEGORY_COLORS[b] ?? "border-silex/30 text-parchemin/50"}`}
            >
              {CATEGORY_LABELS[b] ?? b}
            </Badge>
          ))}
        </div>
      )}

      {isLeaf && (
        <p className="text-xs text-terracotta/70 group-hover:text-terracotta font-medium transition-colors">
          Voir le catalogue →
        </p>
      )}
    </button>
  );
}

function BreadcrumbNav({
  crumbs,
  onBack,
}: {
  crumbs: { label: string; onClick: () => void }[];
  onBack: () => void;
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="text-parchemin/60 hover:text-parchemin h-8 px-2 gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Retour
      </Button>
      <div className="flex items-center gap-1.5 text-sm text-parchemin/50 flex-wrap">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3 h-3 text-parchemin/25" />}
            <button
              onClick={c.onClick}
              className={`transition-colors ${
                i === crumbs.length - 1
                  ? "text-parchemin font-semibold pointer-events-none"
                  : "hover:text-parchemin hover:underline underline-offset-2"
              }`}
            >
              {c.label}
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Summary bar ──────────────────────────────────────────────────────────────

function SummaryBar({ facets }: { facets: EnrichedSpeciesFacet[] }) {
  const total = facets.length;
  const owned = facets.filter((f) => f.userStatus === "OWNED").length;
  const wishlist = facets.filter((f) => f.userStatus === "WISHLIST").length;
  if (total === 0) return null;
  return (
    <div className="flex items-center gap-4 text-sm text-parchemin/60 bg-silex/20 border border-silex/20 rounded-xl px-4 py-2">
      <span className="text-parchemin font-semibold">
        {total} espèce{total !== 1 ? "s" : ""}
      </span>
      <span className="text-green-400">{owned} possédées</span>
      <span className="text-amber-400">{wishlist} wishlist</span>
      <div className="flex-1 h-1.5 bg-silex/50 rounded-full overflow-hidden hidden sm:flex">
        <div
          className="bg-green-500 h-full"
          style={{
            width: `${total > 0 ? Math.round((owned / total) * 100) : 0}%`,
          }}
        />
        <div
          className="bg-amber-500 h-full"
          style={{
            width: `${total > 0 ? Math.round((wishlist / total) * 100) : 0}%`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface CollectionBrowserProps {
  facets: EnrichedSpeciesFacet[];
  lang: string;
}

interface DrillState {
  country: string | null;
  period: string | null;
  stage: string | null;
}

function LocalitySearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parchemin/40 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Rechercher un gisement…"
        className="w-full bg-silex/30 border border-silex/30 focus:border-terracotta/50 rounded-xl pl-9 pr-9 py-2.5 text-sm text-parchemin placeholder:text-parchemin/30 outline-none transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-parchemin/40 hover:text-parchemin transition-colors"
          aria-label="Effacer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default function CollectionBrowser({
  facets,
  lang,
}: CollectionBrowserProps) {
  const router = useRouter();
  const [state, setState] = useState<DrillState>({
    country: null,
    period: null,
    stage: null,
  });
  const [localitySearch, setLocalitySearch] = useState("");

  const level =
    state.country === null
      ? "country"
      : state.period === null
        ? "period"
        : state.stage === null
          ? "stage"
          : "locality";

  // Facets matching current drill path
  const filtered = facets.filter((f) => {
    if (state.country && f.countryOfOrigin !== state.country) return false;
    if (state.period && f.geologicalPeriod !== state.period) return false;
    if (state.stage && f.geologicalStage !== state.stage) return false;
    return true;
  });

  // Breadcrumb
  const crumbs: { label: string; onClick: () => void }[] = [
    {
      label: "Pays",
      onClick: () => setState({ country: null, period: null, stage: null }),
    },
    ...(state.country
      ? [
          {
            label: state.country,
            onClick: () => setState({ ...state, period: null, stage: null }),
          },
        ]
      : []),
    ...(state.period
      ? [
          {
            label: PERIOD_LABELS[state.period] ?? state.period,
            onClick: () => setState({ ...state, stage: null }),
          },
        ]
      : []),
    ...(state.stage ? [{ label: state.stage, onClick: () => {} }] : []),
  ];

  function goBack() {
    if (state.stage) setState({ ...state, stage: null });
    else if (state.period) setState({ ...state, period: null, stage: null });
    else setState({ country: null, period: null, stage: null });
  }

  // ── Locality search mode ─────────────────────────────────────────────────
  const searchQuery = localitySearch.trim().toLowerCase();
  if (searchQuery.length > 0) {
    const localityIds = [...new Set(facets.map((f) => f.localityId))].filter(
      (lid) => {
        const name =
          facets.find((f) => f.localityId === lid)?.localityName ?? "";
        return name.toLowerCase().includes(searchQuery);
      },
    );

    return (
      <div className="space-y-4">
        <LocalitySearchBar
          value={localitySearch}
          onChange={setLocalitySearch}
        />
        {localityIds.length === 0 ? (
          <p className="text-parchemin/40 text-sm text-center py-10">
            Aucun gisement trouvé pour «&nbsp;{localitySearch}&nbsp;»
          </p>
        ) : (
          <>
            <p className="text-parchemin/50 text-sm">
              {localityIds.length} gisement{localityIds.length !== 1 ? "s" : ""}{" "}
              trouvé{localityIds.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {localityIds.map((lid) => {
                const lf = facets.filter((f) => f.localityId === lid);
                const name = lf[0].localityName;
                const owned = lf.filter((f) => f.userStatus === "OWNED").length;
                const wishlist = lf.filter(
                  (f) => f.userStatus === "WISHLIST",
                ).length;
                const cats = [...new Set(lf.map((f) => f.category))];
                const country = lf[0].countryOfOrigin;
                const periods = [...new Set(lf.map((f) => f.geologicalPeriod))];
                return (
                  <DrillCard
                    key={lid}
                    name={name}
                    subLabel={`${country} · ${periods.map((p) => PERIOD_LABELS[p] ?? p).join(", ")}`}
                    total={lf.length}
                    owned={owned}
                    wishlist={wishlist}
                    badges={cats}
                    isLeaf
                    onClick={() =>
                      router.push(`/${lang}/collection?localityId=${lid}`)
                    }
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Country level ─────────────────────────────────────────────────────────
  if (level === "country") {
    const countries = [...new Set(facets.map((f) => f.countryOfOrigin))].sort();

    return (
      <div className="space-y-4">
        <LocalitySearchBar
          value={localitySearch}
          onChange={setLocalitySearch}
        />
        <p className="text-parchemin/50 text-sm">
          Sélectionne un pays pour commencer
        </p>
        <SummaryBar facets={facets} />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {countries.map((country) => {
            const cf = facets.filter((f) => f.countryOfOrigin === country);
            const owned = cf.filter((f) => f.userStatus === "OWNED").length;
            const wishlist = cf.filter(
              (f) => f.userStatus === "WISHLIST",
            ).length;
            const periods = new Set(cf.map((f) => f.geologicalPeriod)).size;
            return (
              <DrillCard
                key={country}
                name={country}
                subLabel={`${periods} période${periods !== 1 ? "s" : ""} géologique${periods !== 1 ? "s" : ""}`}
                total={cf.length}
                owned={owned}
                wishlist={wishlist}
                onClick={() => setState({ country, period: null, stage: null })}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // ── Period level ──────────────────────────────────────────────────────────
  if (level === "period") {
    const periods = [...new Set(filtered.map((f) => f.geologicalPeriod))].sort(
      (a, b) => PERIOD_ORDER.indexOf(a) - PERIOD_ORDER.indexOf(b),
    );

    return (
      <div className="space-y-4">
        <LocalitySearchBar
          value={localitySearch}
          onChange={setLocalitySearch}
        />
        <BreadcrumbNav crumbs={crumbs} onBack={goBack} />
        <SummaryBar facets={filtered} />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {periods.map((period) => {
            const pf = filtered.filter((f) => f.geologicalPeriod === period);
            const owned = pf.filter((f) => f.userStatus === "OWNED").length;
            const wishlist = pf.filter(
              (f) => f.userStatus === "WISHLIST",
            ).length;
            const stages = new Set(pf.map((f) => f.geologicalStage)).size;
            return (
              <DrillCard
                key={period}
                name={PERIOD_LABELS[period] ?? period}
                subLabel={`${stages} étage${stages !== 1 ? "s" : ""} stratigraphique${stages !== 1 ? "s" : ""}`}
                total={pf.length}
                owned={owned}
                wishlist={wishlist}
                onClick={() => setState({ ...state, period, stage: null })}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // ── Stage level ───────────────────────────────────────────────────────────
  if (level === "stage") {
    const stages = [...new Set(filtered.map((f) => f.geologicalStage))].sort();

    return (
      <div className="space-y-4">
        <LocalitySearchBar
          value={localitySearch}
          onChange={setLocalitySearch}
        />
        <BreadcrumbNav crumbs={crumbs} onBack={goBack} />
        <SummaryBar facets={filtered} />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {stages.map((stage) => {
            const sf = filtered.filter((f) => f.geologicalStage === stage);
            const owned = sf.filter((f) => f.userStatus === "OWNED").length;
            const wishlist = sf.filter(
              (f) => f.userStatus === "WISHLIST",
            ).length;
            const localities = new Set(sf.map((f) => f.localityId)).size;
            return (
              <DrillCard
                key={stage}
                name={stage}
                subLabel={`${localities} gisement${localities !== 1 ? "s" : ""}`}
                total={sf.length}
                owned={owned}
                wishlist={wishlist}
                onClick={() => setState({ ...state, stage })}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // ── Locality level ────────────────────────────────────────────────────────
  const localityIds = [...new Set(filtered.map((f) => f.localityId))];

  return (
    <div className="space-y-4">
      <LocalitySearchBar value={localitySearch} onChange={setLocalitySearch} />
      <BreadcrumbNav crumbs={crumbs} onBack={goBack} />
      <SummaryBar facets={filtered} />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {localityIds.map((lid) => {
          const lf = filtered.filter((f) => f.localityId === lid);
          const name = lf[0].localityName;
          const owned = lf.filter((f) => f.userStatus === "OWNED").length;
          const wishlist = lf.filter((f) => f.userStatus === "WISHLIST").length;
          const cats = [...new Set(lf.map((f) => f.category))];
          return (
            <DrillCard
              key={lid}
              name={name}
              subLabel={`${cats.length} catégorie${cats.length !== 1 ? "s" : ""} · ${lf.length} espèce${lf.length !== 1 ? "s" : ""}`}
              total={lf.length}
              owned={owned}
              wishlist={wishlist}
              badges={cats}
              isLeaf
              onClick={() =>
                router.push(`/${lang}/collection?localityId=${lid}`)
              }
            />
          );
        })}
      </div>
    </div>
  );
}
