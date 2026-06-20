"use client";

import { motion } from "framer-motion";
import Modal from "./Modal";
import FishThumb from "./FishThumb";
import { Icons } from "./icons";
import { useGameStore } from "@/store/gameStore";
import { FISH_SPECIES, FISH_BY_ID, RARITY_COLORS } from "@/data/fish";
import { formatWeight } from "@/lib/economy";

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="flex flex-col gap-1 rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/10"
    >
      <div className="flex items-center gap-2 text-xs text-white/60">
        <span style={{ color: accent }}>{icon}</span>
        {label}
      </div>
      <div className="text-lg font-extrabold leading-tight">{value}</div>
      {sub && <div className="text-[11px] text-white/55">{sub}</div>}
    </motion.div>
  );
}

export default function CollectionModal() {
  const records = useGameStore((s) => s.records);
  const setCollectionOpen = useGameStore((s) => s.setCollectionOpen);

  const nameOf = (id?: string) => (id ? FISH_BY_ID[id]?.name ?? "—" : "—");
  const discovered = FISH_SPECIES.filter(
    (sp) => (records.species[sp.id]?.count ?? 0) > 0,
  ).length;

  return (
    <Modal
      title="Коллекция"
      icon={Icons.collection}
      onClose={() => setCollectionOpen(false)}
    >
      {/* overall stats */}
      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <StatCard
          icon={<Icons.fish size={15} />}
          label="Всего поймано"
          value={String(records.totalCaught)}
          accent="#7dd3fc"
        />
        <StatCard
          icon={<Icons.coins size={15} />}
          label="Общий заработок"
          value={String(records.totalEarnings)}
          accent="#fbbf24"
        />
        <StatCard
          icon={<Icons.collection size={15} />}
          label="Видов открыто"
          value={`${discovered}/${FISH_SPECIES.length}`}
          accent="#a855f7"
        />
        <StatCard
          icon={<Icons.medal size={15} />}
          label="Самая дорогая"
          value={records.bestValue ? `${records.bestValue.value}` : "—"}
          sub={records.bestValue ? nameOf(records.bestValue.speciesId) : undefined}
          accent="#f59e0b"
        />
        <StatCard
          icon={<Icons.collection size={15} />}
          label="Самая редкая"
          value={records.rarest ? nameOf(records.rarest.speciesId) : "—"}
          sub={
            records.rarest ? FISH_BY_ID[records.rarest.speciesId]?.rarity : undefined
          }
          accent={
            records.rarest
              ? RARITY_COLORS[FISH_BY_ID[records.rarest.speciesId]?.rarity]
              : "#fff"
          }
        />
        <StatCard
          icon={<Icons.weight size={15} />}
          label="Самая тяжёлая"
          value={records.heaviest ? formatWeight(records.heaviest.weight) : "—"}
          sub={records.heaviest ? nameOf(records.heaviest.speciesId) : undefined}
          accent="#34d399"
        />
      </div>

      {/* per-species records */}
      <h3 className="mb-2 text-sm font-bold text-white/80">Рекорды по видам</h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {FISH_SPECIES.map((sp) => {
          const rec = records.species[sp.id];
          const found = !!rec && rec.count > 0;
          const color = RARITY_COLORS[sp.rarity];
          return (
            <div
              key={sp.id}
              className="flex items-center gap-3 rounded-2xl bg-white/[0.05] p-2 ring-1 ring-white/10"
              style={{ opacity: found ? 1 : 0.45 }}
            >
              <div
                className="rounded-xl bg-slate-900/40 p-1"
                style={{ filter: found ? "none" : "grayscale(1) brightness(0.6)" }}
              >
                <FishThumb speciesId={sp.id} size={44} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-bold">{sp.name}</span>
                  <span
                    className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
                    style={{ background: color, color: "#0b1f33" }}
                  >
                    {sp.rarity}
                  </span>
                </div>
                <div className="text-[11px] text-white/65">
                  {found ? (
                    <>
                      Лучший вес:{" "}
                      <b className="text-emerald-300">
                        {formatWeight(rec.bestWeight)}
                      </b>{" "}
                      · поймано {rec.count}
                    </>
                  ) : (
                    "Ещё не пойман"
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
