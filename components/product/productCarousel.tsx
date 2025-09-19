"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from "@/components/ui/carousel";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { SerializedProductImage } from "@/types/type";

interface ProductCarouselProps {
  images: SerializedProductImage[];
  productTitle: string;
}
export default function ProductCarousel({
  images,
  productTitle,
}: ProductCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square relative overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <Layers className="mx-auto h-12 w-12 mb-2" />
            <p>Image non disponible</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Carousel principal */}
      <div className="relative">
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={image.id}>
                <div className="aspect-square relative overflow-hidden rounded-lg bg-white shadow-sm">
                  <Image
                    src={image.imageUrl}
                    alt={
                      image.altText || `${productTitle} - Image ${index + 1}`
                    }
                    fill
                    className="object-cover"
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Boutons de navigation */}
          {images.length > 1 && (
            <>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </>
          )}
        </Carousel>

        {/* Badge compteur */}
        {images.length > 1 && (
          <Badge
            variant="secondary"
            className="absolute top-4 right-4 bg-black/70 text-white border-0 z-10"
          >
            {current} / {count}
          </Badge>
        )}
      </div>

      {/* Miniatures */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <Button
              key={image.id}
              variant="ghost"
              className={cn(
                "aspect-square p-0 h-auto border-2 rounded-md overflow-hidden transition-all",
                current === index + 1
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent hover:border-gray-300"
              )}
              onClick={() => api?.scrollTo(index)}
            >
              <Image
                src={image.imageUrl}
                alt={
                  image.altText || `${productTitle} - Miniature ${index + 1}`
                }
                width={100}
                height={100}
                className="object-cover w-full h-full"
                sizes="25vw"
              />
            </Button>
          ))}
        </div>
      )}

      {/* Indicateurs de points (optionnel) */}
      {images.length > 1 && images.length <= 5 && (
        <div className="flex justify-center space-x-2">
          {images.map((_, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className={cn(
                "w-2 h-2 p-0 rounded-full",
                current === index + 1
                  ? "bg-primary"
                  : "bg-gray-300 hover:bg-gray-400"
              )}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
