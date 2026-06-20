export interface RodVisual {
  /** rod shaft length multiplier (visual only) */
  lenFactor: number;
  /** shaft gradient colours */
  body: string;
  body2: string;
  /** line-guide ring colour */
  guide: string;
  reel: string;
  reelSize: number;
  /** gold decorative carving */
  gold?: boolean;
  /** glow colour around the rod */
  glow?: string;
  /** emits particles from the rod tip */
  particles?: boolean;
}

export const ROD_VISUALS: Record<string, RodVisual> = {
  "rod-wood": {
    lenFactor: 0.9,
    body: "#8a5a2b",
    body2: "#6a3f1d",
    guide: "#5a3818",
    reel: "#3a2a1a",
    reelSize: 7,
  },
  "rod-bamboo": {
    lenFactor: 1.1,
    body: "#9bbf4a",
    body2: "#6f8f2f",
    guide: "#4a5a25",
    reel: "#5a6a2a",
    reelSize: 7,
  },
  "rod-carbon": {
    lenFactor: 1.0,
    body: "#23262b",
    body2: "#0e1013",
    guide: "#7fd0ff",
    reel: "#1a1d22",
    reelSize: 8,
  },
  "rod-sea": {
    lenFactor: 1.05,
    body: "#2a3a52",
    body2: "#16202f",
    guide: "#cdd8e4",
    reel: "#39506b",
    reelSize: 11,
  },
  "rod-legendary": {
    lenFactor: 1.15,
    body: "#caa23a",
    body2: "#8a6a1e",
    guide: "#fff1c0",
    reel: "#3a2e12",
    reelSize: 10,
    gold: true,
    glow: "#ffd24a",
  },
  "rod-mythic": {
    lenFactor: 1.2,
    body: "#5a2f8f",
    body2: "#2a1450",
    guide: "#d7b3ff",
    reel: "#1a0a2a",
    reelSize: 10,
    gold: true,
    glow: "#b15cff",
    particles: true,
  },
};

export function rodVisual(id: string | undefined): RodVisual {
  return (id && ROD_VISUALS[id]) || ROD_VISUALS["rod-wood"];
}
