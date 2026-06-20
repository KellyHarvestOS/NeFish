"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import Modal from "./Modal";
import { SHOP_ITEMS, ShopCategory } from "@/data/shop";
import { useGameStore } from "@/store/gameStore";
import { Icons, CATEGORY_ICONS } from "./icons";

const CATEGORIES: { id: ShopCategory; label: string }[] = [
  { id: "rod", label: "Удочки" },
  { id: "reel", label: "Катушки" },
  { id: "hook", label: "Крючки" },
  { id: "line", label: "Леска" },
];

function CoinBadge({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-amber-400/90 px-3 py-1 text-sm font-bold text-amber-950">
      <Icons.coins size={14} /> {value}
    </div>
  );
}

export default function ShopModal() {
  const [cat, setCat] = useState<ShopCategory>("rod");
  const coins = useGameStore((s) => s.coins);
  const owned = useGameStore((s) => s.ownedItems);
  const equipped = useGameStore((s) => s.equipped);
  const buyItem = useGameStore((s) => s.buyItem);
  const setShopOpen = useGameStore((s) => s.setShopOpen);

  const items = SHOP_ITEMS.filter((i) => i.category === cat);

  return (
    <Modal title="Магазин" icon={Icons.shop} onClose={() => setShopOpen(false)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const CIcon = CATEGORY_ICONS[c.id];
            return (
              <motion.button
                key={c.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => setCat(c.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-bold transition ${
                  cat === c.id
                    ? "bg-emerald-400 text-emerald-950 shadow-md shadow-emerald-900/30"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                <CIcon size={15} /> {c.label}
              </motion.button>
            );
          })}
        </div>
        <CoinBadge value={coins} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const ItemIcon = CATEGORY_ICONS[item.category];
          const isOwned = owned.includes(item.id);
          const isEquipped = equipped[item.category] === item.id;
          const canAfford = coins >= item.price;
          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex flex-col rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10"
            >
              <div className="mb-1 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/40 to-indigo-600/40 ring-1 ring-white/15">
                  <ItemIcon size={18} />
                </span>
                <span className="font-bold">{item.name}</span>
              </div>
              <p className="mb-3 flex-1 text-xs text-white/65">
                {item.description}
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={!isOwned && !canAfford}
                onClick={() => buyItem(item)}
                className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition ${
                  isEquipped
                    ? "bg-sky-500/40 text-sky-100 ring-1 ring-sky-300"
                    : isOwned
                      ? "bg-white/15 hover:bg-white/25"
                      : canAfford
                        ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md shadow-emerald-900/30"
                        : "cursor-not-allowed bg-white/5 text-white/40"
                }`}
              >
                {isEquipped ? (
                  <>
                    <FiCheck size={15} /> Экипировано
                  </>
                ) : isOwned ? (
                  "Экипировать"
                ) : (
                  <>
                    <Icons.coins size={14} /> {item.price}
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
