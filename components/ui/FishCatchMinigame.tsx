"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FishSpecies, RARITY_COLORS } from "@/data/fish";
import { useGameStore } from "@/store/gameStore";
import {
  getCombatConfig,
  rollJerkKind,
  phaseOf,
  JERK_BASE,
  JerkKind,
  HOLD_SOFT_S,
  HOLD_RED_S,
  HOLD_BREAK_S,
} from "@/lib/combat";
import { Icons } from "./icons";

interface Props {
  species: FishSpecies;
  onComplete: (win: boolean) => void;
}

const JERK_LABEL: Record<JerkKind, string> = {
  weak: "Слабый рывок",
  medium: "Средний рывок",
  strong: "Сильный рывок",
  legendary: "Легендарный рывок",
};

const PHASE_LABEL: Record<1 | 2 | 3, string> = {
  1: "Свежая рыба — активно сопротивляется",
  2: "Уставшая рыба — рывки реже",
  3: "Измотанная рыба — тяните!",
};

export default function FishCatchMinigame({ species, onComplete }: Props) {
  const cfg = useRef(
    getCombatConfig(species, useGameStore.getState().derived()),
  ).current;
  const color = RARITY_COLORS[species.rarity];

  // rendered state
  const [tension, setTension] = useState(15);
  const [staminaPct, setStaminaPct] = useState(100);
  const [distance, setDistance] = useState(cfg.startDistance);
  const [holdingUi, setHoldingUi] = useState(false);
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [rage, setRage] = useState(false);
  const [flash, setFlash] = useState<{ kind: JerkKind; id: number } | null>(
    null,
  );

  // sim refs
  const tensionR = useRef(15);
  const staminaR = useRef(cfg.maxStamina);
  const distR = useRef(cfg.startDistance);
  const holding = useRef(false);
  const done = useRef(false);
  const jerkTimer = useRef(cfg.jerkInterval);
  const rageTimer = useRef(0);
  const holdDuration = useRef(0);
  const seriesLeft = useRef(0);
  const seriesTimer = useRef(0);
  const [overhold, setOverhold] = useState(false);

  useEffect(() => {
    const down = () => (holding.current = true);
    const up = () => (holding.current = false);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchstart", down, { passive: true });
    window.addEventListener("touchend", up);

    let last = performance.now();
    let raf = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const maxT = cfg.maxTension;
      const staminaFrac = staminaR.current / cfg.maxStamina;
      const ph = phaseOf(staminaFrac);
      const hold = holding.current;

      // ---- anti-cheat: continuous holding is punished ----
      if (hold) holdDuration.current += dt;
      else holdDuration.current = 0;
      const hd = holdDuration.current;
      setOverhold(hd > HOLD_SOFT_S);
      if (hd > HOLD_BREAK_S) {
        // line snaps regardless of gear
        tensionR.current = maxT;
      } else if (hd > HOLD_SOFT_S) {
        // fast-growing extra tension; forced red past HOLD_RED_S
        const extra = (hd - HOLD_SOFT_S) * 26 * dt * (hd > HOLD_RED_S ? 2.4 : 1);
        tensionR.current += extra;
        if (hd > HOLD_RED_S)
          tensionR.current = Math.max(tensionR.current, maxT * 0.82);
      }

      // ---- rage event (telegraphed furious run) ----
      if (rageTimer.current > 0) {
        rageTimer.current -= dt;
        // fish surges away; pulling now is punishing
        distR.current += 3 * dt;
        if (hold) tensionR.current += 95 * (1 - cfg.jerkResist) * dt;
        else tensionR.current -= cfg.tensionDecay * 0.4 * dt;
        if (rageTimer.current <= 0) setRage(false);
      } else {
        // ---- normal reeling / slack ----
        if (hold) {
          // tired fish is reeled in faster
          const ease = 0.42 + 0.58 * (1 - staminaFrac);
          distR.current -= cfg.reelRate * ease * dt;
          staminaR.current -= cfg.staminaDrain * dt;
          tensionR.current += cfg.tensionGainHold * dt;
        } else {
          tensionR.current -= cfg.tensionDecay * dt;
          distR.current += cfg.fishRetreat * staminaFrac * dt;
        }

        const fireJerk = () => {
          const kind = rollJerkKind(staminaFrac, cfg.jerkScale);
          const mag = JERK_BASE[kind] * cfg.jerkScale * (1 - cfg.jerkResist);
          tensionR.current += mag * (hold ? 1.7 : 1);
          const id = now + Math.random();
          setFlash({ kind, id });
          setTimeout(() => {
            setFlash((f) => (f && f.id === id ? null : f));
          }, 700);
        };

        // ---- series of jerks in progress (legendary+) ----
        if (seriesLeft.current > 0) {
          seriesTimer.current -= dt;
          if (seriesTimer.current <= 0) {
            fireJerk();
            seriesLeft.current -= 1;
            seriesTimer.current = 0.35 + Math.random() * 0.25;
          }
        }

        // ---- legendary energy recovery (false pauses) ----
        if (cfg.canRecover && !hold && Math.random() < 0.015) {
          staminaR.current = Math.min(
            cfg.maxStamina,
            staminaR.current + cfg.maxStamina * 0.06,
          );
        }

        // ---- jerks ----
        jerkTimer.current -= dt;
        if (jerkTimer.current <= 0 && seriesLeft.current <= 0) {
          const phaseMul = ph === 1 ? 1 : ph === 2 ? 1.8 : 3.2;
          jerkTimer.current =
            cfg.jerkInterval * phaseMul * (0.7 + Math.random() * 0.6);

          const rageChance =
            cfg.rage && ph === 1 ? 0.28 : cfg.rage && ph === 2 ? 0.12 : 0;
          if (Math.random() < rageChance) {
            rageTimer.current = 1.2 + Math.random() * 0.9;
            setRage(true);
          } else if (cfg.seriesJerks > 1 && Math.random() < 0.35) {
            // burst of consecutive jerks
            seriesLeft.current = 2 + Math.floor(Math.random() * (cfg.seriesJerks - 1));
            seriesTimer.current = 0;
          } else {
            fireJerk();
          }
        }
      }

      // clamp
      tensionR.current = Math.max(0, tensionR.current);
      staminaR.current = Math.max(0, staminaR.current);
      distR.current = Math.max(0, Math.min(cfg.startDistance * 1.15, distR.current));

      // push to UI
      setTension(tensionR.current);
      setStaminaPct((staminaR.current / cfg.maxStamina) * 100);
      setDistance(distR.current);
      setHoldingUi(hold);
      setPhase(ph);

      // win / lose
      if (!done.current && distR.current <= 0.05) {
        done.current = true;
        onComplete(true);
        return;
      }
      if (!done.current && tensionR.current >= maxT) {
        done.current = true;
        onComplete(false);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchstart", down);
      window.removeEventListener("touchend", up);
    };
  }, [cfg, onComplete]);

  const maxT = cfg.maxTension;
  const tPct = Math.min(100, (tension / maxT) * 100);
  const zone = tPct < 50 ? "green" : tPct < 80 ? "yellow" : "red";
  const tensionColor =
    zone === "green" ? "#22c55e" : zone === "yellow" ? "#eab308" : "#ef4444";
  const TRACK = 280;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/35 backdrop-blur-[2px]"
    >
      <motion.div
        initial={{ scale: 0.85, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="glass-dark relative flex flex-col items-center gap-3 rounded-3xl px-7 py-5 text-white"
        style={{ boxShadow: `0 0 44px ${color}44` }}
      >
        {/* header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-lg font-extrabold">
            <Icons.fish size={20} style={{ color }} />
            {species.name} сопротивляется!
          </div>
          <div
            className="text-xs font-bold uppercase tracking-wide"
            style={{ color }}
          >
            {species.rarity} · Фаза {phase}
          </div>
        </div>

        {/* rage warning */}
        <AnimatePresence>
          {rage && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: [1, 1.06, 1], opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.4, repeat: Infinity }}
              className="flex items-center gap-2 rounded-xl bg-red-600/90 px-4 py-1.5 text-sm font-extrabold text-white shadow-lg"
            >
              <Icons.warn size={18} /> СИЛЬНЫЙ РЫВОК — ОТПУСТИТЕ ЛКМ!
            </motion.div>
          )}
        </AnimatePresence>

        {/* bars */}
        <div className="flex items-stretch gap-6">
          {/* stamina (fish) */}
          <div className="flex flex-col items-center gap-1.5">
            <Icons.fish size={16} style={{ color }} />
            <div
              className="relative w-7 overflow-hidden rounded-full bg-slate-900/60 ring-1 ring-white/15"
              style={{ height: TRACK }}
            >
              <motion.div
                className="absolute bottom-0 left-0 right-0"
                style={{
                  height: `${staminaPct}%`,
                  background: `linear-gradient(0deg, ${color}, ${color}aa)`,
                }}
              />
            </div>
            <span className="text-[10px] font-bold text-white/70">
              {Math.round(staminaPct)}%
            </span>
          </div>

          {/* tension (line) */}
          <div className="flex flex-col items-center gap-1.5">
            <Icons.rod size={16} className="text-sky-300" />
            <div
              className="relative w-8 overflow-hidden rounded-full ring-1 ring-white/15"
              style={{ height: TRACK }}
            >
              {/* zone backgrounds */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-green-500/25" />
              <div className="absolute inset-x-0 bottom-1/2 h-[30%] bg-yellow-500/25" />
              <div className="absolute inset-x-0 top-0 h-[20%] bg-red-500/30" />
              {/* fill */}
              <motion.div
                className="absolute bottom-0 left-0 right-0"
                style={{
                  height: `${tPct}%`,
                  background: tensionColor,
                  boxShadow: `0 0 16px ${tensionColor}`,
                }}
              />
              {/* danger pulse near top */}
              {zone === "red" && (
                <motion.div
                  className="absolute inset-0"
                  animate={{ opacity: [0.1, 0.35, 0.1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  style={{ background: "#ef4444" }}
                />
              )}
            </div>
            <span
              className="text-[10px] font-bold"
              style={{ color: tensionColor }}
            >
              {Math.round(tPct)}%
            </span>
          </div>
        </div>

        {/* jerk flash */}
        <div className="h-4">
          <AnimatePresence>
            {flash && (
              <motion.div
                key={flash.id}
                initial={{ y: 6, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-bold"
                style={{
                  color:
                    flash.kind === "legendary"
                      ? "#f43f5e"
                      : flash.kind === "strong"
                        ? "#fb923c"
                        : "#fde047",
                }}
              >
                {JERK_LABEL[flash.kind]}! +
                {JERK_BASE[flash.kind]}% натяжения
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* distance */}
        <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-1.5">
          <span className="text-xs text-white/60">Дистанция</span>
          <span className="text-lg font-extrabold tabular-nums">
            {distance.toFixed(1)} м
          </span>
        </div>

        <div className="max-w-[260px] text-center text-[11px] leading-snug text-white/65">
          Зажимайте <b className="text-white">ЛКМ</b>, чтобы подматывать и
          выматывать рыбу. Отпускайте во время рывков, держите натяжение в{" "}
          <span className="font-bold text-green-400">зелёной</span> зоне.
        </div>

        {/* hold indicator */}
        <div
          className={`flex items-center gap-2 text-xs font-bold transition ${
            overhold
              ? "text-red-400"
              : holdingUi
                ? "text-emerald-300"
                : "text-white/40"
          }`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              overhold
                ? "animate-pulse bg-red-500"
                : holdingUi
                  ? "bg-emerald-400"
                  : "bg-white/30"
            }`}
          />
          {overhold
            ? "Слишком долго! Отпустите ЛКМ!"
            : holdingUi
              ? "Подматываю…"
              : "Леска ослаблена"}
        </div>
      </motion.div>
    </motion.div>
  );
}
