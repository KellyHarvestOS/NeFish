"use client";

import { useEffect, useRef } from "react";
import { FISH_BY_ID } from "@/data/fish";
import { FISH_RENDERERS } from "../fishRenderer";

export default function FishThumb({
  speciesId,
  size = 56,
}: {
  speciesId: string;
  size?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const sp = FISH_BY_ID[speciesId];
    const canvas = ref.current;
    if (!sp || !canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(size / 2, size / 2);
    // fit body length to ~78% of thumb
    const len = size * 0.78;
    ctx.scale(-1, 1); // face left to fit nicely
    FISH_RENDERERS[sp.shape]({
      ctx,
      len,
      wag: 0.2,
      t: 0,
      color: sp.color,
      accent: sp.accent,
      accent2: sp.accent2,
    });
    ctx.restore();
  }, [speciesId, size]);

  return (
    <canvas
      ref={ref}
      style={{ width: size, height: size }}
      className="shrink-0"
    />
  );
}
