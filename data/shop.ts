export type ShopCategory = "rod" | "reel" | "hook" | "line";

export interface ShopItem {
  id: string;
  category: ShopCategory;
  name: string;
  description: string;
  price: number;
  icon: string;
  /** stat bonuses applied while owned (equipped automatically) */
  bonus: {
    reelSpeed?: number; // multiplier
    luck?: number; // additive %
    rareChance?: number; // additive %
    depth?: number; // additive depth fraction
    value?: number; // multiplier on coins
    maxTension?: number; // additive tension headroom (percent points)
    jerkResist?: number; // additive 0..1 reduction of jerk impact
  };
}

export const SHOP_ITEMS: ShopItem[] = [
  // Rods
  {
    id: "rod-wood",
    category: "rod",
    name: "Деревянная удочка",
    description: "Простая палка, тонкая леска, дешёвый крючок.",
    price: 0,
    icon: "🎣",
    bonus: {},
  },
  {
    id: "rod-bamboo",
    category: "rod",
    name: "Бамбуковая удочка",
    description: "Зеленоватая и длиннее обычной. +10% к стоимости улова.",
    price: 150,
    icon: "🎣",
    bonus: { value: 1.1 },
  },
  {
    id: "rod-carbon",
    category: "rod",
    name: "Углеволоконная удочка",
    description: "Чёрный корпус, современные кольца. +25% к улову, гасит рывки 15%.",
    price: 450,
    icon: "🎣",
    bonus: { value: 1.25, jerkResist: 0.15 },
  },
  {
    id: "rod-sea",
    category: "rod",
    name: "Морская профессиональная",
    description: "Большая катушка, усиленная леска. +35% улов, +20 натяжения, рывки −25%.",
    price: 1800,
    icon: "🎣",
    bonus: { value: 1.35, maxTension: 20, jerkResist: 0.25, reelSpeed: 1.15 },
  },
  {
    id: "rod-legendary",
    category: "rod",
    name: "Легендарная удочка",
    description: "Золотые элементы и резьба. +80% улов, +30 натяжения, рывки −38%.",
    price: 9000,
    icon: "🎣",
    bonus: { value: 1.8, maxTension: 30, jerkResist: 0.38 },
  },
  {
    id: "rod-mythic",
    category: "rod",
    name: "Мифическая удочка",
    description: "Светящаяся, с частицами и уникальной анимацией. +150% улов, всё максимально.",
    price: 50000,
    icon: "🎣",
    bonus: { value: 2.5, maxTension: 50, jerkResist: 0.5, reelSpeed: 1.3 },
  },
  // Reels
  {
    id: "reel-basic",
    category: "reel",
    name: "Простая катушка",
    description: "Стандартная скорость вытягивания.",
    price: 0,
    icon: "🌀",
    bonus: {},
  },
  {
    id: "reel-sport",
    category: "reel",
    name: "Спортивная катушка",
    description: "+30% к скорости вытягивания.",
    price: 280,
    icon: "🌀",
    bonus: { reelSpeed: 1.3 },
  },
  {
    id: "reel-turbo",
    category: "reel",
    name: "Турбо катушка",
    description: "+70% к скорости вытягивания.",
    price: 1200,
    icon: "🌀",
    bonus: { reelSpeed: 1.7 },
  },
  // Hooks
  {
    id: "hook-steel",
    category: "hook",
    name: "Стальной крючок",
    description: "Обычный крючок.",
    price: 0,
    icon: "🪝",
    bonus: {},
  },
  {
    id: "hook-sharp",
    category: "hook",
    name: "Острый крючок",
    description: "+10% удачи при ловле.",
    price: 220,
    icon: "🪝",
    bonus: { luck: 10 },
  },
  {
    id: "hook-gold",
    category: "hook",
    name: "Золотой крючок",
    description: "+25% удачи, рыба клюёт охотнее.",
    price: 950,
    icon: "🪝",
    bonus: { luck: 25 },
  },
  // Line
  {
    id: "line-nylon",
    category: "line",
    name: "Нейлоновая леска",
    description: "Базовая глубина погружения.",
    price: 0,
    icon: "🧵",
    bonus: {},
  },
  {
    id: "line-fluoro",
    category: "line",
    name: "Флюорокарбон",
    description: "+15% глубины, +15 к максимальному натяжению.",
    price: 260,
    icon: "🧵",
    bonus: { depth: 0.15, maxTension: 15 },
  },
  {
    id: "line-deep",
    category: "line",
    name: "Глубоководная леска",
    description: "+35% глубины, +35 к максимальному натяжению.",
    price: 1500,
    icon: "🧵",
    bonus: { depth: 0.35, maxTension: 35 },
  },
];
