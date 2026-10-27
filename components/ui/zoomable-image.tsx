"use client";

import {
  useEffect,
  useRef,
  useState,
  PointerEvent as ReactPointerEvent,
  MouseEvent as ReactMouseEvent,
} from "react";
import Image from "next/image";
import { Minus, Plus, RotateCcw } from "lucide-react";

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const WHEEL_FACTOR = 1.15;
const BUTTON_FACTOR = 1.5;
const DOUBLE_CLICK_SCALE = 2.5;

interface View {
  scale: number;
  x: number;
  y: number;
}

const RESET_VIEW: View = { scale: MIN_SCALE, x: 0, y: 0 };

// Garde l'image zoomée couvrant entièrement le conteneur.
function clampView(view: View, w: number, h: number): View {
  const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, view.scale));
  return {
    scale,
    x: Math.min(0, Math.max(w - w * scale, view.x)),
    y: Math.min(0, Math.max(h - h * scale, view.y)),
  };
}

// Zoome en gardant le point (cx, cy) fixe à l'écran.
function zoomAt(
  view: View,
  factor: number,
  cx: number,
  cy: number,
  w: number,
  h: number,
): View {
  const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, view.scale * factor));
  const ratio = scale / view.scale;
  return clampView(
    {
      scale,
      x: cx - (cx - view.x) * ratio,
      y: cy - (cy - view.y) * ratio,
    },
    w,
    h,
  );
}

interface ZoomableImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export default function ZoomableImage({
  src,
  alt,
  width,
  height,
}: ZoomableImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>(RESET_VIEW);
  const scaleRef = useRef(MIN_SCALE);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDistance = useRef(0);

  useEffect(() => {
    scaleRef.current = view.scale;
  }, [view.scale]);

  // Listener natif non passif pour pouvoir bloquer le scroll de la page pendant le zoom.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      if (scaleRef.current === MIN_SCALE && e.deltaY > 0) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const factor = e.deltaY < 0 ? WHEEL_FACTOR : 1 / WHEEL_FACTOR;
      setView((v) =>
        zoomAt(
          v,
          factor,
          e.clientX - rect.left,
          e.clientY - rect.top,
          rect.width,
          rect.height,
        ),
      );
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const pointerDistance = () => {
    const [a, b] = [...pointers.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
    if (pointers.current.size === 2) pinchDistance.current = pointerDistance();
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const pointer = pointers.current.get(e.pointerId);
    const el = containerRef.current;
    if (!pointer || !el) return;

    const rect = el.getBoundingClientRect();
    const dx = e.clientX - pointer.x;
    const dy = e.clientY - pointer.y;
    pointer.x = e.clientX;
    pointer.y = e.clientY;

    if (pointers.current.size >= 2) {
      const dist = pointerDistance();
      if (pinchDistance.current > 0 && dist > 0) {
        const [a, b] = [...pointers.current.values()];
        const factor = dist / pinchDistance.current;
        const cx = (a.x + b.x) / 2 - rect.left;
        const cy = (a.y + b.y) / 2 - rect.top;
        setView((v) => zoomAt(v, factor, cx, cy, rect.width, rect.height));
      }
      pinchDistance.current = dist;
      return;
    }

    if (scaleRef.current > MIN_SCALE && (dx !== 0 || dy !== 0)) {
      setView((v) =>
        clampView({ scale: v.scale, x: v.x + dx, y: v.y + dy }, rect.width, rect.height),
      );
    }
  };

  const handlePointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    pinchDistance.current = 0;
  };

  const handleDoubleClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setView((v) =>
      v.scale > MIN_SCALE
        ? RESET_VIEW
        : zoomAt(
            v,
            DOUBLE_CLICK_SCALE,
            e.clientX - rect.left,
            e.clientY - rect.top,
            rect.width,
            rect.height,
          ),
    );
  };

  const zoomByButton = (factor: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setView((v) =>
      zoomAt(v, factor, rect.width / 2, rect.height / 2, rect.width, rect.height),
    );
  };

  const isZoomed = view.scale > MIN_SCALE;

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className={`absolute inset-0 overflow-hidden select-none ${
          isZoomed ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
        }`}
        style={{ touchAction: isZoomed ? "none" : "pan-y" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onDoubleClick={handleDoubleClick}
      >
        <div
          className="absolute inset-0 origin-top-left"
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
          }}
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            unoptimized
            draggable={false}
            className="w-full h-full object-contain pointer-events-none"
          />
        </div>
      </div>

      <div className="absolute bottom-3 right-3 z-30 flex items-center gap-1 rounded-full bg-silex border border-parchemin/20 p-1 text-parchemin shadow-md">
        <button
          type="button"
          onClick={() => zoomByButton(1 / BUTTON_FACTOR)}
          disabled={!isZoomed}
          aria-label="Dézoomer"
          className="p-1.5 rounded-full hover:bg-parchemin/15 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="min-w-10 text-center text-xs font-semibold tabular-nums">
          {view.scale.toFixed(1)}x
        </span>
        <button
          type="button"
          onClick={() => zoomByButton(BUTTON_FACTOR)}
          disabled={view.scale >= MAX_SCALE}
          aria-label="Zoomer"
          className="p-1.5 rounded-full hover:bg-parchemin/15 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setView(RESET_VIEW)}
          disabled={!isZoomed}
          aria-label="Réinitialiser le zoom"
          className="p-1.5 rounded-full hover:bg-parchemin/15 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
