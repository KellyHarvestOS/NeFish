import { Rarity } from "./fish";

export type BaitQuality = "normal" | "good" | "premium";

export const QUALITY_LABEL: Record<BaitQuality, string> = {
  normal: "Обычная",
  good: "Хорошая",
  premium: "Премиальная",
};

/** bite-chance multiplier added by quality */
export const QUALITY_BONUS: Record<BaitQuality, number> = {
  normal: 0,
  good: 0.2,
  premium: 0.5,
};

export const QUALITY_PRICE_MULT: Record<BaitQuality, number> = {
  normal: 1,
  good: 2.4,
  premium: 5,
};

export interface BaitGroup {
  id: string;
  name: string;
  description: string;
  /** visual model drawn on the hook */
  model:
    | "worm"
    | "shrimp"
    | "minnow"
    | "squid"
    | "tuna"
    | "crab"
    | "jellyfish"
    | "glowsquid"
    | "deepworm"
    | "goldshrimp"
    | "legendary";
  color: string;
  accent: string;
  /** base price of one NORMAL-quality unit */
  price: number;
  /** "expensive" baits benefit from the fridge upgrade */
  expensive: boolean;
  rarities: Rarity[];
  /** species ids this bait can attract */
  species: string[];
}

export const BAIT_GROUPS: BaitGroup[] = [
  {
    id: "worm",
    name: "Морской червь",
    description: "Базовая наживка. Извивается на крючке.",
    model: "worm",
    color: "#a0432b",
    accent: "#d98b6a",
    price: 5,
    expensive: false,
    rarities: ["Common"],
    species: ["sardine", "seabass", "anchovy", "herring", "goby", "wrasse"],
  },
  {
    id: "shrimp",
    name: "Свежая креветка",
    description: "Розовая креветка с заметными усиками.",
    model: "shrimp",
    color: "#ff8fb0",
    accent: "#ffd5e0",
    price: 50,
    expensive: false,
    rarities: ["Uncommon"],
    species: ["clownfish", "butterfly", "parrot", "horsemackerel", "seabream"],
  },
  {
    id: "crab",
    name: "Краб",
    description: "Живой краб для рифовых хищников.",
    model: "crab",
    color: "#d8643c",
    accent: "#ffd0a0",
    price: 180,
    expensive: false,
    rarities: ["Uncommon", "Rare"],
    species: ["foxface", "lutjanus", "triggerfish", "lionfish", "pompano", "snapper"],
  },
  {
    id: "minnow",
    name: "Живая рыбка",
    description: "Серебристый малёк, плавает у крючка.",
    model: "minnow",
    color: "#cdd9e2",
    accent: "#ffffff",
    price: 300,
    expensive: true,
    rarities: ["Rare"],
    species: ["bluetang", "tuna", "mahimahi", "tarpon", "sailfish"],
  },
  {
    id: "jellyfish",
    name: "Медуза",
    description: "Полупрозрачная медуза, манит фильтраторов.",
    model: "jellyfish",
    color: "#cda8ff",
    accent: "#f0e6ff",
    price: 1200,
    expensive: true,
    rarities: ["Rare", "Epic"],
    species: ["mola", "manta", "puffer", "angelfish"],
  },
  {
    id: "squid",
    name: "Свежий кальмар",
    description: "Белый кальмар с длинными щупальцами.",
    model: "squid",
    color: "#f3e7ef",
    accent: "#c98fb0",
    price: 1000,
    expensive: true,
    rarities: ["Epic"],
    species: ["barracuda", "yellowfin", "grouper", "marlin", "blackfin", "wahoo", "trevally"],
  },
  {
    id: "deepworm",
    name: "Глубоководный червь",
    description: "Биолюминесцентный червь для донных гигантов.",
    model: "deepworm",
    color: "#5fd0c0",
    accent: "#d6fff7",
    price: 2500,
    expensive: true,
    rarities: ["Epic", "Legendary"],
    species: ["napoleon", "grouper", "hammerhead"],
  },
  {
    id: "glowsquid",
    name: "Светящийся кальмар",
    description: "Сияющий кальмар приманивает крупных хищников глубин.",
    model: "glowsquid",
    color: "#7fe8ff",
    accent: "#e6ffff",
    price: 3500,
    expensive: true,
    rarities: ["Legendary"],
    species: ["swordfish", "tigershark", "greatwhite", "bluemarlin", "giantmarlin", "hammerhead"],
  },
  {
    id: "goldshrimp",
    name: "Золотая креветка",
    description: "Редкая золотая креветка — лакомство великанов.",
    model: "goldshrimp",
    color: "#ffd24a",
    accent: "#fff3c0",
    price: 4500,
    expensive: true,
    rarities: ["Legendary", "Mythic"],
    species: ["whaleshark", "manta", "giantmarlin"],
  },
  {
    id: "legendary",
    name: "Легендарная приманка",
    description: "Светящийся след крови. Приманивает мифических существ.",
    model: "legendary",
    color: "#3a5a78",
    accent: "#ff5a5a",
    price: 6000,
    expensive: true,
    rarities: ["Mythic"],
    species: ["diamond", "radioactive", "darkmatter", "whaleshark", "greatwhite"],
  },
];

export const BAIT_BY_ID: Record<string, BaitGroup> = Object.fromEntries(
  BAIT_GROUPS.map((b) => [b.id, b]),
);

export function baitUnitPrice(group: BaitGroup, q: BaitQuality): number {
  return Math.round(group.price * QUALITY_PRICE_MULT[q]);
}

/** stock key */
export function baitKey(groupId: string, q: BaitQuality): string {
  return `${groupId}:${q}`;
}

export function parseBaitKey(key: string): {
  group: BaitGroup;
  quality: BaitQuality;
} | null {
  const [gid, q] = key.split(":");
  const group = BAIT_BY_ID[gid];
  if (!group) return null;
  return { group, quality: q as BaitQuality };
}

/** which group (if any) can catch a given species */
export function groupForSpecies(speciesId: string): BaitGroup | undefined {
  return BAIT_GROUPS.find((g) => g.species.includes(speciesId));
}
