"use client";

import { useState, useRef, MouseEvent } from "react";
import Image from "next/image";

interface ImageLensProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  lensSize?: number;
  zoomLevel?: number;
}

export default function ImageLens({
  src,
  alt,
  width = 500,
  height = 500,
  className = "",
  lensSize = 150,
  zoomLevel = 3.5,
}: ImageLensProps) {
  const [showLens, setShowLens] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [backgroundPosition, setBackgroundPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Position de la lens
    const lensX = x - lensSize / 2;
    const lensY = y - lensSize / 2;

    // Limiter la lens aux bordures de l'image
    const maxLensX = rect.width - lensSize;
    const maxLensY = rect.height - lensSize;

    const constrainedLensX = Math.max(0, Math.min(lensX, maxLensX));
    const constrainedLensY = Math.max(0, Math.min(lensY, maxLensY));

    setLensPosition({ x: constrainedLensX, y: constrainedLensY });

    // Position du background pour le zoom
    const backgroundX = (x / rect.width) * 100;
    const backgroundY = (y / rect.height) * 100;

    setBackgroundPosition({ x: backgroundX, y: backgroundY });
  };

  const handleMouseEnter = () => {
    setShowLens(true);
  };

  const handleMouseLeave = () => {
    setShowLens(false);
  };

  return (
    <div className="relative inline-block group">
      <div
        ref={imageRef}
        className={`relative overflow-hidden transition-all duration-500 ${
          showLens ? "cursor-none" : "cursor-crosshair"
        } ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ width, height }}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-full object-cover transition-all duration-500"
          priority
        />

        {/* Lens avec design ultra premium */}
        {showLens && (
          <>
            {/* Bordure extérieure avec glow */}
            <div
              className="absolute border-4 border-amber-400/80 rounded-full pointer-events-none z-18 animate-pulse"
              style={{
                width: lensSize + 16,
                height: lensSize + 16,
                left: lensPosition.x - 8,
                top: lensPosition.y - 8,
                boxShadow:
                  "0 0 30px rgba(245, 158, 11, 0.5), 0 0 60px rgba(245, 158, 11, 0.2)",
              }}
            />

            {/* Lens principale */}
            <div
              className="absolute border-4 border-white rounded-full pointer-events-none z-20 shadow-2xl bg-cover bg-no-repeat"
              style={{
                width: lensSize,
                height: lensSize,
                left: lensPosition.x,
                top: lensPosition.y,
                backgroundImage: `url(${src})`,
                backgroundSize: `${width * zoomLevel}px ${height * zoomLevel}px`,
                backgroundPosition: `${backgroundPosition.x}% ${backgroundPosition.y}%`,
                boxShadow:
                  "0 0 40px rgba(0,0,0,0.5), inset 0 0 40px rgba(255,255,255,0.4), 0 0 0 3px rgba(255,255,255,0.9)",
              }}
            />

            {/* Reflet réaliste */}
            <div
              className="absolute rounded-full pointer-events-none z-21 opacity-30"
              style={{
                width: lensSize * 0.6,
                height: lensSize * 0.3,
                left: lensPosition.x + lensSize * 0.2,
                top: lensPosition.y + lensSize * 0.15,
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
                borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
              }}
            />
          </>
        )}
      </div>

      {/* Indicateur de zoom ultra stylisé */}
      {showLens && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-black/90 via-slate-800/90 to-black/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl text-sm font-bold z-30 border-2 border-white/30 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-amber-400 rounded-full animate-ping"></div>
            </div>
            <span className="bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent">
              Zoom {zoomLevel}x
            </span>
          </div>
        </div>
      )}

      {/* Instructions premium */}
      {!showLens && (
        <div className="absolute bottom-4 left-4 bg-gradient-to-r from-black/70 via-slate-800/70 to-black/70 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm opacity-0 group-hover:opacity-100 transition-all duration-500 z-10 border border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            Survolez pour zoomer
          </div>
        </div>
      )}
    </div>
  );
}
