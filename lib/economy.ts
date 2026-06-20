import { FishSpecies, Rarity, fishMeta } from "@/data/fish";

/** EconomySystem — single source of truth for pricing. */

export const RARITY_MULTIPLIER: Record<Rarity, number> = {
  Common: 1,
  Uncommon: 1.5,
  Rare: 3,
  Epic: 8,
  Legendary: 20,
  Mythic: 50,
};

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Heavier specimens skew toward the lower end (big ones are rarer). */
export function rollWeight(species: FishSpecies): number {
  const m = fishMeta(species.id);
  // bias exponent > 1 makes big weights less frequent
  const frac = Math.pow(Math.random(), 1.7);
  const w = m.minWeight + frac * (m.maxWeight - m.minWeight);
  return Math.round(w * 100) / 100;
}

export function rollLength(species: FishSpecies, weight: number): number {
  const m = fishMeta(species.id);
  const wFrac =
    m.maxWeight > m.minWeight
      ? (weight - m.minWeight) / (m.maxWeight - m.minWeight)
      : 0.5;
  const len = m.minLength + wFrac * (m.maxLength - m.minLength) * rand(0.9, 1.1);
  return Math.round(len * 10) / 10;
}

/** weightMultiplier: 0.6x (tiny) .. ~2.5x (record specimen). */
export function weightMultiplier(species: FishSpecies, weight: number): number {
  const m = fishMeta(species.id);
  const frac =
    m.maxWeight > m.minWeight
      ? Math.min(1, Math.max(0, (weight - m.minWeight) / (m.maxWeight - m.minWeight)))
      : 0.5;
  return 0.6 + frac * 1.9;
}

/** value = basePrice × rarityMultiplier × weightMultiplier */
export function computeValue(species: FishSpecies, weight: number): number {
  const base = species.value;
  const v = base * RARITY_MULTIPLIER[species.rarity] * weightMultiplier(species, weight);
  return Math.max(1, Math.round(v));
}

export function formatWeight(kg: number): string {
  if (kg >= 1000) return (kg / 1000).toFixed(2) + " т";
  if (kg >= 10) return kg.toFixed(1) + " кг";
  return kg.toFixed(2) + " кг";
}

export function formatLength(cm: number): string {
  if (cm >= 100) return (cm / 100).toFixed(2) + " м";
  return cm.toFixed(0) + " см";
}
