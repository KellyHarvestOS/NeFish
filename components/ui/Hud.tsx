"use client";

import { motion } from "framer-motion";
import type { IconType } from "react-icons";
import { useGameStore } from "@/store/gameStore";
import { parseBaitKey } from "@/data/bait";
import { Icons } from "./icons";

function Stat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: IconType;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/10">
      <Icon size={18} style={{ color: accent }} />
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] uppercase tracking-wide text-white/55">
          {label}
        </span>
        <span className="text-sm font-bold" style={{ color: "#fff" }}>
          {value}
        </span>
      </div>
    </div>
  );
}

export default function Hud() {
  const coins = useGameStore((s) => s.coins);
  const level = useGameStore((s) => s.level);
  const xp = useGameStore((s) => s.xp);
  const xpToNext = useGameStore((s) => s.xpToNext);
  const caught = useGameStore((s) => s.records.totalCaught);
  const setShopOpen = useGameStore((s) => s.setShopOpen);
  const setUpgradesOpen = useGameStore((s) => s.setUpgradesOpen);
  const setInventoryOpen = useGameStore((s) => s.setInventoryOpen);
  const setCollectionOpen = useGameStore((s) => s.setCollectionOpen);
  const setBaitOpen = useGameStore((s) => s.setBaitOpen);
  const invCount = useGameStore((s) => s.inventory.length);
  const equippedBait = useGameStore((s) => s.equippedBait);
  const baitStock = useGameStore((s) => s.baitStock);

  const xpPct = Math.min(100, (xp / xpToNext) * 100);
  const baitParsed = equippedBait ? parseBaitKey(equippedBait) : null;
  const baitName = baitParsed ? baitParsed.group.name : "нет";
  const baitCount = equippedBait ? (baitStock[equippedBait] ?? 0) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 16 }}
      className="glass-dark absolute right-4 top-4 z-30 w-72 rounded-3xl p-4 text-white"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-600 shadow-lg shadow-cyan-900/40">
          <Icons.fish size={18} />
        </span>
        <h1 className="text-lg font-extrabold tracking-tight">NeFish</h1>
        <span className="ml-auto flex items-center gap-1 rounded-full bg-amber-400/90 px-2.5 py-0.5 text-xs font-bold text-amber-950">
          <Icons.level size={13} /> {level}
        </span>
      </div>

      <div className="mb-3 flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setShopOpen(true)}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 px-3 py-2.5 text-sm font-bold shadow-lg shadow-emerald-900/30"
        >
          <Icons.shop size={16} /> Магазин
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setUpgradesOpen(true)}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 px-3 py-2.5 text-sm font-bold shadow-lg shadow-indigo-900/30"
        >
          <Icons.upgrades size={16} /> Улучшения
        </motion.button>
      </div>

      <div className="mb-3 flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setInventoryOpen(true)}
          className="relative flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-700 px-3 py-2.5 text-sm font-bold shadow-lg shadow-teal-900/30"
        >
          <Icons.inventory size={16} /> Инвентарь
          {invCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-amber-950">
              {invCount}
            </span>
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setCollectionOpen(true)}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-700 px-3 py-2.5 text-sm font-bold shadow-lg shadow-purple-900/30"
        >
          <Icons.collection size={16} /> Коллекция
        </motion.button>
      </div>

      <motion.button
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setBaitOpen(true)}
        className="mb-3 flex w-full items-center justify-between gap-2 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-600 px-3 py-2.5 text-sm font-bold shadow-lg shadow-rose-900/30"
      >
        <span className="flex items-center gap-2">
          <Icons.bait size={16} /> Приманки
        </span>
        <span className="rounded-lg bg-black/25 px-2 py-0.5 text-xs">
          {baitName} ×{baitCount}
        </span>
      </motion.button>

      <div className="grid grid-cols-2 gap-2">
        <Stat icon={Icons.coins} label="Баланс" value={coins} accent="#fbbf24" />
        <Stat icon={Icons.fish} label="Поймано" value={caught} accent="#7dd3fc" />
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-[10px] font-semibold text-white/65">
          <span className="flex items-center gap-1">
            <Icons.xp size={12} /> Опыт
          </span>
          <span>
            {xp} / {xpToNext}
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/15">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-lime-300 to-emerald-500"
            animate={{ width: `${xpPct}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
