"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Store,
  Pickaxe,
  Package,
  ListTodo,
  MapPin,
  Calendar,
  Users,
  ExternalLink,
  Tag,
  CheckCircle2,
  Circle,
  Clock,
} from "lucide-react";
import type {
  ActivitesData,
  ActiviteFossil,
  SalonData,
  FouilleData,
  ArrivageData,
  PlanningData,
  PlanningTopic,
} from "@/types/blogType";

// ─── Category helpers ───────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  TRILOBITE: "Trilobite",
  AMMONITE: "Ammonite",
  DENT: "Dent",
  ECHINODERME: "Échinoderme",
  POISSON: "Poisson",
  VERTEBRE: "Vertébré",
  GASTEROPODE: "Gastéropode",
  AUTRE_ARTHROPODE: "Autre arthropode",
  AUTRES: "Autres",
};
const CATEGORY_COLORS: Record<string, string> = {
  TRILOBITE: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  AMMONITE: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  DENT: "bg-red-500/20 text-red-300 border-red-500/30",
  ECHINODERME: "bg-green-500/20 text-green-300 border-green-500/30",
  POISSON: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  VERTEBRE: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  GASTEROPODE: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  AUTRE_ARTHROPODE: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  AUTRES: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
};

// ─── Planning status helpers ─────────────────────────────────────────────────

const PLANNING_STATUS_CONFIG: Record<
  PlanningTopic["status"],
  { label: string; icon: React.ElementType; className: string }
> = {
  PLANNED: {
    label: "Planifié",
    icon: Circle,
    className: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  IN_PROGRESS: {
    label: "En cours",
    icon: Clock,
    className: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  DONE: {
    label: "Publié",
    icon: CheckCircle2,
    className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
};

// ─── Fossil card ─────────────────────────────────────────────────────────────

function FossilCard({
  fossil,
  showShopLink,
}: {
  fossil: ActiviteFossil;
  showShopLink: boolean;
}) {
  const hasProduct = Boolean(fossil.productId);
  return (
    <div className="group rounded-xl border border-parchemin/10 bg-silex/40 hover:bg-silex/70 transition-colors overflow-hidden">
      {fossil.photo && (
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={fossil.photo}
            alt={fossil.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-parchemin text-sm leading-tight">
            {fossil.name}
          </h4>
          {fossil.price && (
            <Badge className="bg-terracotta/20 text-terracotta border-terracotta/30 text-xs shrink-0">
              <Tag className="w-3 h-3 mr-1" />
              {fossil.price} €
            </Badge>
          )}
        </div>
        {fossil.category && (
          <Badge
            className={`text-xs border ${CATEGORY_COLORS[fossil.category] ?? "bg-parchemin/10 text-parchemin/60 border-parchemin/20"}`}
          >
            {CATEGORY_LABELS[fossil.category] ?? fossil.category}
          </Badge>
        )}
        {fossil.description && (
          <p className="text-xs text-parchemin/60 leading-relaxed">
            {fossil.description}
          </p>
        )}
        {showShopLink && hasProduct && (
          <Link
            href={`/fossiles/${fossil.productId}`}
            className="inline-flex items-center gap-1.5 text-xs text-terracotta hover:text-terracotta/80 font-medium transition-colors mt-1"
          >
            <ExternalLink className="w-3 h-3" />
            Voir en boutique
          </Link>
        )}
      </div>
    </div>
  );
}

function formatDate(dateStr: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

// ─── Salon view ──────────────────────────────────────────────────────────────

function SalonView({ data, lang }: { data: SalonData; lang: string }) {
  return (
    <div className="space-y-8">
      {/* Event banner */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 p-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shrink-0">
            <Store className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-bold text-parchemin">
              {data.eventName}
            </h3>
            {data.organizer && (
              <p className="text-parchemin/60 text-sm mt-0.5">
                par {data.organizer}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 text-parchemin/80">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{data.location}</span>
          </div>
          <div className="flex items-center gap-2 text-parchemin/80">
            <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {formatDate(data.dateStart, lang)}
              {data.dateEnd && data.dateEnd !== data.dateStart && (
                <> — {formatDate(data.dateEnd, lang)}</>
              )}
            </span>
          </div>
          {data.boothInfo && (
            <div className="flex items-center gap-2 text-parchemin/80">
              <span className="text-amber-400">📍</span>
              <span>{data.boothInfo}</span>
            </div>
          )}
        </div>
      </div>

      {/* Fossil grid */}
      {data.fossils.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-parchemin mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-amber-500 rounded-full" />
            Fossiles présentés ({data.fossils.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.fossils.map((f) => (
              <FossilCard key={f.id} fossil={f} showShopLink={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Fouille view ─────────────────────────────────────────────────────────────

function FouilleView({ data, lang }: { data: FouilleData; lang: string }) {
  return (
    <div className="space-y-8">
      {/* Expedition header */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border border-emerald-500/20 p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shrink-0">
            <Pickaxe className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-parchemin">
              {data.destination}
              {data.country && (
                <span className="text-parchemin/50 font-normal text-lg">
                  , {data.country}
                </span>
              )}
            </h3>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-parchemin/70">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                {formatDate(data.dateStart, lang)}
                {data.dateEnd && <> — {formatDate(data.dateEnd, lang)}</>}
              </div>
              {data.team.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  {data.team.length} participant
                  {data.team.length > 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div>
          <h3 className="text-lg font-bold text-parchemin mb-3 flex items-center gap-2">
            <span className="w-1 h-6 bg-emerald-500 rounded-full" />
            Compte rendu
          </h3>
          <p className="text-parchemin/80 leading-relaxed bg-parchemin/5 rounded-xl p-5">
            {data.summary}
          </p>
        </div>
      )}

      {/* Team */}
      {data.team.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-parchemin mb-3 flex items-center gap-2">
            <span className="w-1 h-6 bg-emerald-500 rounded-full" />
            Équipe
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.team.map((member, i) => (
              <Badge
                key={i}
                className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 px-4 py-1.5 text-sm"
              >
                {member}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Findings */}
      {data.findings.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-parchemin mb-3 flex items-center gap-2">
            <span className="w-1 h-6 bg-emerald-500 rounded-full" />
            Découvertes
          </h3>
          <ul className="space-y-2">
            {data.findings.map((f, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-parchemin/80 bg-parchemin/5 rounded-lg px-4 py-2.5 text-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Arrivage view ────────────────────────────────────────────────────────────

function ArrivageView({ data, lang }: { data: ArrivageData; lang: string }) {
  return (
    <div className="space-y-8">
      {/* Header banner */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border border-blue-500/20 p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shrink-0">
            <Package className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-parchemin">
              Nouvel arrivage
            </h3>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-parchemin/70">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-400" />
                {formatDate(data.arrivedAt, lang)}
              </div>
              {data.origin && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  {data.origin}
                </div>
              )}
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                {data.fossils.length} pièce{data.fossils.length > 1 ? "s" : ""}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Fossil grid */}
      {data.fossils.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-parchemin mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-500 rounded-full" />
            Disponibles en boutique
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.fossils.map((f) => (
              <FossilCard key={f.id} fossil={f} showShopLink={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Planning view ────────────────────────────────────────────────────────────

function PlanningView({ data }: { data: PlanningData }) {
  const grouped: Record<PlanningTopic["status"], PlanningTopic[]> = {
    IN_PROGRESS: data.topics.filter((t) => t.status === "IN_PROGRESS"),
    PLANNED: data.topics.filter((t) => t.status === "PLANNED"),
    DONE: data.topics.filter((t) => t.status === "DONE"),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-600/10 border border-purple-500/20 p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shrink-0">
          <ListTodo className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-parchemin">
            Planning éditorial
          </h3>
          <p className="text-sm text-parchemin/60 mt-0.5">
            {data.topics.length} sujet{data.topics.length > 1 ? "s" : ""} au
            total
          </p>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {(["IN_PROGRESS", "PLANNED", "DONE"] as PlanningTopic["status"][]).map(
          (s) => {
            const config = PLANNING_STATUS_CONFIG[s];
            const StatusIcon = config.icon;
            const topics = grouped[s];
            return (
              <div
                key={s}
                className="rounded-xl border border-parchemin/10 overflow-hidden"
              >
                <div
                  className={`px-4 py-3 flex items-center gap-2 border-b border-parchemin/10 ${config.className} bg-opacity-30`}
                >
                  <StatusIcon className="w-4 h-4" />
                  <span className="font-semibold text-sm">{config.label}</span>
                  <Badge className={`ml-auto ${config.className} text-xs`}>
                    {topics.length}
                  </Badge>
                </div>
                <div className="p-3 space-y-2 bg-silex/30 min-h-[120px]">
                  {topics.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-lg bg-silex/60 border border-parchemin/10 p-3 space-y-1.5"
                    >
                      <p className="text-sm font-medium text-parchemin leading-snug">
                        {t.title}
                      </p>
                      {t.category && (
                        <Badge className="bg-parchemin/10 text-parchemin/60 border-parchemin/10 text-xs">
                          {t.category}
                        </Badge>
                      )}
                      {t.notes && (
                        <p className="text-xs text-parchemin/50 leading-relaxed">
                          {t.notes}
                        </p>
                      )}
                    </div>
                  ))}
                  {topics.length === 0 && (
                    <p className="text-center text-xs text-parchemin/30 py-4">
                      Aucun sujet
                    </p>
                  )}
                </div>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface ActivitesContentProps {
  data: ActivitesData;
  lang: string;
}

export default function ActivitesContent({
  data,
  lang,
}: ActivitesContentProps) {
  return (
    <div className="space-y-8">
      {data.type === "SALON" && <SalonView data={data.salon} lang={lang} />}
      {data.type === "FOUILLE" && (
        <FouilleView data={data.fouille} lang={lang} />
      )}
      {data.type === "ARRIVAGE" && (
        <ArrivageView data={data.arrivage} lang={lang} />
      )}
      {data.type === "PLANNING" && <PlanningView data={data.planning} />}
    </div>
  );
}
