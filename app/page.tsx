"use client";

import dynamic from "next/dynamic";

const GameRoot = dynamic(() => import("@/components/GameRoot"), { ssr: false });

export default function Home() {
  return (
    <main className="relative h-full w-full">
      <GameRoot />
    </main>
  );
}
