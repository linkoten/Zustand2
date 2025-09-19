"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Import dynamique du composant carte pour éviter l'erreur SSR
const ProductMapDynamic = dynamic(() => import("./productMap"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center"
      style={{ height: 240 }}
    >
      <div className="text-center space-y-3">
        <Skeleton className="w-16 h-16 rounded-full mx-auto bg-slate-200" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 mx-auto bg-slate-200" />
          <Skeleton className="h-3 w-24 mx-auto bg-slate-200" />
        </div>
      </div>
    </div>
  ),
});

interface ProductMapWrapperProps {
  localities: any[];
  centerLat?: number;
  centerLon?: number;
  zoom?: number;
  highlightedLocalityId?: number;
  lang?: "en" | "fr";
  dict?: any;
  height?: number;
  showLegend?: boolean;
}

export default function ProductMapWrapper(props: ProductMapWrapperProps) {
  return <ProductMapDynamic {...props} />;
}
