import Image from "next/image";
import HeroPreviewCarousel from "@/components/landing/HeroPreviewCarousel";

type ScreenBox = {
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
  radiusPx?: number;
};

type Props = {
  images: string[];
  intervalMs?: number;
  frameSrc?: string;
  screen?: ScreenBox;
  className?: string;
};

const DEFAULT_SCREEN: ScreenBox = {
  leftPct: 11.8,
  topPct: 8.6,
  widthPct: 76.4,
  heightPct: 70.5,
  radiusPx: 10,
};

export default function LaptopScreenCarousel({
  images,
  intervalMs = 2000,
  frameSrc = "/frames/laptop-frame.png",
  screen = DEFAULT_SCREEN,
  className = "",
}: Props) {
  return (
    // ✅ removed max-w-[760px] so parent controls final size
    <div className={`relative w-full ${className}`}>
      {/* Keep stable layout ratio */}
      <div className="relative aspect-[16/10]">
        {/* Screen hole area */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: `${screen.leftPct}%`,
            top: `${screen.topPct}%`,
            width: `${screen.widthPct}%`,
            height: `${screen.heightPct}%`,
            borderRadius: `${screen.radiusPx ?? 10}px`,
          }}
        >
          <HeroPreviewCarousel images={images} intervalMs={intervalMs} />
        </div>

        {/* Laptop frame */}
        <Image
          src={frameSrc}
          alt="Laptop frame"
          fill
          priority
          className="pointer-events-none select-none object-contain"
          sizes="(min-width: 1280px) 900px, (min-width: 1024px) 760px, (min-width: 768px) 620px, 100vw"
        />
      </div>
    </div>
  );
}
