"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import FishingCanvas from "./FishingCanvas";
import Hud from "./ui/Hud";
import ShopModal from "./ui/ShopModal";
import UpgradesModal from "./ui/UpgradesModal";
import InventoryModal from "./ui/InventoryModal";
import CollectionModal from "./ui/CollectionModal";
import BaitModal from "./ui/BaitModal";
import CatchToast from "./ui/CatchToast";
import FishCatchMinigame from "./ui/FishCatchMinigame";
import { useGameStore, FishInstance } from "@/store/gameStore";
import { FishSpecies } from "@/data/fish";

interface ActiveFight {
  species: FishSpecies;
  finish: (win: boolean) => void;
}

export default function GameRoot() {
  const [toasts, setToasts] = useState<{ id: number; fish: FishInstance }[]>([]);
  const [fight, setFight] = useState<ActiveFight | null>(null);
  const fightRef = useRef<ActiveFight | null>(null);

  const shopOpen = useGameStore((s) => s.shopOpen);
  const upgradesOpen = useGameStore((s) => s.upgradesOpen);
  const inventoryOpen = useGameStore((s) => s.inventoryOpen);
  const collectionOpen = useGameStore((s) => s.collectionOpen);
  const baitOpen = useGameStore((s) => s.baitOpen);
  const startFight = useGameStore((s) => s.startFight);
  const endFight = useGameStore((s) => s.endFight);
  const commitCatch = useGameStore((s) => s.commitCatch);

  const onBite = useCallback(
    (species: FishSpecies, finish: (win: boolean) => void) => {
      const f = { species, finish };
      fightRef.current = f;
      setFight(f);
      startFight(species);
    },
    [startFight],
  );

  const handleComplete = useCallback(
    (win: boolean) => {
      const f = fightRef.current;
      fightRef.current = null;
      setFight(null);
      endFight();
      if (!f) return;
      f.finish(win);
      if (win) {
        const inst = commitCatch(f.species);
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, fish: inst }]);
        setTimeout(
          () => setToasts((prev) => prev.filter((t) => t.id !== id)),
          2800,
        );
      }
    },
    [commitCatch, endFight],
  );

  return (
    <div className="relative h-full w-full select-none overflow-hidden">
      <FishingCanvas onBite={onBite} />

      <Hud />

      <div className="pointer-events-none absolute left-1/2 top-4 z-30 -translate-x-1/2">
        <AnimatePresence>
          {toasts.map((t) => (
            <CatchToast key={t.id} fish={t.fish} />
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {fight && (
          <FishCatchMinigame
            species={fight.species}
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>{shopOpen && <ShopModal />}</AnimatePresence>
      <AnimatePresence>{upgradesOpen && <UpgradesModal />}</AnimatePresence>
      <AnimatePresence>{inventoryOpen && <InventoryModal />}</AnimatePresence>
      <AnimatePresence>{collectionOpen && <CollectionModal />}</AnimatePresence>
      <AnimatePresence>{baitOpen && <BaitModal />}</AnimatePresence>

      {!fight && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 text-center text-xs font-semibold text-white/70 drop-shadow">
          Целься мышью (вправо/вниз/влево под причал) и зажми ЛКМ — сила
          заброса • Колесо или W/S — глубина • R — смотать
        </div>
      )}
    </div>
  );
}
