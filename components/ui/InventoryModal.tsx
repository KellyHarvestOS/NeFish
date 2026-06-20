"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Modal from "./Modal";
import FishThumb from "./FishThumb";
import { Icons } from "./icons";
import { useGameStore, FishInstance } from "@/store/gameStore";
import { RARITY_COLORS, RARITY_ORDER, Rarity, rarityRank } from "@/data/fish";
import { formatWeight, formatLength } from "@/lib/economy";

type SortKey = "date" | "weight" | "value" | "rarity";
type Filter = "all" | Rarity;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Все" },
  ...RARITY_ORDER.map((r) => ({ id: r as Filter, label: r })),
];

const SORTS: { id: SortKey; label: string }[] = [
  { id: "date", label: "Дате" },
  { id: "weight", label: "Весу" },
  { id: "value", label: "Стоимости" },
  { id: "rarity", label: "Редкости" },
];

function dateStr(ms: number) {
  const d = new Date(ms);
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InventoryModal() {
  const inventory = useGameStore((s) => s.inventory);
  const sellFish = useGameStore((s) => s.sellFish);
  const sellAll = useGameStore((s) => s.sellAll);
  const setInventoryOpen = useGameStore((s) => s.setInventoryOpen);
  const cap = useGameStore((s) => s.derived().inventory);

  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<SortKey>("date");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const list = useMemo(() => {
    let arr = inventory.filter((f) => filter === "all" || f.rarity === filter);
    arr = [...arr].sort((a, b) => {
      switch (sort) {
        case "weight":
          return b.weight - a.weight;
        case "value":
          return b.value - a.value;
        case "rarity":
          return rarityRank(b.rarity) - rarityRank(a.rarity) || b.value - a.value;
        default:
          return b.catchDate - a.catchDate;
      }
    });
    return arr;
  }, [inventory, filter, sort]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const selectedValue = list
    .filter((f) => selected.has(f.id))
    .reduce((a, f) => a + f.value, 0);
  const totalValue = inventory.reduce((a, f) => a + f.value, 0);

  const sellSelected = () => {
    sellFish([...selected]);
    setSelected(new Set());
  };

  return (
    <Modal
      title={`Инвентарь  (${inventory.length}/${cap})`}
      icon={Icons.inventory}
      onClose={() => setInventoryOpen(false)}
    >
      {/* controls */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
              filter === f.id
                ? "text-slate-900"
                : "bg-white/10 text-white/75 hover:bg-white/20"
            }`}
            style={
              filter === f.id
                ? {
                    background:
                      f.id === "all" ? "#e2e8f0" : RARITY_COLORS[f.id as Rarity],
                  }
                : undefined
            }
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-white/55">Сортировка по:</span>
        {SORTS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSort(s.id)}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
              sort === s.id
                ? "bg-sky-400 text-slate-900"
                : "bg-white/10 text-white/75 hover:bg-white/20"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* list */}
      {list.length === 0 ? (
        <div className="py-16 text-center text-white/50">
          Пока пусто. Поймайте рыбу!
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {list.map((f) => {
            const color = RARITY_COLORS[f.rarity];
            const isSel = selected.has(f.id);
            return (
              <motion.div
                key={f.id}
                layout
                whileHover={{ scale: 1.01 }}
                onClick={() => toggle(f.id)}
                className="flex cursor-pointer items-center gap-3 rounded-2xl p-2.5 ring-1 transition"
                style={{
                  background: isSel ? `${color}22` : "rgba(255,255,255,0.05)",
                  borderColor: color,
                  outline: isSel ? `2px solid ${color}` : "none",
                  boxShadow: `inset 3px 0 0 ${color}`,
                }}
              >
                <div
                  className="rounded-xl bg-slate-900/40 p-1"
                  style={{ boxShadow: `0 0 12px ${color}33` }}
                >
                  <FishThumb speciesId={f.speciesId} size={48} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-bold">{f.name}</span>
                    <span
                      className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
                      style={{ background: color, color: "#0b1f33" }}
                    >
                      {f.rarity}
                    </span>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-white/70">
                    <span className="flex items-center gap-1">
                      <Icons.weight size={10} /> {formatWeight(f.weight)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icons.length size={10} /> {formatLength(f.length)}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-amber-300">
                      <Icons.coins size={10} /> {f.value}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-[10px] text-white/40">
                    <Icons.date size={9} /> {dateStr(f.catchDate)}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sellFish([f.id]);
                  }}
                  className="flex items-center gap-1 rounded-lg bg-amber-400/90 px-2.5 py-1.5 text-xs font-bold text-amber-950 transition hover:bg-amber-300"
                >
                  <Icons.coins size={12} /> Продать
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* footer actions */}
      <div className="sticky bottom-0 mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          disabled={selected.size === 0}
          onClick={sellSelected}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition ${
            selected.size
              ? "bg-gradient-to-br from-amber-400 to-orange-500 text-amber-950"
              : "cursor-not-allowed bg-white/5 text-white/40"
          }`}
        >
          <Icons.coins size={14} /> Продать выбранные ({selected.size}) ·{" "}
          {selectedValue}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          disabled={inventory.length === 0}
          onClick={sellAll}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition ${
            inventory.length
              ? "bg-white/15 hover:bg-white/25"
              : "cursor-not-allowed bg-white/5 text-white/40"
          }`}
        >
          <Icons.trash size={14} /> Продать всё · {totalValue}
        </motion.button>
      </div>
    </Modal>
  );
}
