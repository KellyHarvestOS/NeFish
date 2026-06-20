"use client";

import { motion } from "framer-motion";
import Modal from "./Modal";
import { UPGRADES, upgradeCost } from "@/data/upgrades";
import { useGameStore } from "@/store/gameStore";
import { Icons, UPGRADE_ICONS } from "./icons";

export default function UpgradesModal() {
  const coins = useGameStore((s) => s.coins);
  const upgrades = useGameStore((s) => s.upgrades);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);
  const setUpgradesOpen = useGameStore((s) => s.setUpgradesOpen);

  return (
    <Modal
      title="Улучшения"
      icon={Icons.upgrades}
      onClose={() => setUpgradesOpen(false)}
    >
      <div className="mb-4 flex justify-end">
        <div className="flex items-center gap-1.5 rounded-full bg-amber-400/90 px-3 py-1 text-sm font-bold text-amber-950">
          <Icons.coins size={14} /> {coins}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {UPGRADES.map((def) => {
          const UIcon = UPGRADE_ICONS[def.id];
          const lvl = upgrades[def.id];
          const maxed = lvl >= def.maxLevel;
          const cost = upgradeCost(def, lvl);
          const canAfford = coins >= cost;
          const pct = (lvl / def.maxLevel) * 100;
          return (
            <motion.div
              key={def.id}
              whileHover={{ scale: 1.01 }}
              className="flex items-center gap-4 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/40 to-indigo-600/40 ring-1 ring-white/15">
                <UIcon size={22} />
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{def.name}</span>
                  <span className="text-xs text-white/55">
                    Ур. {lvl}/{def.maxLevel}
                  </span>
                </div>
                <p className="mb-2 text-xs text-white/65">{def.description}</p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-sky-300 to-indigo-500"
                    animate={{ width: `${pct}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  />
                </div>
                <div className="mt-1 text-[11px] font-semibold text-emerald-300">
                  Сейчас: +{lvl * def.perLevel}
                  {def.unit}
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.94 }}
                whileHover={{ scale: maxed ? 1 : 1.05 }}
                disabled={maxed || !canAfford}
                onClick={() => buyUpgrade(def.id)}
                className={`flex min-w-[104px] items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition ${
                  maxed
                    ? "bg-amber-400/30 text-amber-200"
                    : canAfford
                      ? "bg-gradient-to-br from-sky-400 to-indigo-600 shadow-md shadow-indigo-900/30"
                      : "cursor-not-allowed bg-white/5 text-white/40"
                }`}
              >
                {maxed ? (
                  "МАКС"
                ) : (
                  <>
                    <Icons.coins size={14} /> {cost}
                  </>
                )}
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </Modal>
  );
}
