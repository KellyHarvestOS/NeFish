export type UpgradeId =
  | "reelSpeed"
  | "luck"
  | "rareChance"
  | "depth"
  | "inventory"
  | "control"
  | "baitContainer"
  | "fridge"
  | "fisherSkill";

export interface UpgradeDef {
  id: UpgradeId;
  name: string;
  description: string;
  icon: string;
  maxLevel: number;
  baseCost: number;
  costGrowth: number;
  /** value added per level */
  perLevel: number;
  unit: string;
}

export const UPGRADES: UpgradeDef[] = [
  {
    id: "reelSpeed",
    name: "Скорость вытягивания",
    description: "Крючок возвращается быстрее.",
    icon: "⚡",
    maxLevel: 10,
    baseCost: 50,
    costGrowth: 1.55,
    perLevel: 8,
    unit: "%",
  },
  {
    id: "luck",
    name: "Удача",
    description: "Повышает шанс успешной поимки.",
    icon: "🍀",
    maxLevel: 10,
    baseCost: 70,
    costGrowth: 1.6,
    perLevel: 5,
    unit: "%",
  },
  {
    id: "rareChance",
    name: "Шанс редкой рыбы",
    description: "Чаще появляются ценные виды.",
    icon: "💎",
    maxLevel: 10,
    baseCost: 90,
    costGrowth: 1.65,
    perLevel: 4,
    unit: "%",
  },
  {
    id: "depth",
    name: "Глубина погружения",
    description: "Крючок достигает больших глубин.",
    icon: "🌊",
    maxLevel: 8,
    baseCost: 80,
    costGrowth: 1.6,
    perLevel: 6,
    unit: "%",
  },
  {
    id: "inventory",
    name: "Размер инвентаря",
    description: "Больше места для трофеев.",
    icon: "🎒",
    maxLevel: 10,
    baseCost: 40,
    costGrowth: 1.4,
    perLevel: 5,
    unit: " слотов",
  },
  {
    id: "control",
    name: "Контроль",
    description: "Натяжение лески быстрее спадает после отпускания.",
    icon: "🎛️",
    maxLevel: 10,
    baseCost: 60,
    costGrowth: 1.5,
    perLevel: 7,
    unit: "%",
  },
  {
    id: "baitContainer",
    name: "Контейнер для наживки",
    description: "Увеличивает максимальный запас каждой приманки.",
    icon: "🧰",
    maxLevel: 10,
    baseCost: 45,
    costGrowth: 1.45,
    perLevel: 10,
    unit: " шт",
  },
  {
    id: "fridge",
    name: "Холодильник",
    description: "Шанс не потратить дорогую приманку.",
    icon: "❄️",
    maxLevel: 8,
    baseCost: 120,
    costGrowth: 1.6,
    perLevel: 6,
    unit: "%",
  },
  {
    id: "fisherSkill",
    name: "Навык рыбака",
    description: "Шанс сохранить приманку после успешной поимки.",
    icon: "🎖️",
    maxLevel: 10,
    baseCost: 90,
    costGrowth: 1.55,
    perLevel: 5,
    unit: "%",
  },
];

export function upgradeCost(def: UpgradeDef, level: number): number {
  return Math.round(def.baseCost * Math.pow(def.costGrowth, level));
}
