"use client";

import { motion } from "framer-motion";
import { RARITY_COLORS } from "@/data/fish";
import { FishInstance } from "@/store/gameStore";
import { formatWeight } from "@/lib/economy";
import FishThumb from "./FishThumb";
import { Icons } from "./icons";

export default function CatchToast({ fish }: { fish: FishInstance }) {
  const color = RARITY_COLORS[fish.rarity];
  return (
    <motion.div
      initial={{ opacity: 0, y: -30, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className="glass-dark mb-2 flex items-center gap-3 rounded-2xl px-4 py-2.5 text-white"
      style={{ boxShadow: `0 0 26px ${color}55`, borderColor: `${color}88` }}
    >
      <div
        className="rounded-xl bg-slate-900/40 p-0.5"
        style={{ boxShadow: `0 0 14px ${color}44` }}
      >
        <FishThumb speciesId={fish.speciesId} size={42} />
      </div>
      <div className="leading-tight">
        <div className="flex items-center gap-2">
          <span className="font-extrabold">{fish.name}</span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
            style={{ background: color, color: "#0b1f33" }}
          >
            {fish.rarity}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-white/80">
          <span className="flex items-center gap-1">
            <Icons.weight size={11} /> {formatWeight(fish.weight)}
          </span>
          <span className="flex items-center gap-1 font-bold text-amber-300">
            <Icons.coins size={11} /> {fish.value}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
