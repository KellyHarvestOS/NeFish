"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import Modal from "./Modal";
import { Icons } from "./icons";
import { useGameStore } from "@/store/gameStore";
import {
  BAIT_GROUPS,
  BaitQuality,
  QUALITY_LABEL,
  QUALITY_BONUS,
  baitUnitPrice,
  baitKey,
} from "@/data/bait";
import { FISH_BY_ID, RARITY_COLORS } from "@/data/fish";

const QUALITIES: BaitQuality[] = ["normal", "good", "premium"];

export default function BaitModal() {
  const coins = useGameStore((s) => s.coins);
  const baitStock = useGameStore((s) => s.baitStock);
  const equippedBait = useGameStore((s) => s.equippedBait);
  const buyBait = useGameStore((s) => s.buyBait);
  const equipBait = useGameStore((s) => s.equipBait);
  const setBaitOpen = useGameStore((s) => s.setBaitOpen);
  const cap = useGameStore((s) => s.derived().baitCapacity);

  const [quality, setQuality] = useState<BaitQuality>("normal");

  return (
    <Modal title="Приманки" icon={Icons.bait} onClose={() => setBaitOpen(false)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {QUALITIES.map((q) => (
            <button
              key={q}
              onClick={() => setQuality(q)}
              className={`rounded-xl px-3 py-1.5 text-sm font-bold transition ${
                quality === q
                  ? "bg-emerald-400 text-emerald-950"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              {QUALITY_LABEL[q]}
              {QUALITY_BONUS[q] > 0 && (
                <span className="ml-1 text-[10px]">
                  +{QUALITY_BONUS[q] * 100}%
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-amber-400/90 px-3 py-1 text-sm font-bold text-amber-950">
          <Icons.coins size={14} /> {coins}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {BAIT_GROUPS.map((g) => {
          const key = baitKey(g.id, quality);
          const have = baitStock[key] ?? 0;
          const totalHave = QUALITIES.reduce(
            (a, q) => a + (baitStock[baitKey(g.id, q)] ?? 0),
            0,
          );
          const unit = baitUnitPrice(g, quality);
          const isEquipped = equippedBait === key;
          const canAfford = coins >= unit;
          const full = have >= cap;
          return (
            <div
              key={g.id}
              className="rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10"
              style={{ outline: isEquipped ? `2px solid ${g.color}` : "none" }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-white/15"
                  style={{ background: `${g.color}33`, color: g.color }}
                >
                  <Icons.bait size={20} />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{g.name}</span>
                    {g.rarities.map((r) => (
                      <span
                        key={r}
                        className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
                        style={{ background: RARITY_COLORS[r], color: "#0b1f33" }}
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-white/65">{g.description}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {g.species.map((sid) => (
                      <span
                        key={sid}
                        className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/75"
                      >
                        {FISH_BY_ID[sid]?.name ?? sid}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right text-xs text-white/60">
                  В запасе
                  <div className="text-base font-extrabold text-white">
                    {have}/{cap}
                  </div>
                  {totalHave > have && (
                    <div className="text-[10px] text-white/40">
                      всего {totalHave}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  disabled={!canAfford || full}
                  onClick={() => buyBait(key, 1)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition ${
                    full
                      ? "cursor-not-allowed bg-white/5 text-white/40"
                      : canAfford
                        ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                        : "cursor-not-allowed bg-white/5 text-white/40"
                  }`}
                >
                  <Icons.coins size={13} /> {unit} · +1
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  disabled={coins < unit * 10 || full}
                  onClick={() => buyBait(key, 10)}
                  className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                    coins >= unit * 10 && !full
                      ? "bg-white/15 hover:bg-white/25"
                      : "cursor-not-allowed bg-white/5 text-white/40"
                  }`}
                >
                  +10
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  disabled={have <= 0 || isEquipped}
                  onClick={() => equipBait(key)}
                  className={`ml-auto flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition ${
                    isEquipped
                      ? "bg-sky-500/40 text-sky-100 ring-1 ring-sky-300"
                      : have > 0
                        ? "bg-gradient-to-br from-sky-400 to-indigo-600"
                        : "cursor-not-allowed bg-white/5 text-white/40"
                  }`}
                >
                  {isEquipped ? (
                    <>
                      <FiCheck size={14} /> Надета
                    </>
                  ) : (
                    "Надеть"
                  )}
                </motion.button>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
