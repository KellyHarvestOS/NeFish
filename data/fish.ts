export type Rarity =
  | "Common"
  | "Uncommon"
  | "Rare"
  | "Epic"
  | "Legendary"
  | "Mythic";

export const RARITY_ORDER: Rarity[] = [
  "Common",
  "Uncommon",
  "Rare",
  "Epic",
  "Legendary",
  "Mythic",
];

export function rarityRank(r: Rarity): number {
  return RARITY_ORDER.indexOf(r);
}

export const RARITY_COLORS: Record<Rarity, string> = {
  Common: "#9ca3af",
  Uncommon: "#4ade80",
  Rare: "#38bdf8",
  Epic: "#a855f7",
  Legendary: "#f59e0b",
  Mythic: "#f43f5e",
};

/** key that selects a unique Canvas silhouette in fishRenderer.ts */
export type FishShape =
  | "sardine"
  | "clownfish"
  | "bluetang"
  | "butterfly"
  | "angelfish"
  | "seabass"
  | "tuna"
  | "barracuda"
  | "puffer"
  | "hammerhead"
  | "manta"
  | "whaleshark"
  | "yellowfin"
  | "parrot"
  | "lionfish"
  | "mahimahi"
  | "marlin"
  | "swordfish"
  | "tarpon"
  | "grouper"
  | "tigershark"
  | "anchovy"
  | "herring"
  | "goby"
  | "wrasse"
  | "horsemackerel"
  | "seabream"
  | "foxface"
  | "snapper"
  | "triggerfish"
  | "mola"
  | "sailfish"
  | "pompano"
  | "wahoo"
  | "trevally"
  | "napoleon"
  | "greatwhite"
  | "diamond"
  | "radioactive"
  | "darkmatter";

/** Total simulated ocean depth in meters (surface = 0). */
export const OCEAN_DEPTH_M = 160;

export type SwimStyle = "dart" | "cruise" | "glide" | "flap" | "bob";

export interface FishSpecies {
  id: string;
  name: string;
  rarity: Rarity;
  shape: FishShape;
  /** body length in px at base scale (sizes differ substantially) */
  size: number;
  /** horizontal swim speed (px/s) */
  speed: number;
  value: number;
  xp: number;
  spawnChance: number;
  /** preferred depth band 0 (surface) .. 1 (deep) */
  minDepth: number;
  maxDepth: number;
  schooling: boolean;
  /** hunts smaller schooling fish */
  predator: boolean;
  /** drifts toward seaweed / hides in plants */
  seaweed: boolean;
  swim: SwimStyle;
  color: string;
  accent: string;
  accent2: string;
  /** special mythic visual effect rendered in the ocean */
  effect?: "diamond" | "radioactive" | "darkmatter";
}

export const FISH_SPECIES: FishSpecies[] = [
  {
    id: "sardine",
    name: "Сардина",
    rarity: "Common",
    shape: "sardine",
    size: 22,
    speed: 120,
    value: 4,
    xp: 2,
    spawnChance: 100,
    minDepth: 0.05,
    maxDepth: 0.4,
    schooling: true,
    predator: false,
    seaweed: false,
    swim: "dart",
    color: "#9fb8c4",
    accent: "#e8f4fa",
    accent2: "#5e7d8c",
  },
  {
    id: "seabass",
    name: "Морской окунь",
    rarity: "Common",
    shape: "seabass",
    size: 46,
    speed: 64,
    value: 9,
    xp: 4,
    spawnChance: 70,
    minDepth: 0.25,
    maxDepth: 0.6,
    schooling: false,
    predator: false,
    seaweed: true,
    swim: "cruise",
    color: "#6f7d5a",
    accent: "#cdd9a6",
    accent2: "#3f4a30",
  },
  {
    id: "clownfish",
    name: "Рыба-клоун",
    rarity: "Uncommon",
    shape: "clownfish",
    size: 30,
    speed: 78,
    value: 18,
    xp: 9,
    spawnChance: 50,
    minDepth: 0.3,
    maxDepth: 0.6,
    schooling: false,
    predator: false,
    seaweed: true,
    swim: "bob",
    color: "#ff7a1a",
    accent: "#ffffff",
    accent2: "#1f1f1f",
  },
  {
    id: "butterfly",
    name: "Рыба-бабочка",
    rarity: "Uncommon",
    shape: "butterfly",
    size: 34,
    speed: 70,
    value: 22,
    xp: 11,
    spawnChance: 44,
    minDepth: 0.3,
    maxDepth: 0.62,
    schooling: true,
    predator: false,
    seaweed: true,
    swim: "bob",
    color: "#ffd23f",
    accent: "#fff7d6",
    accent2: "#2b2b2b",
  },
  {
    id: "bluetang",
    name: "Голубой хирург",
    rarity: "Rare",
    shape: "bluetang",
    size: 44,
    speed: 74,
    value: 52,
    xp: 26,
    spawnChance: 24,
    minDepth: 0.35,
    maxDepth: 0.7,
    schooling: true,
    predator: false,
    seaweed: false,
    swim: "glide",
    color: "#1f6cff",
    accent: "#ffd54a",
    accent2: "#06122e",
  },
  {
    id: "tuna",
    name: "Тунец",
    rarity: "Rare",
    shape: "tuna",
    size: 78,
    speed: 100,
    value: 70,
    xp: 34,
    spawnChance: 18,
    minDepth: 0.4,
    maxDepth: 0.8,
    schooling: false,
    predator: true,
    seaweed: false,
    swim: "cruise",
    color: "#3a5a78",
    accent: "#c9d8e4",
    accent2: "#dbe84a",
  },
  {
    id: "angelfish",
    name: "Рыба-ангел",
    rarity: "Epic",
    shape: "angelfish",
    size: 50,
    speed: 52,
    value: 130,
    xp: 65,
    spawnChance: 11,
    minDepth: 0.4,
    maxDepth: 0.72,
    schooling: false,
    predator: false,
    seaweed: true,
    swim: "glide",
    color: "#f4c430",
    accent: "#2b2b2b",
    accent2: "#fff3c4",
  },
  {
    id: "barracuda",
    name: "Барракуда",
    rarity: "Epic",
    shape: "barracuda",
    size: 92,
    speed: 96,
    value: 160,
    xp: 80,
    spawnChance: 8,
    minDepth: 0.45,
    maxDepth: 0.82,
    schooling: false,
    predator: true,
    seaweed: false,
    swim: "cruise",
    color: "#8a98a3",
    accent: "#e6edf2",
    accent2: "#2c3942",
  },
  {
    id: "puffer",
    name: "Рыба-фугу",
    rarity: "Epic",
    shape: "puffer",
    size: 42,
    speed: 38,
    value: 150,
    xp: 75,
    spawnChance: 9,
    minDepth: 0.45,
    maxDepth: 0.78,
    schooling: false,
    predator: false,
    seaweed: true,
    swim: "bob",
    color: "#d8b24a",
    accent: "#fff2c2",
    accent2: "#4a3a14",
  },
  {
    id: "hammerhead",
    name: "Рыба-молот",
    rarity: "Legendary",
    shape: "hammerhead",
    size: 130,
    speed: 78,
    value: 460,
    xp: 230,
    spawnChance: 4,
    minDepth: 0.62,
    maxDepth: 0.95,
    schooling: false,
    predator: true,
    seaweed: false,
    swim: "cruise",
    color: "#6b7c89",
    accent: "#aebcc6",
    accent2: "#2a363f",
  },
  {
    id: "manta",
    name: "Манта",
    rarity: "Legendary",
    shape: "manta",
    size: 150,
    speed: 56,
    value: 520,
    xp: 260,
    spawnChance: 3.4,
    minDepth: 0.6,
    maxDepth: 1.0,
    schooling: false,
    predator: false,
    seaweed: false,
    swim: "flap",
    color: "#2b3a55",
    accent: "#cdd8e8",
    accent2: "#0c1422",
  },
  {
    id: "whaleshark",
    name: "Китовая акула",
    rarity: "Mythic",
    shape: "whaleshark",
    size: 210,
    speed: 44,
    value: 1800,
    xp: 950,
    spawnChance: 1,
    minDepth: 0.72,
    maxDepth: 1.0,
    schooling: false,
    predator: false,
    seaweed: false,
    swim: "glide",
    color: "#34506b",
    accent: "#bcd0e0",
    accent2: "#0a1a2a",
  },
  {
    id: "parrot",
    name: "Рыба-попугай",
    rarity: "Uncommon",
    shape: "parrot",
    size: 42,
    speed: 60,
    value: 24,
    xp: 12,
    spawnChance: 40,
    minDepth: 0.05,
    maxDepth: 0.4,
    schooling: false,
    predator: false,
    seaweed: true,
    swim: "glide",
    color: "#19b3a6",
    accent: "#ff5fa2",
    accent2: "#0a3d3a",
  },
  {
    id: "lionfish",
    name: "Рыба-крылатка",
    rarity: "Rare",
    shape: "lionfish",
    size: 48,
    speed: 40,
    value: 60,
    xp: 30,
    spawnChance: 22,
    minDepth: 0.1,
    maxDepth: 0.45,
    schooling: false,
    predator: false,
    seaweed: true,
    swim: "bob",
    color: "#b3402b",
    accent: "#ffe3c4",
    accent2: "#2a0f0a",
  },
  {
    id: "mahimahi",
    name: "Махи-махи",
    rarity: "Rare",
    shape: "mahimahi",
    size: 70,
    speed: 104,
    value: 74,
    xp: 36,
    spawnChance: 20,
    minDepth: 0.1,
    maxDepth: 0.5,
    schooling: false,
    predator: true,
    seaweed: false,
    swim: "cruise",
    color: "#1fa8d8",
    accent: "#ffe23f",
    accent2: "#0d5e7a",
  },
  {
    id: "yellowfin",
    name: "Жёлтопёрый тунец",
    rarity: "Epic",
    shape: "yellowfin",
    size: 88,
    speed: 112,
    value: 175,
    xp: 88,
    spawnChance: 9,
    minDepth: 0.25,
    maxDepth: 0.7,
    schooling: false,
    predator: true,
    seaweed: false,
    swim: "cruise",
    color: "#2f5a78",
    accent: "#ffd23f",
    accent2: "#13314a",
  },
  {
    id: "tarpon",
    name: "Тарпон",
    rarity: "Rare",
    shape: "tarpon",
    size: 96,
    speed: 86,
    value: 80,
    xp: 40,
    spawnChance: 16,
    minDepth: 0.1,
    maxDepth: 0.45,
    schooling: false,
    predator: true,
    seaweed: false,
    swim: "cruise",
    color: "#9fb4c2",
    accent: "#eef5fa",
    accent2: "#3a4c5a",
  },
  {
    id: "grouper",
    name: "Гигантский групер",
    rarity: "Epic",
    shape: "grouper",
    size: 110,
    speed: 42,
    value: 210,
    xp: 105,
    spawnChance: 8,
    minDepth: 0.3,
    maxDepth: 0.65,
    schooling: false,
    predator: true,
    seaweed: true,
    swim: "cruise",
    color: "#5c5141",
    accent: "#cdbf9a",
    accent2: "#2a241a",
  },
  {
    id: "marlin",
    name: "Марлин",
    rarity: "Epic",
    shape: "marlin",
    size: 140,
    speed: 124,
    value: 240,
    xp: 120,
    spawnChance: 7,
    minDepth: 0.35,
    maxDepth: 0.75,
    schooling: false,
    predator: true,
    seaweed: false,
    swim: "cruise",
    color: "#22416b",
    accent: "#5fa8ff",
    accent2: "#0c1c33",
  },
  {
    id: "swordfish",
    name: "Рыба-меч",
    rarity: "Legendary",
    shape: "swordfish",
    size: 150,
    speed: 118,
    value: 520,
    xp: 260,
    spawnChance: 4,
    minDepth: 0.4,
    maxDepth: 0.8,
    schooling: false,
    predator: true,
    seaweed: false,
    swim: "cruise",
    color: "#2b3a52",
    accent: "#aebfd0",
    accent2: "#0b1626",
  },
  {
    id: "tigershark",
    name: "Тигровая акула",
    rarity: "Legendary",
    shape: "tigershark",
    size: 170,
    speed: 84,
    value: 560,
    xp: 280,
    spawnChance: 3.6,
    minDepth: 0.5,
    maxDepth: 0.95,
    schooling: false,
    predator: true,
    seaweed: false,
    swim: "cruise",
    color: "#586b66",
    accent: "#b6c4bd",
    accent2: "#222b28",
  },

  // ---- Common ----
  { id: "anchovy", name: "Анчоус", rarity: "Common", shape: "anchovy", size: 20, speed: 130, value: 4, xp: 2, spawnChance: 95, minDepth: 0, maxDepth: 0.3, schooling: true, predator: false, seaweed: false, swim: "dart", color: "#b8c6cf", accent: "#f2f7fa", accent2: "#6c8190" },
  { id: "herring", name: "Сельдь", rarity: "Common", shape: "herring", size: 26, speed: 115, value: 5, xp: 3, spawnChance: 85, minDepth: 0, maxDepth: 0.32, schooling: true, predator: false, seaweed: false, swim: "dart", color: "#9fb6c6", accent: "#eaf3f9", accent2: "#4f6b7d" },
  { id: "goby", name: "Бычок", rarity: "Common", shape: "goby", size: 24, speed: 60, value: 6, xp: 3, spawnChance: 70, minDepth: 0.05, maxDepth: 0.45, schooling: false, predator: false, seaweed: true, swim: "bob", color: "#7a6a4f", accent: "#cbb78c", accent2: "#3a3324" },
  { id: "wrasse", name: "Зеленушка", rarity: "Common", shape: "wrasse", size: 28, speed: 78, value: 7, xp: 4, spawnChance: 66, minDepth: 0.05, maxDepth: 0.4, schooling: false, predator: false, seaweed: true, swim: "glide", color: "#3f9e6b", accent: "#bff0c4", accent2: "#1d4a30" },

  // ---- Uncommon ----
  { id: "horsemackerel", name: "Ставрида", rarity: "Uncommon", shape: "horsemackerel", size: 40, speed: 100, value: 16, xp: 8, spawnChance: 55, minDepth: 0.1, maxDepth: 0.45, schooling: true, predator: false, seaweed: false, swim: "cruise", color: "#6f8ea0", accent: "#dfeef5", accent2: "#33485a" },
  { id: "seabream", name: "Морской карась", rarity: "Uncommon", shape: "seabream", size: 44, speed: 64, value: 20, xp: 10, spawnChance: 48, minDepth: 0.15, maxDepth: 0.5, schooling: true, predator: false, seaweed: true, swim: "glide", color: "#b9a78a", accent: "#f3e9d4", accent2: "#5e503a" },
  { id: "foxface", name: "Рыба-лиса", rarity: "Uncommon", shape: "foxface", size: 42, speed: 56, value: 24, xp: 12, spawnChance: 40, minDepth: 0.2, maxDepth: 0.55, schooling: false, predator: false, seaweed: true, swim: "bob", color: "#ffcf3f", accent: "#fff6cf", accent2: "#2b2b2b" },
  { id: "lutjanus", name: "Луциан", rarity: "Uncommon", shape: "snapper", size: 46, speed: 70, value: 26, xp: 13, spawnChance: 38, minDepth: 0.2, maxDepth: 0.6, schooling: false, predator: true, seaweed: false, swim: "cruise", color: "#e0635f", accent: "#ffd9cf", accent2: "#5a1f1d" },
  { id: "triggerfish", name: "Спинорог", rarity: "Uncommon", shape: "triggerfish", size: 40, speed: 50, value: 28, xp: 14, spawnChance: 36, minDepth: 0.15, maxDepth: 0.55, schooling: false, predator: false, seaweed: true, swim: "bob", color: "#3a7d8c", accent: "#ffe07a", accent2: "#14323a" },

  // ---- Rare ----
  { id: "mola", name: "Лунная рыба", rarity: "Rare", shape: "mola", size: 96, speed: 30, value: 90, xp: 45, spawnChance: 18, minDepth: 0.3, maxDepth: 0.7, schooling: false, predator: false, seaweed: false, swim: "glide", color: "#9aa7b0", accent: "#e8eef2", accent2: "#46535c" },
  { id: "sailfish", name: "Парусник", rarity: "Rare", shape: "sailfish", size: 92, speed: 130, value: 110, xp: 55, spawnChance: 14, minDepth: 0.35, maxDepth: 0.72, schooling: false, predator: true, seaweed: false, swim: "cruise", color: "#27577f", accent: "#5fc6ff", accent2: "#0d2236" },
  { id: "snapper", name: "Снэппер", rarity: "Rare", shape: "snapper", size: 70, speed: 66, value: 84, xp: 42, spawnChance: 20, minDepth: 0.3, maxDepth: 0.66, schooling: false, predator: true, seaweed: false, swim: "cruise", color: "#d84c63", accent: "#ffd0d8", accent2: "#5a1626" },
  { id: "pompano", name: "Помпано", rarity: "Rare", shape: "pompano", size: 60, speed: 96, value: 78, xp: 39, spawnChance: 22, minDepth: 0.2, maxDepth: 0.55, schooling: false, predator: false, seaweed: false, swim: "cruise", color: "#cfe0e6", accent: "#ffffff", accent2: "#7b8a90" },

  // ---- Epic ----
  { id: "wahoo", name: "Ваху", rarity: "Epic", shape: "wahoo", size: 120, speed: 140, value: 200, xp: 100, spawnChance: 8, minDepth: 0.4, maxDepth: 0.78, schooling: false, predator: true, seaweed: false, swim: "cruise", color: "#2f6a86", accent: "#9fe0ff", accent2: "#0e2a3a" },
  { id: "trevally", name: "Большой каранкс", rarity: "Epic", shape: "trevally", size: 110, speed: 104, value: 210, xp: 105, spawnChance: 8, minDepth: 0.35, maxDepth: 0.72, schooling: false, predator: true, seaweed: false, swim: "cruise", color: "#8fa6b4", accent: "#eef5fa", accent2: "#33454f" },
  { id: "blackfin", name: "Чернопёрый тунец", rarity: "Epic", shape: "tuna", size: 118, speed: 118, value: 220, xp: 110, spawnChance: 7, minDepth: 0.4, maxDepth: 0.8, schooling: false, predator: true, seaweed: false, swim: "cruise", color: "#26303a", accent: "#aebcc6", accent2: "#0c1218" },
  { id: "napoleon", name: "Наполеон", rarity: "Epic", shape: "napoleon", size: 138, speed: 44, value: 260, xp: 130, spawnChance: 6, minDepth: 0.45, maxDepth: 0.8, schooling: false, predator: false, seaweed: true, swim: "glide", color: "#2f8f7a", accent: "#bff0e0", accent2: "#103a32" },

  // ---- Legendary (always solitary, max 1 on screen) ----
  { id: "greatwhite", name: "Белая акула", rarity: "Legendary", shape: "greatwhite", size: 260, speed: 80, value: 620, xp: 310, spawnChance: 4, minDepth: 0.5, maxDepth: 0.95, schooling: false, predator: true, seaweed: false, swim: "cruise", color: "#8c98a0", accent: "#eef2f4", accent2: "#2b343a" },
  { id: "bluemarlin", name: "Голубой марлин", rarity: "Legendary", shape: "marlin", size: 240, speed: 130, value: 660, xp: 330, spawnChance: 3.6, minDepth: 0.5, maxDepth: 0.9, schooling: false, predator: true, seaweed: false, swim: "cruise", color: "#1d4f8a", accent: "#6fc0ff", accent2: "#0a1f3a" },
  { id: "giantmarlin", name: "Гигантский марлин", rarity: "Legendary", shape: "marlin", size: 300, speed: 120, value: 760, xp: 380, spawnChance: 2.8, minDepth: 0.55, maxDepth: 0.95, schooling: false, predator: true, seaweed: false, swim: "cruise", color: "#22416b", accent: "#8fd0ff", accent2: "#0c1c33" },

  // ---- Mythic (always solitary, max 1, special effects) ----
  { id: "diamond", name: "Алмазная рыба", rarity: "Mythic", shape: "diamond", size: 360, speed: 36, value: 9000, xp: 3000, spawnChance: 0.05, minDepth: 0.6, maxDepth: 1.0, schooling: false, predator: false, seaweed: false, swim: "glide", color: "#bfeaff", accent: "#ffffff", accent2: "#7fd3ff", effect: "diamond" },
  { id: "radioactive", name: "Радиоактивная рыба", rarity: "Mythic", shape: "radioactive", size: 340, speed: 64, value: 14000, xp: 5000, spawnChance: 0.025, minDepth: 0.65, maxDepth: 1.0, schooling: false, predator: true, seaweed: false, swim: "cruise", color: "#3fae3f", accent: "#d6ff5a", accent2: "#0c2a0c", effect: "radioactive" },
  { id: "darkmatter", name: "Рыба Тёмной Материи", rarity: "Mythic", shape: "darkmatter", size: 430, speed: 44, value: 40000, xp: 12000, spawnChance: 0.005, minDepth: 0.78, maxDepth: 1.0, schooling: false, predator: true, seaweed: false, swim: "glide", color: "#0a0a14", accent: "#b15cff", accent2: "#1a0a2a", effect: "darkmatter" },
];

export const FISH_BY_ID: Record<string, FishSpecies> = Object.fromEntries(
  FISH_SPECIES.map((f) => [f.id, f]),
);

/** Per-species real-world-inspired weight (kg) / length (cm) ranges
 *  and a minigame difficulty coefficient (1 = neutral, >1 = harder). */
export interface FishMeta {
  minWeight: number;
  maxWeight: number;
  minLength: number;
  maxLength: number;
  catchDifficulty: number;
  /** habitat depth band, meters */
  minM: number;
  maxM: number;
}

export const FISH_META: Record<string, FishMeta> = {
  sardine: { minWeight: 0.02, maxWeight: 0.25, minLength: 8, maxLength: 22, catchDifficulty: 0.85, minM: 0, maxM: 8 },
  clownfish: { minWeight: 0.3, maxWeight: 2, minLength: 6, maxLength: 16, catchDifficulty: 1.0, minM: 0, maxM: 10 },
  butterfly: { minWeight: 0.1, maxWeight: 0.6, minLength: 10, maxLength: 22, catchDifficulty: 1.0, minM: 0, maxM: 12 },
  parrot: { minWeight: 0.5, maxWeight: 4, minLength: 20, maxLength: 60, catchDifficulty: 1.05, minM: 2, maxM: 15 },
  bluetang: { minWeight: 0.2, maxWeight: 1.2, minLength: 15, maxLength: 31, catchDifficulty: 1.05, minM: 3, maxM: 18 },
  angelfish: { minWeight: 0.3, maxWeight: 2.5, minLength: 12, maxLength: 38, catchDifficulty: 1.1, minM: 4, maxM: 16 },
  seabass: { minWeight: 0.5, maxWeight: 9, minLength: 25, maxLength: 70, catchDifficulty: 0.95, minM: 5, maxM: 20 },
  lionfish: { minWeight: 0.4, maxWeight: 3.5, minLength: 18, maxLength: 47, catchDifficulty: 1.15, minM: 6, maxM: 25 },
  puffer: { minWeight: 0.5, maxWeight: 4, minLength: 15, maxLength: 50, catchDifficulty: 1.1, minM: 8, maxM: 25 },
  mahimahi: { minWeight: 3, maxWeight: 30, minLength: 60, maxLength: 200, catchDifficulty: 1.2, minM: 5, maxM: 30 },
  tarpon: { minWeight: 10, maxWeight: 120, minLength: 90, maxLength: 250, catchDifficulty: 1.25, minM: 8, maxM: 35 },
  tuna: { minWeight: 20, maxWeight: 250, minLength: 80, maxLength: 300, catchDifficulty: 1.3, minM: 15, maxM: 50 },
  barracuda: { minWeight: 3, maxWeight: 40, minLength: 60, maxLength: 165, catchDifficulty: 1.25, minM: 20, maxM: 60 },
  yellowfin: { minWeight: 15, maxWeight: 180, minLength: 80, maxLength: 240, catchDifficulty: 1.4, minM: 20, maxM: 70 },
  grouper: { minWeight: 30, maxWeight: 400, minLength: 100, maxLength: 270, catchDifficulty: 1.45, minM: 25, maxM: 80 },
  marlin: { minWeight: 80, maxWeight: 700, minLength: 200, maxLength: 450, catchDifficulty: 1.55, minM: 30, maxM: 90 },
  swordfish: { minWeight: 50, maxWeight: 650, minLength: 200, maxLength: 450, catchDifficulty: 1.6, minM: 40, maxM: 110 },
  hammerhead: { minWeight: 80, maxWeight: 450, minLength: 200, maxLength: 600, catchDifficulty: 1.5, minM: 50, maxM: 120 },
  tigershark: { minWeight: 150, maxWeight: 800, minLength: 250, maxLength: 550, catchDifficulty: 1.65, minM: 60, maxM: 130 },
  manta: { minWeight: 50, maxWeight: 1000, minLength: 200, maxLength: 700, catchDifficulty: 1.55, minM: 80, maxM: 150 },
  whaleshark: { minWeight: 5000, maxWeight: 20000, minLength: 500, maxLength: 1200, catchDifficulty: 1.7, minM: 120, maxM: 160 },

  anchovy: { minWeight: 0.01, maxWeight: 0.1, minLength: 6, maxLength: 18, catchDifficulty: 0.8, minM: 0, maxM: 6 },
  herring: { minWeight: 0.05, maxWeight: 0.5, minLength: 12, maxLength: 30, catchDifficulty: 0.85, minM: 0, maxM: 8 },
  goby: { minWeight: 0.02, maxWeight: 0.2, minLength: 6, maxLength: 18, catchDifficulty: 0.9, minM: 3, maxM: 18 },
  wrasse: { minWeight: 0.1, maxWeight: 1.2, minLength: 12, maxLength: 35, catchDifficulty: 0.95, minM: 2, maxM: 15 },
  horsemackerel: { minWeight: 0.2, maxWeight: 2, minLength: 18, maxLength: 50, catchDifficulty: 1.0, minM: 5, maxM: 20 },
  seabream: { minWeight: 0.3, maxWeight: 4, minLength: 20, maxLength: 60, catchDifficulty: 1.0, minM: 8, maxM: 22 },
  foxface: { minWeight: 0.2, maxWeight: 1.5, minLength: 15, maxLength: 28, catchDifficulty: 1.05, minM: 10, maxM: 24 },
  lutjanus: { minWeight: 0.5, maxWeight: 8, minLength: 25, maxLength: 70, catchDifficulty: 1.1, minM: 10, maxM: 28 },
  triggerfish: { minWeight: 0.3, maxWeight: 5, minLength: 20, maxLength: 60, catchDifficulty: 1.1, minM: 8, maxM: 24 },
  mola: { minWeight: 100, maxWeight: 1000, minLength: 150, maxLength: 330, catchDifficulty: 1.3, minM: 18, maxM: 40 },
  sailfish: { minWeight: 25, maxWeight: 100, minLength: 200, maxLength: 340, catchDifficulty: 1.4, minM: 20, maxM: 45 },
  snapper: { minWeight: 1, maxWeight: 12, minLength: 30, maxLength: 90, catchDifficulty: 1.2, minM: 15, maxM: 38 },
  pompano: { minWeight: 0.5, maxWeight: 8, minLength: 25, maxLength: 65, catchDifficulty: 1.2, minM: 10, maxM: 30 },
  wahoo: { minWeight: 8, maxWeight: 80, minLength: 100, maxLength: 250, catchDifficulty: 1.45, minM: 25, maxM: 55 },
  trevally: { minWeight: 10, maxWeight: 80, minLength: 60, maxLength: 170, catchDifficulty: 1.45, minM: 22, maxM: 50 },
  blackfin: { minWeight: 10, maxWeight: 60, minLength: 70, maxLength: 110, catchDifficulty: 1.4, minM: 25, maxM: 55 },
  napoleon: { minWeight: 30, maxWeight: 190, minLength: 100, maxLength: 230, catchDifficulty: 1.5, minM: 28, maxM: 58 },
  greatwhite: { minWeight: 400, maxWeight: 2000, minLength: 350, maxLength: 600, catchDifficulty: 1.7, minM: 50, maxM: 120 },
  bluemarlin: { minWeight: 100, maxWeight: 820, minLength: 250, maxLength: 450, catchDifficulty: 1.7, minM: 50, maxM: 110 },
  giantmarlin: { minWeight: 200, maxWeight: 900, minLength: 350, maxLength: 500, catchDifficulty: 1.8, minM: 55, maxM: 120 },
  diamond: { minWeight: 800, maxWeight: 3000, minLength: 600, maxLength: 800, catchDifficulty: 2.0, minM: 70, maxM: 150 },
  radioactive: { minWeight: 600, maxWeight: 2500, minLength: 500, maxLength: 720, catchDifficulty: 2.1, minM: 90, maxM: 155 },
  darkmatter: { minWeight: 2000, maxWeight: 9000, minLength: 1000, maxLength: 1400, catchDifficulty: 2.3, minM: 120, maxM: 160 },
};

export function fishMeta(id: string): FishMeta {
  return (
    FISH_META[id] ?? {
      minWeight: 0.1,
      maxWeight: 1,
      minLength: 10,
      maxLength: 30,
      catchDifficulty: 1,
      minM: 0,
      maxM: 10,
    }
  );
}
