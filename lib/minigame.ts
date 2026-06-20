import { FishSpecies, Rarity, fishMeta } from "@/data/fish";

/** FishCatchMinigame configuration derived from rarity + per-species coeff. */

export interface MinigameConfig {
  zoneSize: number; // fraction of the bar (control zone height)
  fishSpeed: number; // base wander speed (bar units / sec)
  erratic: number; // 0..1 chance/intensity of sudden direction changes
  fillRate: number; // progress gained per sec while in zone
  drainRate: number; // progress lost per sec while out of zone
}

const BY_RARITY: Record<Rarity, Omit<MinigameConfig, "fillRate" | "drainRate">> =
  {
    Common: { zoneSize: 0.34, fishSpeed: 0.28, erratic: 0.1 },
    Uncommon: { zoneSize: 0.28, fishSpeed: 0.4, erratic: 0.2 },
    Rare: { zoneSize: 0.22, fishSpeed: 0.55, erratic: 0.4 },
    Epic: { zoneSize: 0.16, fishSpeed: 0.75, erratic: 0.6 },
    Legendary: { zoneSize: 0.12, fishSpeed: 0.95, erratic: 0.8 },
    Mythic: { zoneSize: 0.09, fishSpeed: 1.2, erratic: 1.0 },
  };

export function getMinigameConfig(species: FishSpecies): MinigameConfig {
  const base = BY_RARITY[species.rarity];
  const diff = fishMeta(species.id).catchDifficulty;
  return {
    zoneSize: Math.max(0.07, base.zoneSize / diff),
    fishSpeed: base.fishSpeed * diff,
    erratic: Math.min(1, base.erratic * diff),
    // harder fish fill slower and drain faster
    fillRate: 0.42 / diff,
    drainRate: 0.3 * diff,
  };
}
