import type { IconType } from "react-icons";
import {
  FiShoppingCart,
  FiTrendingUp,
  FiAward,
  FiBarChart2,
  FiZap,
  FiTarget,
  FiArrowDownCircle,
  FiPackage,
  FiRotateCw,
  FiTrash2,
  FiCalendar,
  FiAlertTriangle,
  FiSliders,
  FiBox,
} from "react-icons/fi";
import {
  FaCoins,
  FaFish,
  FaTrophy,
  FaWeightHanging,
  FaRulerHorizontal,
  FaMedal,
  FaSnowflake,
  FaUserGraduate,
} from "react-icons/fa";
import {
  GiFishingPole,
  GiFishingHook,
  GiWorms,
  GiRopeCoil,
  GiFishingNet,
  GiFishingLure,
} from "react-icons/gi";
import type { ShopCategory } from "@/data/shop";
import type { UpgradeId } from "@/data/upgrades";

export const Icons = {
  shop: FiShoppingCart,
  upgrades: FiTrendingUp,
  coins: FaCoins,
  level: FiAward,
  xp: FiBarChart2,
  fish: FaFish,
  inventory: GiFishingNet,
  collection: FaTrophy,
  weight: FaWeightHanging,
  length: FaRulerHorizontal,
  date: FiCalendar,
  trash: FiTrash2,
  medal: FaMedal,
  rod: GiFishingPole,
  warn: FiAlertTriangle,
  control: FiSliders,
  bait: GiFishingLure,
};

export const CATEGORY_ICONS: Record<ShopCategory, IconType> = {
  rod: GiFishingPole,
  reel: FiRotateCw,
  hook: GiFishingHook,
  line: GiRopeCoil,
};

export const UPGRADE_ICONS: Record<UpgradeId, IconType> = {
  reelSpeed: FiZap,
  luck: FiTarget,
  rareChance: FiAward,
  depth: FiArrowDownCircle,
  inventory: FiPackage,
  control: FiSliders,
  baitContainer: FiBox,
  fridge: FaSnowflake,
  fisherSkill: FaUserGraduate,
};
