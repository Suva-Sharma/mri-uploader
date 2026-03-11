"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Props = {
  images: string[];
  intervalMs?: number;
};

export default function HeroPreviewCarousel({ images, intervalMs = 800 }: Props) {
  const safeImages = useMemo(
    () => (images && images.length > 0 ? images : ["/hero-preview/fallback.png"]),
    [images]
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (safeImages.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % safeImages.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [safeImages.length, intervalMs]);

  return (
    <div className="relative h-full w-full bg-black/10">
      {safeImages.map((src, i) => (
        <Image
          key={`${src}-${i}`}
          src={src}
          alt={`Slide ${i + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 700px"
          className={[
            "object-cover transition-opacity duration-500",
            i === index ? "opacity-100" : "opacity-0",
          ].join(" ")}
          priority={i === 0}
        />
      ))}

      {/* Optional subtle vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/10" />
    </div>
  );
}
