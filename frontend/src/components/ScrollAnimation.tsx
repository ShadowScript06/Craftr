"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Lenis from "@studio-freight/lenis";

const TOTAL_FRAMES = 210;
const BG_COLOR = "#050505";

const FRAME_PATH = (i: number): string => {
  const padded = String(i).padStart(3, "0");
  return `/images/frames/ezgif-frame-${padded}.png`;
};

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

export default function ScrollAnimation(): React.ReactElement{
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);

  // preload frames
  useEffect(() => {
    let cancelled = false;
    const images: Array<HTMLImageElement | undefined> = new Array(TOTAL_FRAMES);

    let loadedCount = 0;
    let errors = 0;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const idx = i - 1;

      img.onload = () => {
        if (cancelled) return;

        images[idx] = img;
        loadedCount++;

        if (loadedCount + errors === TOTAL_FRAMES) {
          framesRef.current = images.filter((img): img is HTMLImageElement =>
            Boolean(img),
          );
          setLoaded(true);
        }
      };

      img.onerror = () => {
        if (cancelled) return;

        errors++;

        if (loadedCount + errors === TOTAL_FRAMES) {
          if (loadedCount === 0) {
            setLoadError(true);
          } else {
            framesRef.current = images.filter((img): img is HTMLImageElement =>
              Boolean(img),
            );
            setLoaded(true);
          }
        }
      };

      img.src = FRAME_PATH(i);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  // draw frame
  const drawFrame = useCallback((index: number): void => {
    const canvas = canvasRef.current;
    const frames = framesRef.current;

    if (!canvas || frames.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const frame = frames[clamp(index, 0, frames.length - 1)];
    if (!frame) return;

    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;

    const gradient = ctx.createLinearGradient(0, 0, 0, ch);
    gradient.addColorStop(0, BG_COLOR);
    gradient.addColorStop(1, "rgba(99,102,241,0.18)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, cw, ch);

    const scale = Math.max(cw / frame.naturalWidth, ch / frame.naturalHeight);
    const zoom = 1 + index * 0.0005;

    const dw = frame.naturalWidth * scale * zoom;
    const dh = frame.naturalHeight * scale * zoom;

    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    ctx.drawImage(frame, dx, dy, dw, dh);
  }, []);

  // resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = (): void => {
      const dpr = window.devicePixelRatio || 1;

      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;

      canvas.style.width = "100vw";
      canvas.style.height = "100vh";

      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }

      drawFrame(currentFrameRef.current);
    };

    resize();
    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, [drawFrame]);

  useEffect(() => {
    if (loaded) drawFrame(0);
  }, [loaded, drawFrame]);

  // smooth scroll
  useEffect(() => {
    if (!loaded) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1 - Math.pow(1 - t, 3)),
      lerp: 0.1,
      
    });

    const handleScroll = (): void => {
  const section = containerRef.current;
  if (!section) return;

  // Section position relative to viewport
  const rect = section.getBoundingClientRect();

  // Total scrollable distance inside this section
  const scrollableHeight = section.offsetHeight - window.innerHeight;

  // How much user has scrolled inside this section
  const scrolled = clamp(-rect.top, 0, scrollableHeight);

  // Progress only inside ScrollAnimation section
  const progress =
    scrollableHeight > 0 ? scrolled / scrollableHeight : 0;

  // Convert progress to frame number
  const targetIdx = Math.floor(progress * (TOTAL_FRAMES - 1));

  if (targetIdx !== currentFrameRef.current) {
    currentFrameRef.current = targetIdx;
    setFrameIndex(targetIdx);

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      drawFrame(targetIdx);
    });
  }
};

    lenis.on("scroll", handleScroll);

    let animationFrameId: number;

    const raf = (time: number): void => {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    };

    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, [loaded, drawFrame]);

 

  // animation values based on scroll/frame
  

  return (
    <div ref={containerRef} className="relative h-[220vh]">
      {/* Canvas */}
      <section className="relative h-[450vh] bg-black">
        <div className="sticky top-0 h-screen w-full">
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        </div>
      </section>

      {/* Loading */}
      {!loaded && !loadError && (
        <div className="fixed inset-0 flex items-center justify-center text-white">
          Loading...
        </div>
      )}

      {/* Error */}
      {loadError && (
        <div className="fixed inset-0 flex items-center justify-center text-red-400">
          Failed to load frames
        </div>
      )}

      {/* Animated Side Text - Upper Left Corner */}
      <div className="absolute left-12 top-1/2 -translate-y-1/2 z-30 max-w-2xl pointer-events-none">
        {/* TEXT 1 */}
        <div
          style={{
            opacity:
              clamp((frameIndex - 8) / 22, 0, 1) *
              clamp((150 - frameIndex) / 30, 0, 1),
            transform: `translateY(${
              frameIndex < 30 ? 120 - frameIndex * 4 : (frameIndex - 120) * -1
            }px) scale(${
              frameIndex < 30
                ? 0.82 + frameIndex * 0.008
                : 1 + frameIndex * 0.0008
            })`,
            filter: `blur(${
              frameIndex < 25
                ? (25 - frameIndex) / 4
                : Math.max((frameIndex - 135) / 8, 0)
            }px)`,
          }}
          className="absolute transition-all duration-700 ease-out"
        >
          <h2
            className="text-6xl md:text-7xl font-black leading-[0.95] tracking-tight
      bg-linear-to-r from-indigo-400 via-violet-500 to-fuchsia-500
      bg-clip-text text-transparent
      drop-shadow-[0_10px_30px_rgba(139,92,246,0.45)]"
          >
            Stressed <br />
            about career?
          </h2>

          <div className="mt-5 h-1.5 w-28 rounded-full bg-linear-to-r from-indigo-500 via-violet-500 to-fuchsia-500 shadow-[0_0_25px_rgba(139,92,246,0.65)]" />
        </div>

        {/* TEXT 2 */}
        <div
          style={{
            opacity: clamp((frameIndex - 145) / 30, 0, 1),
            transform: `translateY(${
              frameIndex < 145 ? 120 : Math.max(200 - frameIndex, 0)
            }px) scale(${0.9 + Math.min((frameIndex - 145) * 0.003, 0.08)})`,
            filter: `blur(${Math.max((165 - frameIndex) / 8, 0)}px)`,
          }}
          className="absolute transition-all duration-700 ease-out"
        >
          <h2
            className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight
      bg-linear-to-r from-indigo-400 via-violet-500 to-fuchsia-500
      bg-clip-text text-transparent
      drop-shadow-[0_12px_35px_rgba(139,92,246,0.5)]"
          >
            Your One Stop <br />
            Solution For All <br />
            Career Problems
          </h2>

          <div className="mt-5 h-1.5 w-36 rounded-full bg-linear-to-r from-indigo-500 via-violet-500 to-fuchsia-500 shadow-[0_0_30px_rgba(139,92,246,0.75)]" />
        </div>
      </div>

      {/* Page Content */}
      <div className="relative z-10 min-h-[200vh] p-20 text-white"></div>
    </div>
  );
}
