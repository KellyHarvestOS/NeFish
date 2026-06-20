"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  FISH_BY_ID,
  FishSpecies,
  Rarity,
  rarityRank,
  OCEAN_DEPTH_M,
} from "@/data/fish";
import { SHOP_ITEMS, ShopItem, ShopCategory } from "@/data/shop";
import { UPGRADES, UpgradeId, upgradeCost } from "@/data/upgrades";
import {
  computeValue,
  rollWeight,
  rollLength,
} from "@/lib/economy";
import { parseBaitKey, baitUnitPrice } from "@/data/bait";

/** A single caught specimen (InventorySystem). */
export interface FishInstance {
  id: string;
  speciesId: string;
  name: string;
  rarity: Rarity;
  weight: number; // kg
  length: number; // cm
  value: number; // sell price at catch time
  catchDate: number; // epoch ms
}

/** FishRecords — persistent best-of stats. */
export interface SpeciesRecord {
  bestWeight: number;
  count: number;
}
export interface Records {
  totalCaught: number;
  totalEarnings: number;
  bestValue: { speciesId: string; value: number; weight: number } | null;
  rarest: { speciesId: string; rank: number; weight: number } | null;
  heaviest: { speciesId: string; weight: number } | null;
  species: Record<string, SpeciesRecord>;
}

export interface DerivedStats {
  reelSpeed: number;
  luck: number;
  rareChance: number;
  depth: number;
  valueMult: number;
  inventory: number;
  maxTension: number; // break threshold for the fight (base 100)
  jerkResist: number; // 0..0.7 reduction of jerk impact (rod)
  control: number; // extra tension decay fraction on release
  depthReach: number; // max hook depth in meters
  baitCapacity: number; // max stock per bait type
  fridge: number; // 0..1 chance to not consume expensive bait
  fisherSkill: number; // 0..1 chance to keep bait after a catch
}

interface GameState {
  coins: number;
  level: number;
  xp: number;
  xpToNext: number;

  inventory: FishInstance[];
  records: Records;

  ownedItems: string[];
  equipped: Record<ShopCategory, string>;
  upgrades: Record<UpgradeId, number>;

  // BaitSystem
  baitStock: Record<string, number>; // key `${group}:${quality}` -> count
  equippedBait: string | null;

  shopOpen: boolean;
  upgradesOpen: boolean;
  inventoryOpen: boolean;
  collectionOpen: boolean;
  baitOpen: boolean;

  // FishCatchMinigame is in progress for this species
  fight: { speciesId: string } | null;

  // actions
  startFight: (species: FishSpecies) => void;
  endFight: () => void;
  commitCatch: (species: FishSpecies) => FishInstance;
  sellFish: (ids: string[]) => void;
  sellAll: () => void;

  buyItem: (item: ShopItem) => boolean;
  equip: (item: ShopItem) => void;
  buyUpgrade: (id: UpgradeId) => boolean;

  buyBait: (key: string, qty: number) => boolean;
  equipBait: (key: string) => void;
  loseBaitOnEscape: () => void;

  setShopOpen: (v: boolean) => void;
  setUpgradesOpen: (v: boolean) => void;
  setInventoryOpen: (v: boolean) => void;
  setCollectionOpen: (v: boolean) => void;
  setBaitOpen: (v: boolean) => void;

  derived: () => DerivedStats;
  reset: () => void;
}

const xpForLevel = (lvl: number) => Math.round(50 * Math.pow(1.35, lvl - 1));

const defaultEquipped: Record<ShopCategory, string> = {
  rod: "rod-wood",
  reel: "reel-basic",
  hook: "hook-steel",
  line: "line-nylon",
};

const emptyRecords = (): Records => ({
  totalCaught: 0,
  totalEarnings: 0,
  bestValue: null,
  rarest: null,
  heaviest: null,
  species: {},
});

const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const closePanels = {
  shopOpen: false,
  upgradesOpen: false,
  inventoryOpen: false,
  collectionOpen: false,
  baitOpen: false,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      coins: 50,
      level: 1,
      xp: 0,
      xpToNext: xpForLevel(1),

      inventory: [],
      records: emptyRecords(),

      ownedItems: Object.values(defaultEquipped),
      equipped: { ...defaultEquipped },
      upgrades: { reelSpeed: 0, luck: 0, rareChance: 0, depth: 0, inventory: 0, control: 0, baitContainer: 0, fridge: 0, fisherSkill: 0 },

      baitStock: { "worm:normal": 10 },
      equippedBait: "worm:normal",

      shopOpen: false,
      upgradesOpen: false,
      inventoryOpen: false,
      collectionOpen: false,
      baitOpen: false,
      fight: null,

      derived: () => {
        const s = get();
        const stats: DerivedStats = {
          reelSpeed: 1,
          luck: 0,
          rareChance: 0,
          depth: 0,
          valueMult: 1,
          inventory: 12,
          maxTension: 100,
          jerkResist: 0,
          control: 0,
          depthReach: 30,
          baitCapacity: 20,
          fridge: 0,
          fisherSkill: 0,
        };
        (Object.values(s.equipped) as string[]).forEach((id) => {
          const item = SHOP_ITEMS.find((i) => i.id === id);
          if (!item) return;
          const b = item.bonus;
          if (b.reelSpeed) stats.reelSpeed *= b.reelSpeed;
          if (b.luck) stats.luck += b.luck;
          if (b.rareChance) stats.rareChance += b.rareChance;
          if (b.depth) stats.depth += b.depth;
          if (b.value) stats.valueMult *= b.value;
          if (b.maxTension) stats.maxTension += b.maxTension;
          if (b.jerkResist) stats.jerkResist += b.jerkResist;
        });
        for (const def of UPGRADES) {
          const lvl = s.upgrades[def.id] ?? 0;
          const amt = lvl * def.perLevel;
          if (def.id === "reelSpeed") stats.reelSpeed *= 1 + amt / 100;
          else if (def.id === "luck") stats.luck += amt;
          else if (def.id === "rareChance") stats.rareChance += amt;
          else if (def.id === "depth") stats.depth += amt / 100;
          else if (def.id === "inventory") stats.inventory += amt;
          else if (def.id === "control") stats.control += amt / 100;
          else if (def.id === "baitContainer") stats.baitCapacity += amt;
          else if (def.id === "fridge") stats.fridge += amt / 100;
          else if (def.id === "fisherSkill") stats.fisherSkill += amt / 100;
        }
        stats.jerkResist = Math.min(0.7, stats.jerkResist);
        stats.fridge = Math.min(0.85, stats.fridge);
        stats.fisherSkill = Math.min(0.85, stats.fisherSkill);
        // depth reach (m): base + line depth + reel power; can reach the seabed
        stats.depthReach = Math.min(
          OCEAN_DEPTH_M,
          28 + stats.depth * 230 + (stats.reelSpeed - 1) * 70,
        );
        return stats;
      },

      startFight: (species) => set({ fight: { speciesId: species.id } }),
      endFight: () => set({ fight: null }),

      commitCatch: (species) => {
        const s = get();
        const weight = rollWeight(species);
        const length = rollLength(species, weight);
        const value = Math.round(
          computeValue(species, weight) * s.derived().valueMult,
        );
        const inst: FishInstance = {
          id: uid(),
          speciesId: species.id,
          name: species.name,
          rarity: species.rarity,
          weight,
          length,
          value,
          catchDate: Date.now(),
        };

        // xp / level
        let xp = s.xp + species.xp;
        let level = s.level;
        let xpToNext = s.xpToNext;
        while (xp >= xpToNext) {
          xp -= xpToNext;
          level += 1;
          xpToNext = xpForLevel(level);
        }

        // records
        const records: Records = {
          ...s.records,
          totalCaught: s.records.totalCaught + 1,
          species: { ...s.records.species },
        };
        const sr = records.species[species.id] ?? { bestWeight: 0, count: 0 };
        records.species[species.id] = {
          bestWeight: Math.max(sr.bestWeight, weight),
          count: sr.count + 1,
        };
        if (!records.bestValue || value > records.bestValue.value)
          records.bestValue = { speciesId: species.id, value, weight };
        const rank = rarityRank(species.rarity);
        if (!records.rarest || rank > records.rarest.rank)
          records.rarest = { speciesId: species.id, rank, weight };
        if (!records.heaviest || weight > records.heaviest.weight)
          records.heaviest = { speciesId: species.id, weight };

        // inventory (respect capacity; overflow auto-sells)
        const cap = s.derived().inventory;
        let coins = s.coins;
        let inventory = s.inventory;
        if (s.inventory.length >= cap) {
          coins += value;
          records.totalEarnings += value;
        } else {
          inventory = [inst, ...s.inventory];
        }

        // consume bait (BaitSystem) — fisher skill / fridge may save it
        const stats = s.derived();
        const baitStock = { ...s.baitStock };
        const key = s.equippedBait;
        if (key && baitStock[key] > 0) {
          const parsed = parseBaitKey(key);
          const expensive = parsed?.group.expensive ?? false;
          const keep =
            Math.random() < stats.fisherSkill ||
            (expensive && Math.random() < stats.fridge);
          if (!keep) baitStock[key] = Math.max(0, baitStock[key] - 1);
        }

        set({
          coins,
          xp,
          level,
          xpToNext,
          inventory,
          records,
          baitStock,
          fight: null,
        });
        return inst;
      },

      loseBaitOnEscape: () => {
        const s = get();
        const key = s.equippedBait;
        if (!key || !s.baitStock[key]) return;
        // 20-30% chance to lose the bait when the fish breaks free
        if (Math.random() < 0.2 + Math.random() * 0.1) {
          set({
            baitStock: {
              ...s.baitStock,
              [key]: Math.max(0, s.baitStock[key] - 1),
            },
          });
        }
      },

      buyBait: (key, qty) => {
        const s = get();
        const parsed = parseBaitKey(key);
        if (!parsed) return false;
        const stats = s.derived();
        const have = s.baitStock[key] ?? 0;
        const room = Math.max(0, stats.baitCapacity - have);
        const buyN = Math.min(qty, room);
        if (buyN <= 0) return false;
        const unit = baitUnitPrice(parsed.group, parsed.quality);
        const cost = unit * buyN;
        if (s.coins < cost) return false;
        set({
          coins: s.coins - cost,
          baitStock: { ...s.baitStock, [key]: have + buyN },
          equippedBait: s.equippedBait ?? key,
        });
        return true;
      },

      equipBait: (key) => {
        const s = get();
        if ((s.baitStock[key] ?? 0) <= 0) return;
        set({ equippedBait: key });
      },

      sellFish: (ids) => {
        const s = get();
        const idSet = new Set(ids);
        let gained = 0;
        const remaining = s.inventory.filter((f) => {
          if (idSet.has(f.id)) {
            gained += f.value;
            return false;
          }
          return true;
        });
        set({
          inventory: remaining,
          coins: s.coins + gained,
          records: {
            ...s.records,
            totalEarnings: s.records.totalEarnings + gained,
          },
        });
      },

      sellAll: () => {
        const s = get();
        const gained = s.inventory.reduce((a, f) => a + f.value, 0);
        set({
          inventory: [],
          coins: s.coins + gained,
          records: {
            ...s.records,
            totalEarnings: s.records.totalEarnings + gained,
          },
        });
      },

      buyItem: (item) => {
        const s = get();
        if (s.ownedItems.includes(item.id)) {
          get().equip(item);
          return true;
        }
        if (s.coins < item.price) return false;
        set({
          coins: s.coins - item.price,
          ownedItems: [...s.ownedItems, item.id],
          equipped: { ...s.equipped, [item.category]: item.id },
        });
        return true;
      },

      equip: (item) => {
        const s = get();
        if (!s.ownedItems.includes(item.id)) return;
        set({ equipped: { ...s.equipped, [item.category]: item.id } });
      },

      buyUpgrade: (id) => {
        const s = get();
        const def = UPGRADES.find((u) => u.id === id)!;
        const lvl = s.upgrades[id] ?? 0;
        if (lvl >= def.maxLevel) return false;
        const cost = upgradeCost(def, lvl);
        if (s.coins < cost) return false;
        set({ coins: s.coins - cost, upgrades: { ...s.upgrades, [id]: lvl + 1 } });
        return true;
      },

      setShopOpen: (v) => set({ ...closePanels, shopOpen: v }),
      setUpgradesOpen: (v) => set({ ...closePanels, upgradesOpen: v }),
      setInventoryOpen: (v) => set({ ...closePanels, inventoryOpen: v }),
      setCollectionOpen: (v) => set({ ...closePanels, collectionOpen: v }),
      setBaitOpen: (v) => set({ ...closePanels, baitOpen: v }),

      reset: () =>
        set({
          coins: 50,
          level: 1,
          xp: 0,
          xpToNext: xpForLevel(1),
          inventory: [],
          records: emptyRecords(),
          ownedItems: Object.values(defaultEquipped),
          equipped: { ...defaultEquipped },
          upgrades: { reelSpeed: 0, luck: 0, rareChance: 0, depth: 0, inventory: 0, control: 0, baitContainer: 0, fridge: 0, fisherSkill: 0 },
          baitStock: { "worm:normal": 10 },
          equippedBait: "worm:normal",
        }),
    }),
    {
      name: "nefish-save",
      version: 2,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<GameState>;
        return {
          ...current,
          ...p,
          upgrades: { ...current.upgrades, ...(p.upgrades ?? {}) },
          equipped: { ...current.equipped, ...(p.equipped ?? {}) },
          baitStock: { ...(p.baitStock ?? current.baitStock) },
          equippedBait: p.equippedBait ?? current.equippedBait,
        };
      },
      partialize: (s) => ({
        coins: s.coins,
        level: s.level,
        xp: s.xp,
        xpToNext: s.xpToNext,
        inventory: s.inventory,
        records: s.records,
        ownedItems: s.ownedItems,
        equipped: s.equipped,
        upgrades: s.upgrades,
        baitStock: s.baitStock,
        equippedBait: s.equippedBait,
      }),
    },
  ),
);

export { FISH_BY_ID };
