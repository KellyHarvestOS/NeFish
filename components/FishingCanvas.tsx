"use client";

import { useEffect, useRef } from "react";
import {
  FISH_SPECIES,
  FishSpecies,
  RARITY_COLORS,
  rarityRank,
  fishMeta,
  OCEAN_DEPTH_M,
} from "@/data/fish";
import { parseBaitKey, QUALITY_BONUS } from "@/data/bait";
import { rodVisual } from "@/data/rods";
import { FISH_RENDERERS } from "./fishRenderer";
import { useGameStore, type DerivedStats } from "@/store/gameStore";

type Phase = "idle" | "charging" | "flying" | "fishing" | "reeling";

interface FishEntity {
  id: number;
  species: FishSpecies;
  x: number;
  depthM: number;
  baseDepthM: number;
  vx: number;
  wiggle: number;
  wiggleSpeed: number;
  scale: number;
  dir: 1 | -1;
  facing: number; // smoothed -1..1 for turning animation
  fighting: boolean;
  caught: boolean;
  panic: number;
  leaderId: number | null;
  offX: number;
  offDepth: number;
  // roaming
  tx: number; // target x
  tdepth: number; // target depth (m)
  retarget: number; // seconds until next target
  roamX: number; // horizontal roam range (px)
  dartBoost: number; // seconds of quick-dart speed boost (darting behaviour)
  prefMin: number;
  prefMax: number;
  pmin: number;
  pmax: number;
}

interface Bubble {
  x: number;
  y: number;
  r: number;
  speed: number;
  wobble: number;
}
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
}
interface Splash {
  x: number;
  r: number;
  life: number;
}
interface Plant {
  x: number;
  type: "kelp" | "grass" | "weed";
  h: number;
  blades: number;
  hue: string;
  phase: number;
}

interface Props {
  onBite: (species: FishSpecies, finish: (win: boolean) => void) => void;
}

let idCounter = 1;

/** weighted rarity roll: 70/18/8/3/0.9/0.1 */
const RARITY_WEIGHTS: [string, number][] = [
  ["Common", 70],
  ["Uncommon", 18],
  ["Rare", 8],
  ["Epic", 3],
  ["Legendary", 0.9],
  ["Mythic", 0.1],
];

function rollRarity(rareBoost: number): string {
  const weights = RARITY_WEIGHTS.map(([r, w], i) => [r, w * (1 + (rareBoost / 100) * i * 0.5)] as [string, number]);
  const total = weights.reduce((a, b) => a + b[1], 0);
  let x = Math.random() * total;
  for (const [r, w] of weights) {
    x -= w;
    if (x <= 0) return r;
  }
  return "Common";
}

export default function FishingCanvas({ onBite }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statsRef = useRef<DerivedStats>(useGameStore.getState().derived());
  const onBiteRef = useRef(onBite);
  onBiteRef.current = onBite;

  useEffect(() => {
    const unsub = useGameStore.subscribe((s) => {
      statsRef.current = s.derived();
    });
    statsRef.current = useGameStore.getState().derived();
    return unsub;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let W = 0;
    let H = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const fishes: FishEntity[] = [];
    const bubbles: Bubble[] = [];
    const particles: Particle[] = [];
    const splashes: Splash[] = [];
    const plants: Plant[] = [];
    const obstacles: { x: number; halfW: number; topY: number }[] = [];

    let waterTop = 0;
    let seabedY = 0;
    let rodBaseX = 0;
    let rodTipX = 0;
    let rodTipY = 0;
    let dockSway = 0;

    // cast state
    let phase: Phase = "idle";
    let charge = 0; // 0..1
    let castX = 0;
    let castSurfaceX = 0; // landing x on the surface
    let depthM = 6; // hook depth in meters
    let flyT = 0;
    let flyFrom = { x: 0, y: 0 };
    let flyTo = { x: 0, y: 0 };
    const hook = { x: 0, y: 0 };
    let fightActive = false;
    let biteAccum = 0;
    // reel-in animation
    let reelT = 0;
    let reelFrom = { x: 0, y: 0 };
    // aim (mouse position while charging)
    const aim = { x: 0, y: 0 };

    const depthToY = (m: number) =>
      waterTop + (m / OCEAN_DEPTH_M) * (seabedY - waterTop);
    const yToDepth = (y: number) =>
      ((y - waterTop) / (seabedY - waterTop)) * OCEAN_DEPTH_M;

    function buildPlants() {
      plants.length = 0;
      const types: Plant["type"][] = ["kelp", "grass", "weed"];
      for (let x = 20; x < W; x += 46 + Math.random() * 40) {
        const type = types[Math.floor(Math.random() * types.length)];
        plants.push({
          x,
          type,
          h: type === "kelp" ? 120 + Math.random() * 160 : 40 + Math.random() * 70,
          blades: type === "grass" ? 4 + Math.floor(Math.random() * 4) : 1,
          hue:
            type === "kelp"
              ? Math.random() > 0.5 ? "#1f7a4d" : "#2f8f5a"
              : Math.random() > 0.5 ? "#39a86a" : "#4cc77f",
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function layout() {
      W = window.innerWidth;
      H = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      waterTop = H * 0.26;
      seabedY = H - 40;
      rodBaseX = W * 0.16;
      rodTipX = W * 0.3;
      rodTipY = waterTop - H * 0.1;
      buildPlants();
    }
    layout();

    // preferred vs possible depth band: fish can appear anywhere, but
    // probability peaks at the preferred band and tapers off elsewhere.
    function bandsOf(species: FishSpecies) {
      const meta = fishMeta(species.id);
      const rank = rarityRank(species.rarity);
      const spread = 12 + rank * 14 + species.size * 0.08;
      return {
        prefMin: meta.minM,
        prefMax: meta.maxM,
        pmin: Math.max(1, meta.minM - spread),
        pmax: Math.min(OCEAN_DEPTH_M - 5, meta.maxM + spread),
      };
    }
    function weightAt(d: number, b: ReturnType<typeof bandsOf>) {
      if (d >= b.prefMin && d <= b.prefMax) return 1; // 100%
      const near = (b.prefMax - b.prefMin) * 0.5 + 14;
      if (d >= b.prefMin - near && d <= b.prefMax + near) return 0.5; // ~50%
      return 0.15; // atypical depth
    }
    function sampleDepth(b: ReturnType<typeof bandsOf>) {
      for (let i = 0; i < 10; i++) {
        const d = b.pmin + Math.random() * (b.pmax - b.pmin);
        if (Math.random() < weightAt(d, b)) return d;
      }
      return (b.prefMin + b.prefMax) / 2;
    }

    const SCHOOL_SIZE: Record<string, [number, number]> = {
      sardine: [3, 5],
      anchovy: [4, 5],
      herring: [3, 5],
      horsemackerel: [2, 4],
      seabream: [2, 3],
    };

    function countRarity(r: string) {
      return fishes.filter((f) => f.species.rarity === r && !f.caught).length;
    }

    function spawnFish(initial = false) {
      const stats = statsRef.current;
      let rarity = rollRarity(stats.rareChance);
      // only ONE Legendary and ONE Mythic on screen — makes rare encounters special
      if (rarity === "Mythic" && countRarity("Mythic") >= 1) rarity = "Legendary";
      if (rarity === "Legendary" && countRarity("Legendary") >= 1) rarity = "Epic";
      const pool = FISH_SPECIES.filter((f) => f.rarity === rarity);
      if (!pool.length) return;
      const species = pool[Math.floor(Math.random() * pool.length)];
      const b = bandsOf(species);
      const rank = rarityRank(species.rarity);
      const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
      const depth = sampleDepth(b);
      const x = initial ? Math.random() * W : dir === 1 ? -species.size : W + species.size;
      const speedJitter = 0.85 + Math.random() * 0.3;
      // big & rare fish roam far (migrate across the whole ocean), small fish stay local
      const roamX = rank >= 4 ? W * 1.25 : 120 + species.size * 3 + rank * 90;
      const make = (ox: number, od: number, leaderId: number | null): FishEntity => ({
        id: idCounter++,
        species,
        x: x + ox,
        depthM: Math.max(1, depth + od),
        baseDepthM: depth + od,
        vx: dir * species.speed * 0.012 * speedJitter,
        wiggle: Math.random() * Math.PI * 2,
        wiggleSpeed:
          (species.swim === "dart" ? 11 : species.swim === "cruise" ? 7 : 4) + Math.random() * 1.5,
        scale: 0.85 + Math.random() * 0.3,
        dir,
        facing: dir,
        fighting: false,
        caught: false,
        panic: 0,
        leaderId,
        offX: ox,
        offDepth: od,
        tx: x + ox + dir * roamX * 0.5,
        tdepth: depth + od,
        retarget: 5 + Math.random() * 15,
        roamX,
        dartBoost: 0,
        prefMin: b.prefMin,
        prefMax: b.prefMax,
        pmin: b.pmin,
        pmax: b.pmax,
      });
      const leader = make(0, 0, null);
      fishes.push(leader);
      // schools allowed ONLY for Common/Uncommon schooling species
      const canSchool =
        (species.rarity === "Common" || species.rarity === "Uncommon") && species.schooling;
      if (canSchool) {
        const [lo, hi] = SCHOOL_SIZE[species.id] ?? [2, 4];
        const total = lo + Math.floor(Math.random() * (hi - lo + 1)); // 2..5
        for (let k = 1; k < total; k++) {
          const ox = -dir * k * species.size * 1.05 + (Math.random() - 0.5) * species.size;
          const od = (Math.random() - 0.5) * 2.5;
          fishes.push(make(ox, od, leader.id));
        }
      }
    }
    for (let i = 0; i < 16; i++) spawnFish(true);

    function spawnBubble(x?: number, y?: number) {
      bubbles.push({
        x: x ?? Math.random() * W,
        y: y ?? H + 10,
        r: 1.5 + Math.random() * 4,
        speed: 16 + Math.random() * 40,
        wobble: Math.random() * Math.PI * 2,
      });
    }
    for (let i = 0; i < 34; i++)
      spawnBubble(Math.random() * W, waterTop + Math.random() * (H - waterTop));

    function burst(x: number, y: number, color: string, count: number) {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 40 + Math.random() * 170;
        particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, life: 0, max: 0.6 + Math.random() * 0.6, color, size: 2 + Math.random() * 4 });
      }
    }

    // ---------- bait helpers ----------
    function currentBaitCovers(speciesId: string): boolean {
      const st = useGameStore.getState();
      const key = st.equippedBait;
      if (!key || (st.baitStock[key] ?? 0) <= 0) return false;
      const parsed = parseBaitKey(key);
      return !!parsed && parsed.group.species.includes(speciesId);
    }
    function baitBiteBonus(): number {
      const st = useGameStore.getState();
      const key = st.equippedBait;
      if (!key) return 0;
      const parsed = parseBaitKey(key);
      return parsed ? QUALITY_BONUS[parsed.quality] : 0;
    }

    // ---------- audio ----------
    let audioCtx: AudioContext | null = null;
    function ensureAudio() {
      try {
        const AC =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (!audioCtx) audioCtx = new AC();
        if (audioCtx.state === "suspended") void audioCtx.resume();
      } catch {
        /* ignore */
      }
    }
    /** layered water "plop": a pitch-dropping body + a filtered splash burst */
    function playSplash() {
      ensureAudio();
      const a = audioCtx;
      if (!a) return;
      try {
        const now = a.currentTime;

        // 1) plop body — sine dropping in pitch
        const osc = a.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.16);
        const og = a.createGain();
        og.gain.setValueAtTime(0.0001, now);
        og.gain.exponentialRampToValueAtTime(0.45, now + 0.012);
        og.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
        osc.connect(og).connect(a.destination);
        osc.start(now);
        osc.stop(now + 0.24);

        // 2) splash — short noise burst through a sweeping band-pass
        const dur = 0.3;
        const buffer = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
        const d = buffer.getChannelData(0);
        for (let i = 0; i < d.length; i++)
          d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
        const src = a.createBufferSource();
        src.buffer = buffer;
        const bp = a.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 0.7;
        bp.frequency.setValueAtTime(1600, now);
        bp.frequency.exponentialRampToValueAtTime(500, now + 0.26);
        const ng = a.createGain();
        ng.gain.setValueAtTime(0.28, now);
        ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        src.connect(bp).connect(ng).connect(a.destination);
        src.start(now);
      } catch {
        /* ignore */
      }
    }

    // ---------- input ----------
    /** landing point + angle for the current aim & power */
    function computeCast(power: number) {
      const surfaceY = waterTop + 4;
      const ax = aim.x - rodTipX;
      let ay = aim.y - rodTipY;
      if (ay < 8) ay = 8; // never cast upward — keep the downward hemisphere
      const ang = Math.atan2(ay, ax); // 0 = right, PI/2 = down, PI = left (under dock)
      const maxRange = W * 0.92;
      const range = (0.16 + power * 0.84) * maxRange;
      let lx = rodTipX + Math.cos(ang) * range;
      lx = Math.max(14, Math.min(W - 14, lx));
      return { lx, surfaceY, ang, range };
    }

    function startReel() {
      // pull the line back to the rod tip, then hand control back for a new cast
      if (phase === "fishing" || phase === "flying") {
        reelFrom = { x: hook.x, y: hook.y };
        reelT = 0;
        phase = "reeling";
      } else if (phase === "charging") {
        phase = "idle";
      }
      biteAccum = 0;
    }
    function panelOpen() {
      const s = useGameStore.getState();
      return (
        s.shopOpen ||
        s.upgradesOpen ||
        s.inventoryOpen ||
        s.collectionOpen ||
        s.baitOpen ||
        !!s.fight
      );
    }
    function onMove(e: MouseEvent) {
      aim.x = e.clientX;
      aim.y = e.clientY;
    }
    function onDown(e?: MouseEvent) {
      ensureAudio(); // unlock audio on the first user gesture
      if (fightActive || phase === "flying" || phase === "reeling" || panelOpen()) return;
      if (e) {
        aim.x = e.clientX;
        aim.y = e.clientY;
      }
      phase = "charging";
      charge = 0;
    }
    function onUp() {
      if (phase !== "charging" || panelOpen()) {
        if (phase === "charging") phase = "idle";
        return;
      }
      const c = computeCast(charge);
      castX = c.lx;
      castSurfaceX = c.lx;
      flyFrom = { x: rodTipX, y: rodTipY + dockSway };
      flyTo = { x: c.lx, y: c.surfaceY };
      phase = "flying";
      flyT = 0;
      depthM = 5;
    }
    function adjustDepth(delta: number) {
      if (phase !== "fishing") return;
      const reach = statsRef.current.depthReach;
      depthM = Math.max(2, Math.min(reach, depthM + delta));
    }
    function onWheel(e: WheelEvent) {
      if (phase === "fishing") {
        e.preventDefault();
        adjustDepth(e.deltaY > 0 ? 4 : -4);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "w" || e.key === "W" || e.key === "ц" || e.key === "Ц") adjustDepth(-4);
      else if (e.key === "s" || e.key === "S" || e.key === "ы" || e.key === "Ы") adjustDepth(4);
      else if (e.key === "r" || e.key === "R" || e.key === "к" || e.key === "К") startReel();
    }
    function onTouchStart(e: TouchEvent) {
      if (e.touches[0]) {
        aim.x = e.touches[0].clientX;
        aim.y = e.touches[0].clientY;
      }
      onDown();
    }
    function onTouchMove(e: TouchEvent) {
      if (e.touches[0]) {
        aim.x = e.touches[0].clientX;
        aim.y = e.touches[0].clientY;
      }
    }
    function onTouchEnd() {
      onUp();
    }

    aim.x = rodTipX + 220;
    aim.y = waterTop + 140;

    // Game input is scoped to the CANVAS so it never steals clicks from the
    // HUD / menus that sit on top of it. Release is on window so a drag that
    // ends off-canvas still completes the cast.
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    const onResize = () => {
      layout();
      rebuildObstacles();
    };
    window.addEventListener("resize", onResize);

    // ---------- environment drawing ----------
    function drawSky() {
      const g = ctx.createLinearGradient(0, 0, 0, waterTop);
      g.addColorStop(0, "#2f9bea");
      g.addColorStop(0.55, "#6fc4ff");
      g.addColorStop(1, "#cdeeff");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, waterTop + 2);
      const sx = W * 0.8, sy = waterTop * 0.4;
      const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 180);
      sg.addColorStop(0, "rgba(255,255,235,0.95)");
      sg.addColorStop(0.3, "rgba(255,247,200,0.55)");
      sg.addColorStop(1, "rgba(255,247,200,0)");
      ctx.fillStyle = sg;
      ctx.fillRect(W * 0.5, 0, W * 0.5, waterTop);
    }
    const clouds = Array.from({ length: 6 }, () => ({ x: Math.random(), y: 0.1 + Math.random() * 0.5, s: 0.6 + Math.random() * 1.2, spd: 0.004 + Math.random() * 0.01 }));
    function drawClouds() {
      for (const c of clouds) {
        c.x += c.spd * 0.016;
        if (c.x > 1.2) c.x = -0.2;
        const cx = c.x * W, cy = c.y * waterTop, s = c.s * 22;
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.beginPath();
        ctx.arc(cx, cy, s, 0, Math.PI * 2);
        ctx.arc(cx + s, cy + 4, s * 0.85, 0, Math.PI * 2);
        ctx.arc(cx - s, cy + 6, s * 0.7, 0, Math.PI * 2);
        ctx.arc(cx + s * 0.4, cy - s * 0.5, s * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    function drawWater() {
      const g = ctx.createLinearGradient(0, waterTop, 0, H);
      g.addColorStop(0, "#67d0ea");
      g.addColorStop(0.22, "#2c9ad0");
      g.addColorStop(0.5, "#1574ad");
      g.addColorStop(0.78, "#0c4d80");
      g.addColorStop(1, "#06223f");
      ctx.fillStyle = g;
      ctx.fillRect(0, waterTop, W, H - waterTop);
    }
    // ocean layers + thermoclines
    const LAYERS = [
      { m: 0, label: "Эпипелагиаль" },
      { m: 30, label: "Термоклин" },
      { m: 80, label: "Мезопелагиаль" },
      { m: 130, label: "Глубина" },
    ];
    function drawLayers(t: number) {
      ctx.save();
      for (let i = 1; i < LAYERS.length; i++) {
        const ly = depthToY(LAYERS[i].m);
        // hazy band
        const grad = ctx.createLinearGradient(0, ly - 16, 0, ly + 16);
        grad.addColorStop(0, "rgba(255,255,255,0)");
        grad.addColorStop(0.5, "rgba(180,220,255,0.06)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, ly - 16, W, 32);
        // wavy thermocline line
        ctx.strokeStyle = "rgba(190,225,255,0.12)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 12) {
          const yy = ly + Math.sin(x * 0.01 + t * 0.0006 + i) * 4;
          if (x === 0) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        }
        ctx.stroke();
        // label
        ctx.fillStyle = "rgba(220,240,255,0.22)";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(`${LAYERS[i].label} · ${LAYERS[i].m}м`, W - 14, ly - 4);
      }
      ctx.restore();
    }

    function drawSunRays(t: number) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 7; i++) {
        const baseX = W * (0.1 + i * 0.12) + Math.sin(t * 0.0003 + i) * 24;
        const spread = 50 + i * 10;
        ctx.beginPath();
        ctx.moveTo(baseX, waterTop);
        ctx.lineTo(baseX + spread, H);
        ctx.lineTo(baseX + spread + 46, H);
        ctx.lineTo(baseX + 34, waterTop);
        ctx.closePath();
        const rg = ctx.createLinearGradient(baseX, waterTop, baseX, H);
        rg.addColorStop(0, "rgba(255,255,220,0.12)");
        rg.addColorStop(1, "rgba(255,255,220,0)");
        ctx.fillStyle = rg;
        ctx.fill();
      }
      ctx.restore();
    }
    function drawWaves(t: number) {
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 8) {
        const y = waterTop + Math.sin(x * 0.02 + t * 0.002) * 4 + Math.sin(x * 0.05 + t * 0.003) * 2;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 32; i++) {
        const gx = (i / 32) * W + Math.sin(t * 0.001 + i) * 14;
        const gy = waterTop + 6 + Math.sin(t * 0.004 + i * 2) * 3;
        const a = 0.3 + 0.3 * Math.sin(t * 0.005 + i);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, a)})`;
        ctx.fillRect(gx, gy, 6 + Math.sin(i) * 3, 1.5);
      }
      ctx.restore();
    }
    function drawPlant(pl: Plant, t: number) {
      const baseY = H - 14;
      const sway = Math.sin(t * 0.0012 + pl.phase) * (pl.type === "kelp" ? 18 : 8);
      ctx.lineCap = "round";
      if (pl.type === "kelp") {
        ctx.strokeStyle = pl.hue;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(pl.x, baseY);
        ctx.bezierCurveTo(pl.x + sway * 0.4, baseY - pl.h * 0.4, pl.x + sway, baseY - pl.h * 0.7, pl.x + sway * 1.4, baseY - pl.h);
        ctx.stroke();
        ctx.fillStyle = pl.hue;
        for (let s = 0.2; s < 1; s += 0.2) {
          ctx.beginPath();
          ctx.ellipse(pl.x + sway * 1.4 * s, baseY - pl.h * s, 10, 4, -0.5 + sway * 0.01, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (pl.type === "grass") {
        for (let b = 0; b < pl.blades; b++) {
          const bx = pl.x + (b - pl.blades / 2) * 5;
          const bh = pl.h * (0.7 + (b % 2) * 0.3);
          ctx.strokeStyle = pl.hue;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(bx, baseY);
          ctx.quadraticCurveTo(bx + sway * 0.6, baseY - bh * 0.6, bx + sway, baseY - bh);
          ctx.stroke();
        }
      } else {
        ctx.strokeStyle = pl.hue;
        ctx.lineWidth = 4;
        for (let b = -2; b <= 2; b++) {
          ctx.beginPath();
          ctx.moveTo(pl.x, baseY);
          ctx.quadraticCurveTo(pl.x + b * 8 + sway * 0.5, baseY - pl.h * 0.6, pl.x + b * 12 + sway, baseY - pl.h);
          ctx.stroke();
        }
      }
    }
    const rocks = Array.from({ length: 6 }, (_, i) => ({ x: (i + 0.5) / 6, w: 30 + Math.random() * 40, h: 18 + Math.random() * 22 }));
    const corals = Array.from({ length: 5 }, (_, i) => ({ x: (i + 0.3) / 5 + 0.04, c: ["#ff7eb3", "#ff9e6d", "#c77dff", "#ffd36e"][i % 4] }));
    const shells = Array.from({ length: 7 }, () => ({ x: Math.random(), c: Math.random() > 0.5 ? "#ffe2c2" : "#ffd0d8" }));
    const stars = Array.from({ length: 4 }, () => ({ x: Math.random(), c: Math.random() > 0.5 ? "#ff7a59" : "#ffb15a" }));

    // build collision obstacles from seabed decor so fish never swim through them
    function rebuildObstacles() {
      obstacles.length = 0;
      const baseY = H - 14;
      for (const pl of plants) {
        const reach = pl.type === "kelp" ? pl.h * 0.85 : pl.h * 0.6;
        obstacles.push({
          x: pl.x,
          halfW: pl.type === "kelp" ? 18 : 12,
          topY: baseY - reach,
        });
      }
      for (const r of rocks) obstacles.push({ x: r.x * W, halfW: r.w, topY: H - 18 - r.h });
      for (const c of corals) obstacles.push({ x: c.x * W, halfW: 22, topY: H - 52 });
    }
    rebuildObstacles();

    function drawSeabed(t: number) {
      const bedY = seabedY;
      const sg = ctx.createLinearGradient(0, bedY, 0, H);
      sg.addColorStop(0, "#103a5e");
      sg.addColorStop(1, "#0a2238");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.moveTo(0, bedY + 12);
      for (let x = 0; x <= W; x += 40) ctx.lineTo(x, bedY + Math.sin(x * 0.02) * 8);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.fill();
      for (const r of rocks) {
        const x = r.x * W;
        ctx.fillStyle = "#2e4a63";
        ctx.beginPath();
        ctx.ellipse(x, H - 18, r.w, r.h, 0, Math.PI, 0);
        ctx.fill();
      }
      for (const c of corals) {
        const x = c.x * W;
        ctx.strokeStyle = c.c;
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        for (let k = -2; k <= 2; k++) {
          ctx.beginPath();
          ctx.moveTo(x + k * 9, H - 16);
          ctx.quadraticCurveTo(x + k * 12, H - 44, x + k * 9 + (k > 0 ? 8 : -8), H - 52);
          ctx.stroke();
        }
      }
      for (const s of shells) {
        const x = s.x * W;
        ctx.fillStyle = s.c;
        ctx.beginPath();
        ctx.arc(x, H - 8, 7, Math.PI, 0);
        ctx.fill();
      }
      for (const st of stars) {
        const x = st.x * W, y = H - 12;
        ctx.fillStyle = st.c;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
          const rad = i % 2 === 0 ? 9 : 4;
          const px = x + Math.cos(a) * rad, py = y + Math.sin(a) * rad * 0.7;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      }
      for (const pl of plants) drawPlant(pl, t);
    }
    function drawDock(t: number) {
      dockSway = Math.sin(t * 0.0015) * 2.2;
      const deckW = W * 0.34, deckY = waterTop - 24 + dockSway, deckH = 24;
      ctx.save();
      ctx.fillStyle = "rgba(0,30,60,0.18)";
      ctx.beginPath();
      ctx.ellipse(deckW * 0.5, waterTop + 14, deckW * 0.55, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#6e4423";
      for (let x = 30; x < deckW; x += 110) ctx.fillRect(x, deckY + deckH, 12, waterTop + 40 - (deckY + deckH));
      const pg = ctx.createLinearGradient(0, deckY, 0, deckY + deckH);
      pg.addColorStop(0, "#c08a4e");
      pg.addColorStop(1, "#9a6a35");
      ctx.fillStyle = pg;
      ctx.fillRect(-4, deckY, deckW, deckH);
      ctx.strokeStyle = "#7c5328";
      ctx.lineWidth = 2;
      for (let x = 0; x < deckW; x += 26) {
        ctx.beginPath();
        ctx.moveTo(x, deckY);
        ctx.lineTo(x, deckY + deckH);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(-4, deckY + deckH - 5, deckW, 5);
      ctx.fillStyle = "#d8a566";
      ctx.fillRect(-4, deckY, deckW, 3);
      ctx.restore();
    }

    function drawBaitOnHook(hx: number, hy: number) {
      const st = useGameStore.getState();
      const key = st.equippedBait;
      if (!key) return;
      const parsed = parseBaitKey(key);
      if (!parsed) return;
      const g = parsed.group;
      const wob = Math.sin(animT * 4) * 0.25; // gentle sway
      ctx.save();
      ctx.translate(hx, hy + 6);
      ctx.rotate(wob);
      ctx.fillStyle = g.color;
      const m = g.model;
      if (m === "worm" || m === "deepworm") {
        if (m === "deepworm") {
          ctx.shadowColor = g.accent;
          ctx.shadowBlur = 12;
        }
        ctx.strokeStyle = g.color;
        ctx.lineWidth = 3.4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(5 + wob * 6, 5, -2, 9);
        ctx.quadraticCurveTo(-7, 13, 1, 17);
        ctx.stroke();
        if (m === "deepworm") {
          ctx.fillStyle = g.accent;
          for (let k = 0; k < 3; k++) {
            ctx.beginPath();
            ctx.arc(-2 + k, 4 + k * 5, 1.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (m === "shrimp" || m === "goldshrimp") {
        if (m === "goldshrimp") {
          ctx.shadowColor = g.accent;
          ctx.shadowBlur = 12;
        }
        ctx.beginPath();
        ctx.arc(0, 6, 5.5, Math.PI * 0.1, Math.PI * 1.6);
        ctx.fill();
        ctx.strokeStyle = g.accent;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(2, 2); ctx.lineTo(8, -4);
        ctx.moveTo(-2, 2); ctx.lineTo(-7, -5);
        ctx.stroke();
      } else if (m === "minnow") {
        ctx.beginPath();
        ctx.ellipse(0, 6, 7, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = g.color;
        ctx.beginPath();
        ctx.moveTo(-7, 6); ctx.lineTo(-11, 3); ctx.lineTo(-11, 9);
        ctx.fill();
      } else if (m === "crab") {
        ctx.beginPath();
        ctx.ellipse(0, 7, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = g.color;
        ctx.lineWidth = 1.4;
        for (let s = -1; s <= 1; s += 2) {
          for (let l = 0; l < 3; l++) {
            ctx.beginPath();
            ctx.moveTo(s * 4, 6 + l * 1.5);
            ctx.lineTo(s * 10, 4 + l * 3);
            ctx.stroke();
          }
          ctx.beginPath(); // claw
          ctx.arc(s * 9, 3, 2.2, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (m === "squid" || m === "glowsquid") {
        if (m === "glowsquid") {
          ctx.shadowColor = g.accent;
          ctx.shadowBlur = 16;
        }
        ctx.beginPath();
        ctx.ellipse(0, 4, 5, 7.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = g.color;
        ctx.lineWidth = 1.6;
        for (let k = -2; k <= 2; k++) {
          ctx.beginPath();
          ctx.moveTo(k * 2, 10);
          ctx.quadraticCurveTo(k * 2 + wob * 8, 15, k * 3, 19);
          ctx.stroke();
        }
      } else if (m === "jellyfish") {
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        ctx.arc(0, 4, 6, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = g.accent;
        ctx.lineWidth = 1.3;
        for (let k = -2; k <= 2; k++) {
          ctx.beginPath();
          ctx.moveTo(k * 2.5, 5);
          ctx.quadraticCurveTo(k * 2.5 + wob * 10, 12, k * 2.5, 18);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      } else {
        // legendary — bleeding bait with glow
        ctx.shadowColor = g.accent;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.ellipse(0, 6, 11, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = g.color;
        ctx.beginPath();
        ctx.moveTo(-11, 6); ctx.lineTo(-16, 2); ctx.lineTo(-16, 10);
        ctx.fill();
      }
      ctx.restore();
    }

    // dashed trajectory preview while charging
    function drawCastPreview() {
      if (phase !== "charging") return;
      const c = computeCast(charge);
      const from = { x: rodTipX, y: rodTipY + dockSway };
      const apex = 80 + Math.abs(c.lx - from.x) * 0.18;
      ctx.save();
      ctx.setLineDash([6, 7]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.beginPath();
      for (let i = 0; i <= 24; i++) {
        const p = i / 24;
        const x = from.x + (c.lx - from.x) * p;
        const y = from.y + (c.surfaceY - from.y) * p - Math.sin(p * Math.PI) * apex;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      // landing marker
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(c.lx, c.surfaceY, 12, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${Math.round(charge * 100)}%`, c.lx, c.surfaceY - 10);
      ctx.restore();
    }

    function drawRodAndLine(t: number) {
      const rv = rodVisual(useGameStore.getState().equipped.rod);
      const baseX = rodBaseX;
      const baseY = waterTop - 36 + dockSway;
      // tip is anchored to the physics tip; lenFactor only bends the shaft arc
      const tipX = rodTipX;
      const tipY = rodTipY + dockSway;
      const arcLift = 28 * rv.lenFactor;
      ctx.save();
      ctx.lineCap = "round";

      if (rv.glow) {
        ctx.shadowColor = rv.glow;
        ctx.shadowBlur = 14 + (rv.particles ? Math.sin(t * 4) * 6 : 0);
      }
      // shaft
      ctx.strokeStyle = rv.body2;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.quadraticCurveTo((baseX + tipX) / 2, baseY - arcLift, tipX, tipY);
      ctx.stroke();
      ctx.strokeStyle = rv.body;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.quadraticCurveTo((baseX + tipX) / 2, baseY - arcLift, tipX, tipY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      const cx = (baseX + tipX) / 2;
      const cy = baseY - arcLift;
      const onShaft = (p: number) => ({
        x: (1 - p) * (1 - p) * baseX + 2 * (1 - p) * p * cx + p * p * tipX,
        y: (1 - p) * (1 - p) * baseY + 2 * (1 - p) * p * cy + p * p * tipY,
      });
      // line guides (rings along the shaft)
      ctx.fillStyle = rv.guide;
      for (let g = 0.35; g < 1; g += 0.22) {
        const pt = onShaft(g);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y - 2, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      // gold carving accents
      if (rv.gold) {
        ctx.strokeStyle = "#ffe9a0";
        ctx.lineWidth = 1.2;
        for (let g = 0.2; g < 0.95; g += 0.18) {
          const pt = onShaft(g);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      // reel
      ctx.fillStyle = rv.reel;
      ctx.beginPath();
      ctx.arc(baseX + 2, baseY + 6, rv.reelSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.beginPath();
      ctx.arc(baseX + 2, baseY + 6, rv.reelSize * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // mythic rod particles from the tip
      if (rv.particles && Math.random() < 0.4) {
        particles.push({
          x: tipX,
          y: tipY,
          vx: (Math.random() - 0.5) * 14,
          vy: -8 - Math.random() * 10,
          life: 0,
          max: 0.8,
          color: rv.glow || "#b15cff",
          size: 1.5 + Math.random() * 2,
        });
      }

      // fishing line + hook (out of idle/charging)
      if (phase === "flying" || phase === "fishing" || phase === "reeling") {
        ctx.strokeStyle = "rgba(255,255,255,0.78)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.quadraticCurveTo((tipX + hook.x) / 2, hook.y - 12, hook.x, hook.y);
        ctx.stroke();
        ctx.strokeStyle = "#e8edf2";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(hook.x, hook.y + 4, 4, Math.PI * 0.1, Math.PI * 1.5);
        ctx.stroke();
        if (phase === "fishing") drawBaitOnHook(hook.x, hook.y);
      }
      ctx.restore();
    }

    // world-space god-ray beam for Legendary fish (heavy / cinematic)
    function drawGodRay(x: number, y: number, len: number, t: number) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const w = len * 0.6 + Math.sin(t * 0.7) * 8;
      const g = ctx.createLinearGradient(x, waterTop, x, y);
      g.addColorStop(0, "rgba(255,250,210,0.12)");
      g.addColorStop(1, "rgba(255,250,210,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x - w * 0.3, waterTop);
      ctx.lineTo(x + w * 0.3, waterTop);
      ctx.lineTo(x + w, y + len * 0.3);
      ctx.lineTo(x - w, y + len * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // world-space supernatural aura for Mythic fish (anomaly)
    function drawMythicAura(f: FishEntity, y: number, len: number, t: number) {
      const x = f.x;
      ctx.save();
      if (f.species.effect === "diamond") {
        // prismatic rotating flares + glowing core
        ctx.globalCompositeOperation = "lighter";
        const rainbow = ["#ff5e7e", "#ffd24a", "#7dffa0", "#5fd0ff", "#c98bff"];
        for (let i = 0; i < rainbow.length; i++) {
          const a = t * 0.8 + (i / rainbow.length) * Math.PI * 2;
          ctx.strokeStyle = rainbow[i];
          ctx.globalAlpha = 0.35;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(a) * len * 0.4, y + Math.sin(a) * len * 0.4);
          ctx.lineTo(x + Math.cos(a) * len * 0.95, y + Math.sin(a) * len * 0.95);
          ctx.stroke();
        }
        const core = ctx.createRadialGradient(x, y, 0, x, y, len * 0.5);
        core.addColorStop(0, "rgba(255,255,255,0.5)");
        core.addColorStop(1, "rgba(190,234,255,0)");
        ctx.globalAlpha = 0.6 + Math.sin(t * 4) * 0.2;
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(x, y, len * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (f.species.effect === "radioactive") {
        // toxic green pulsing glow
        ctx.globalCompositeOperation = "lighter";
        const pulse = 0.4 + Math.sin(t * 6 + f.id) * 0.25;
        const gg = ctx.createRadialGradient(x, y, len * 0.2, x, y, len * 0.9);
        gg.addColorStop(0, `rgba(120,255,60,${0.35 * pulse})`);
        gg.addColorStop(1, "rgba(120,255,60,0)");
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.arc(x, y, len * 0.9, 0, Math.PI * 2);
        ctx.fill();
      } else if (f.species.effect === "darkmatter") {
        // gravitational ripples + galaxy swirl
        ctx.strokeStyle = "rgba(170,90,255,0.22)";
        ctx.lineWidth = 1.5;
        for (let r = 1; r <= 3; r++) {
          const rr = len * (0.5 + r * 0.22) + Math.sin(t * 1.5 + r) * 4;
          ctx.beginPath();
          ctx.ellipse(x, y, rr, rr * 0.7, t * 0.3 * r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // full, fully-visible fish with depth haze, turning animation, rarity glow
    function drawFish(f: FishEntity, t: number) {
      const sp = f.species;
      const rank = rarityRank(sp.rarity);
      const y = depthToY(f.depthM);
      const len = sp.size * f.scale;
      const haze = Math.max(0.5, 1 - f.depthM / 320);

      // world-space ambient effects (not mirrored by facing)
      if (rank === 4) drawGodRay(f.x, y, len, t + f.id);
      if (sp.effect) drawMythicAura(f, y, len, t);

      ctx.save();
      ctx.translate(f.x, y);
      const fx = Math.abs(f.facing) < 0.12 ? (f.facing < 0 ? -0.12 : 0.12) : f.facing;
      ctx.scale(fx, 1);
      ctx.globalAlpha = haze;

      // cheap glow halo for valuable fish (radial gradient, NOT shadowBlur)
      if (rank >= 3 && !sp.effect) {
        const gc = RARITY_COLORS[sp.rarity];
        const halo = ctx.createRadialGradient(0, 0, len * 0.2, 0, 0, len * 0.72);
        halo.addColorStop(0, gc + "55");
        halo.addColorStop(1, gc + "00");
        ctx.globalAlpha = haze;
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.ellipse(0, 0, len * 0.72, len * 0.46, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      FISH_RENDERERS[sp.shape]({
        ctx,
        len,
        wag: Math.sin(f.wiggle) * 0.5,
        t,
        color: sp.color,
        accent: sp.accent,
        accent2: sp.accent2,
      });

      // specular sheen along the back for a wet, scaly look
      if (rank === 0) {
        const sh = (Math.sin(t * 3 + f.id) + 1) * 0.5;
        ctx.globalAlpha = haze * (0.15 + sh * 0.4);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(len * 0.08, -len * 0.12, len * 0.3, len * 0.045, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.restore();

      // rarity badge ring for Epic+ so value reads at a glance
      if (rank >= 3) {
        ctx.save();
        ctx.globalAlpha = 0.5 * haze;
        ctx.strokeStyle = RARITY_COLORS[sp.rarity];
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(f.x, y, len * 0.62, len * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // ---------- update ----------
    let last = performance.now();
    let bubbleTimer = 0, spawnTimer = 0, raf = 0;
    let animT = 0;
    let baitParticleTimer = 0;

    function beginFight(f: FishEntity) {
      f.fighting = true;
      fightActive = true;
      biteAccum = 0;
      burst(f.x, depthToY(f.depthM), "#bff3ff", 14);
      splashes.push({ x: f.x, r: 4, life: 0 });
      // the rest of the school panics and scatters
      const groupId = f.leaderId ?? f.id;
      for (const o of fishes) {
        if (o === f || o.caught || o.fighting) continue;
        if (o.id === groupId || o.leaderId === groupId) {
          o.leaderId = null; // break formation
          o.panic = 1.4;
          o.dir = o.x < f.x ? -1 : 1;
        }
      }
      onBiteRef.current(f.species, (win: boolean) => {
        fightActive = false;
        f.fighting = false;
        if (win) {
          f.caught = true;
          burst(f.x, depthToY(f.depthM), RARITY_COLORS[f.species.rarity], 30);
        } else {
          f.panic = 1.6;
          useGameStore.getState().loseBaitOnEscape();
        }
        // the line is always reeled all the way back in — a new cast is required
        startReel();
      });
    }

    function update(dt: number, tms: number) {
      const t = tms / 1000;
      animT = t;
      const stats = statsRef.current;

      // charge
      if (phase === "charging") charge = Math.min(1, charge + dt / 1.2);

      // flying arc (physical parabola to the landing point)
      if (phase === "flying") {
        flyT += dt / 0.62;
        const p = Math.min(1, flyT);
        hook.x = flyFrom.x + (flyTo.x - flyFrom.x) * p;
        const apex = 80 + Math.abs(flyTo.x - flyFrom.x) * 0.18;
        const arc = -Math.sin(p * Math.PI) * apex;
        hook.y = flyFrom.y + (flyTo.y - flyFrom.y) * p + arc;
        if (p >= 1) {
          phase = "fishing";
          castX = flyTo.x;
          // impact: splash + expanding rings + sound
          splashes.push({ x: castX, r: 3, life: 0 });
          splashes.push({ x: castX, r: 9, life: 0 });
          burst(castX, waterTop + 4, "#dff4ff", 10);
          playSplash();
        }
      }
      // reel-in animation: line returns to the rod tip, then control is freed
      if (phase === "reeling") {
        reelT += dt / 0.6;
        const p = Math.min(1, reelT);
        const tip = { x: rodTipX, y: rodTipY + dockSway };
        hook.x = reelFrom.x + (tip.x - reelFrom.x) * p;
        hook.y = reelFrom.y + (tip.y - reelFrom.y) * p;
        if (p >= 1) phase = "idle";
      }
      if (phase === "fishing") {
        hook.x = castX;
        hook.y = depthToY(depthM);
      }

      // spawn
      spawnTimer += dt;
      if (spawnTimer > 1.5 && fishes.length < 28) {
        spawnTimer = 0;
        spawnFish(false);
      }

      // bite detection
      if (phase === "fishing" && !fightActive) {
        for (const f of fishes) {
          if (f.caught || f.fighting || f.panic > 0) continue;
          if (!currentBaitCovers(f.species.id)) continue;
          if (Math.abs(f.x - castX) > 55) continue;
          if (Math.abs(f.depthM - depthM) > 6) continue;
          // bite chance per second; rarer fish are warier
          const rank = rarityRank(f.species.rarity);
          const rate = (0.55 + stats.luck / 100 + baitBiteBonus()) / (1 + rank * 0.6);
          biteAccum += rate * dt;
          if (biteAccum > 1) {
            beginFight(f);
            break;
          }
          // curiosity: nudge toward hook
          f.x += (castX - f.x) * dt * 0.4;
          f.depthM += (depthM - f.depthM) * dt * 0.4;
        }
      }

      // glowing baits emit particles in the water
      if (phase === "fishing") {
        baitParticleTimer += dt;
        if (baitParticleTimer > 0.12) {
          baitParticleTimer = 0;
          const key = useGameStore.getState().equippedBait;
          const parsed = key ? parseBaitKey(key) : null;
          const m = parsed?.group.model;
          if (m === "glowsquid" || m === "deepworm" || m === "legendary" || m === "goldshrimp") {
            const col = m === "legendary" ? "#ff5a5a" : parsed!.group.accent;
            particles.push({
              x: hook.x + (Math.random() - 0.5) * 6,
              y: hook.y + 6,
              vx: (Math.random() - 0.5) * 10,
              vy: -6 - Math.random() * 12,
              life: 0,
              max: 0.9 + Math.random() * 0.7,
              color: col,
              size: 1.5 + Math.random() * 2,
            });
          }
        }
      }

      // fish movement
      for (let i = fishes.length - 1; i >= 0; i--) {
        const f = fishes[i];
        const sp = f.species;
        const rank = rarityRank(sp.rarity);
        f.wiggle += f.wiggleSpeed * dt;

        if (f.caught) {
          // reel up to rod tip
          const tx = rodTipX, ty = rodTipY + dockSway;
          const yy = depthToY(f.depthM);
          f.x += (tx - f.x) * Math.min(1, dt * 3.5 * stats.reelSpeed);
          f.depthM += (-f.depthM) * Math.min(1, dt * 3.5);
          if (Math.hypot(f.x - tx, yy - ty) < 40 && f.depthM < 2) fishes.splice(i, 1);
          continue;
        }
        if (f.fighting) {
          f.x += (castX - f.x) * Math.min(1, dt * 6);
          f.depthM += (depthM - f.depthM) * Math.min(1, dt * 6);
          continue;
        }
        // school members follow their leader
        const leader = f.leaderId != null ? fishes.find((o) => o.id === f.leaderId) : null;
        if (leader && !leader.caught && !leader.fighting) {
          f.dir = leader.dir;
          const tx = leader.x + leader.dir * f.offX;
          f.x += (tx - f.x) * Math.min(1, dt * 2.2) + leader.vx * dt * 60;
          f.depthM = leader.depthM + f.offDepth + Math.sin(t * 1.5 + f.id) * 0.6;
          f.facing += (f.dir - f.facing) * Math.min(1, dt * 8);
          if (f.panic > 0) f.panic -= dt;
          continue;
        }

        // panic flee
        if (f.panic > 0) {
          f.panic -= dt;
          f.x += Math.abs(f.vx) * f.dir * 2.6 * dt * 60;
          f.depthM += (f.tdepth - f.depthM) * dt;
          f.facing += (f.dir - f.facing) * Math.min(1, dt * 8);
          if (f.x < -280 || f.x > W + 280) fishes.splice(i, 1);
          continue;
        }
        // ---- behaviour profile per rarity ----
        // 0 schooling · 1 darting · 2 cruising · 3 predator · 4 heavy · 5 anomaly
        const band = {
          prefMin: f.prefMin,
          prefMax: f.prefMax,
          pmin: f.pmin,
          pmax: f.pmax,
        };
        if (f.dartBoost > 0) f.dartBoost -= dt;
        f.retarget -= dt;
        if (f.retarget <= 0) {
          if (rank === 1) {
            // darting: short attention span, sudden quick bursts
            f.retarget = 1.4 + Math.random() * 3;
            if (Math.random() < 0.55) f.dartBoost = 0.35;
            f.tdepth = sampleDepth(band);
            f.tx = f.x + (Math.random() * 2 - 1) * f.roamX;
          } else if (rank === 2) {
            // cruising: long, smooth glides
            f.retarget = 9 + Math.random() * 11;
            f.tdepth = sampleDepth(band);
            f.tx = f.x + (Math.random() * 2 - 1) * f.roamX;
          } else if (rank === 3) {
            // predator: prowls, chases nearby smaller fish
            f.retarget = 4 + Math.random() * 6;
            let prey: FishEntity | null = null;
            let bestD = f.roamX * f.roamX;
            for (const o of fishes) {
              if (o === f || o.caught || o.fighting) continue;
              if (o.species.size >= f.species.size * 0.7) continue;
              const dd = (o.x - f.x) ** 2 + (depthToY(o.depthM) - depthToY(f.depthM)) ** 2;
              if (dd < bestD) {
                bestD = dd;
                prey = o;
              }
            }
            if (prey) {
              f.tx = prey.x;
              f.tdepth = prey.depthM;
              prey.panic = Math.max(prey.panic, 0.7);
            } else {
              f.tx = f.x + (Math.random() * 2 - 1) * f.roamX;
              f.tdepth = sampleDepth(band);
            }
          } else {
            // heavy / anomaly: slow migration across the whole ocean
            f.retarget = 10 + Math.random() * 14;
            f.tdepth = sampleDepth(band);
            f.tx = Math.random() < 0.5 ? -180 : W + 180;
          }
        }
        const dx = f.tx - f.x;
        f.dir = dx < 0 ? -1 : 1;
        const boost = f.dartBoost > 0 ? 3.2 : 1;
        const step = f.species.speed * 0.012 * dt * 60 * boost;
        if (Math.abs(dx) > 2) f.x += Math.sign(dx) * Math.min(Math.abs(dx), step);
        f.depthM += (f.tdepth - f.depthM) * Math.min(1, dt * (rank === 1 ? 0.9 : 0.4));
        f.depthM += Math.sin(t * 0.6 + f.id) * 0.12;
        // anomaly: radioactive twitch
        if (sp.effect === "radioactive") {
          f.x += (Math.random() - 0.5) * 3;
          f.depthM += (Math.random() - 0.5) * 0.4;
        }
        f.depthM = Math.max(1, Math.min(OCEAN_DEPTH_M - 5, f.depthM));
        f.facing += (f.dir - f.facing) * Math.min(1, dt * (rank === 1 ? 12 : 8));
        if (f.x < -280 || f.x > W + 280) fishes.splice(i, 1);
      }

      // ---- collision avoidance ----
      const mPerPx = OCEAN_DEPTH_M / (seabedY - waterTop);
      // keep fish out of seabed decor (weeds, corals, rocks)
      for (const f of fishes) {
        if (f.caught || f.fighting) continue;
        const y = depthToY(f.depthM);
        for (const o of obstacles) {
          if (Math.abs(f.x - o.x) < o.halfW + 14 && y > o.topY - 8) {
            const limit = yToDepth(o.topY - 12);
            if (f.depthM > limit) f.depthM = limit;
            f.tdepth = Math.min(f.tdepth, limit);
            f.x += (f.x < o.x ? -1 : 1) * 1.4;
          }
        }
      }
      // separate free-swimming fish so they don't overlap / pass through
      for (let a = 0; a < fishes.length; a++) {
        const fa = fishes[a];
        if (fa.caught || fa.fighting || fa.leaderId != null) continue;
        for (let b = a + 1; b < fishes.length; b++) {
          const fb = fishes[b];
          if (fb.caught || fb.fighting) continue;
          const dx = fb.x - fa.x;
          const dy = (depthToY(fb.depthM) - depthToY(fa.depthM));
          const minD = (fa.species.size * fa.scale + fb.species.size * fb.scale) * 0.3;
          const d = Math.hypot(dx, dy);
          if (d > 0.01 && d < minD) {
            const push = ((minD - d) / minD) * 22 * dt;
            const nx = dx / d, ny = dy / d;
            fa.x -= nx * push;
            fb.x += nx * push;
            fa.depthM = Math.max(1, fa.depthM - ny * push * mPerPx);
            fb.depthM = Math.min(OCEAN_DEPTH_M - 5, fb.depthM + ny * push * mPerPx);
          }
        }
      }

      // mythic ambient particles (toxic vapor / void motes / diamond sparkle)
      for (const f of fishes) {
        if (!f.species.effect || f.caught) continue;
        if (Math.random() < dt * 7) {
          const yy = depthToY(f.depthM);
          const r = (Math.random() - 0.5) * f.species.size * 0.5;
          if (f.species.effect === "radioactive") {
            particles.push({ x: f.x + r, y: yy, vx: (Math.random() - 0.5) * 8, vy: -10 - Math.random() * 14, life: 0, max: 1 + Math.random(), color: "#9dff3a", size: 1.5 + Math.random() * 2.5 });
          } else if (f.species.effect === "darkmatter") {
            particles.push({ x: f.x + r, y: yy + (Math.random() - 0.5) * f.species.size * 0.4, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 0, max: 0.8 + Math.random() * 0.6, color: "#7b2ff7", size: 1.5 + Math.random() * 2 });
          } else {
            particles.push({ x: f.x + r, y: yy + (Math.random() - 0.5) * f.species.size * 0.4, vx: 0, vy: -4, life: 0, max: 0.6, color: "#ffffff", size: 1 + Math.random() * 2 });
          }
        }
      }

      // bubbles
      bubbleTimer += dt;
      if (bubbleTimer > 0.1) {
        bubbleTimer = 0;
        spawnBubble();
      }
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.y -= b.speed * dt;
        b.wobble += dt * 2;
        b.x += Math.sin(b.wobble) * 8 * dt;
        if (b.y < waterTop) bubbles.splice(i, 1);
      }
      // splashes
      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        s.life += dt;
        s.r += 40 * dt;
        if (s.life > 0.6) splashes.splice(i, 1);
      }
      // shallow fish create surface splashes occasionally
      if (Math.random() < dt * 1.2) {
        const shallow = fishes.filter((f) => f.depthM < 6 && !f.fighting && !f.caught);
        if (shallow.length) {
          const f = shallow[Math.floor(Math.random() * shallow.length)];
          splashes.push({ x: f.x, r: 3, life: 0 });
        }
      }
      // particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 120 * dt;
        if (p.life > p.max) particles.splice(i, 1);
      }
    }

    function drawCastPower() {
      if (phase !== "charging") return;
      const x = rodTipX, y = rodTipY + dockSway - 30;
      ctx.save();
      ctx.fillStyle = "rgba(0,20,40,0.55)";
      ctx.beginPath();
      ctx.roundRect(x - 6, y - 70, 12, 70, 6);
      ctx.fill();
      const hgt = 66 * charge;
      const g = ctx.createLinearGradient(0, y, 0, y - 66);
      g.addColorStop(0, "#4ade80");
      g.addColorStop(0.6, "#facc15");
      g.addColorStop(1, "#ef4444");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.roundRect(x - 4, y - 2 - hgt, 8, hgt, 4);
      ctx.fill();
      ctx.restore();
    }
    function drawDepthGauge() {
      if (phase !== "fishing") return;
      const reach = statsRef.current.depthReach;
      const x = 26, top = waterTop + 16, bottom = H - 80;
      ctx.save();
      ctx.fillStyle = "rgba(0,20,40,0.45)";
      ctx.beginPath();
      ctx.roundRect(x - 7, top, 14, bottom - top, 7);
      ctx.fill();
      // reachable portion
      const reachY = top + (Math.min(reach, OCEAN_DEPTH_M) / OCEAN_DEPTH_M) * (bottom - top);
      ctx.fillStyle = "rgba(80,180,255,0.25)";
      ctx.beginPath();
      ctx.roundRect(x - 5, top, 10, reachY - top, 5);
      ctx.fill();
      // current marker
      const my = top + (depthM / OCEAN_DEPTH_M) * (bottom - top);
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(x, my, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`${Math.round(depthM)} м`, x + 12, my + 4);
      ctx.font = "10px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText(`макс ${Math.round(reach)} м`, x - 6, bottom + 16);
      ctx.restore();
    }

    function render(tms: number) {
      const t = tms / 1000;
      ctx.clearRect(0, 0, W, H);
      drawSky();
      drawClouds();
      drawWater();
      drawLayers(tms);
      drawSunRays(tms);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 60; i++) {
        const x = (i * 137.5 + tms * 0.004) % W;
        const y = waterTop + ((i * 53.3 + tms * 0.01) % (H - waterTop));
        ctx.fillStyle = "rgba(200,235,255,0.13)";
        ctx.fillRect(x, y, 2, 2);
      }
      ctx.restore();
      drawSeabed(tms);

      fishes.sort((a, b) => a.depthM - b.depthM);
      for (const f of fishes) drawFish(f, t);

      // bubbles
      for (const b of bubbles) {
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      // splashes (surface rings)
      for (const s of splashes) {
        const a = 1 - s.life / 0.6;
        ctx.strokeStyle = `rgba(255,255,255,${Math.max(0, a * 0.7)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(s.x, waterTop + 4, s.r, s.r * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (const p of particles) {
        const a = 1 - p.life / p.max;
        ctx.globalAlpha = Math.max(0, a);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      drawWaves(tms);
      drawDock(tms);
      drawCastPreview();
      drawRodAndLine(t);
      drawCastPower();
      drawDepthGauge();
    }

    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      update(dt, now);
      render(now);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fishing-scene absolute inset-0 block h-full w-full"
    />
  );
}
