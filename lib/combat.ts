import { FishSpecies, Rarity, fishMeta } from "@/data/fish";
import type { DerivedStats } from "@/store/gameStore";

/** Tension-based fight tuning (FightSystem). */

/** Anti-cheat: holding LMB continuously is punished. */
export const HOLD_SOFT_S = 3; // tension starts rising fast
export const HOLD_RED_S = 5; // forced into the red zone
export const HOLD_BREAK_S = 8; // line snaps no matter how strong

interface RarityTuning {
  stamina: number;
  startDistance: number; // meters
  jerkInterval: number; // avg seconds between jerks (fresh fish)
  jerkScale: number; // multiplier on jerk magnitude
  pullStrength: number; // tension gained per sec while reeling
  drainTime: number; // ~seconds of (bursty) reeling to land it
  rage: boolean;
  seriesJerks: number; // max consecutive jerks (legendary+)
  canRecover: boolean; // regenerates stamina (legendary+)
  phases: number; // distinct fury phases (mythic)
}

const TUNING: Record<Rarity, RarityTuning> = {
  Common:    { stamina: 60,  startDistance: 16, jerkInterval: 3.2, jerkScale: 0.6,  pullStrength: 22, drainTime: 30,  rage: false, seriesJerks: 1, canRecover: false, phases: 1 },
  Uncommon:  { stamina: 100, startDistance: 20, jerkInterval: 2.8, jerkScale: 0.8,  pullStrength: 24, drainTime: 50,  rage: false, seriesJerks: 1, canRecover: false, phases: 1 },
  Rare:      { stamina: 180, startDistance: 26, jerkInterval: 2.2, jerkScale: 1.0,  pullStrength: 27, drainTime: 110, rage: true,  seriesJerks: 2, canRecover: false, phases: 1 },
  Epic:      { stamina: 300, startDistance: 32, jerkInterval: 1.8, jerkScale: 1.25, pullStrength: 30, drainTime: 220, rage: true,  seriesJerks: 3, canRecover: false, phases: 2 },
  Legendary: { stamina: 500, startDistance: 40, jerkInterval: 1.5, jerkScale: 1.6,  pullStrength: 33, drainTime: 380, rage: true,  seriesJerks: 5, canRecover: true,  phases: 2 },
  Mythic:    { stamina: 820, startDistance: 50, jerkInterval: 1.2, jerkScale: 2.0,  pullStrength: 36, drainTime: 720, rage: true,  seriesJerks: 5, canRecover: true,  phases: 3 },
};

export interface CombatConfig {
  maxStamina: number;
  startDistance: number;
  maxTension: number;
  reelRate: number;
  staminaDrain: number;
  tensionGainHold: number;
  tensionDecay: number;
  fishRetreat: number;
  jerkInterval: number;
  jerkScale: number;
  jerkResist: number;
  rage: boolean;
  seriesJerks: number;
  canRecover: boolean;
  phases: number;
}

export function getCombatConfig(
  species: FishSpecies,
  stats: DerivedStats,
): CombatConfig {
  const t = TUNING[species.rarity];
  const diff = fishMeta(species.id).catchDifficulty;
  const reel = stats.reelSpeed;
  return {
    maxStamina: t.stamina,
    startDistance: t.startDistance,
    maxTension: stats.maxTension,
    reelRate: 6 * reel,
    // bursty reeling (~50% duty) reaches drainTime
    staminaDrain: t.stamina / (t.drainTime * 0.5),
    tensionGainHold: t.pullStrength * diff,
    tensionDecay: 28 * (1 + stats.control),
    fishRetreat: 2.4 * diff,
    jerkInterval: t.jerkInterval / diff,
    jerkScale: t.jerkScale * diff,
    jerkResist: stats.jerkResist,
    rage: t.rage,
    seriesJerks: t.seriesJerks,
    canRecover: t.canRecover,
    phases: t.phases,
  };
}

export type JerkKind = "weak" | "medium" | "strong" | "legendary";

export const JERK_BASE: Record<JerkKind, number> = {
  weak: 10,
  medium: 25,
  strong: 40,
  legendary: 60,
};

export function rollJerkKind(staminaFrac: number, jerkScale: number): JerkKind {
  const power = jerkScale * (0.4 + 0.6 * staminaFrac) + Math.random() * 0.5;
  if (power > 1.6) return "legendary";
  if (power > 1.1) return "strong";
  if (power > 0.7) return "medium";
  return "weak";
}

export function phaseOf(staminaFrac: number): 1 | 2 | 3 {
  if (staminaFrac > 0.7) return 1;
  if (staminaFrac > 0.3) return 2;
  return 3;
}
