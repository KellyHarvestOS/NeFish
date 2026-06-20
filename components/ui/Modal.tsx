"use client";

import { motion } from "framer-motion";
import type { IconType } from "react-icons";
import { FiX } from "react-icons/fi";

export default function Modal({
  title,
  icon: Icon,
  onClose,
  children,
}: {
  title: string;
  icon: IconType;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-dark flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl text-white"
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
            <Icon size={20} />
          </span>
          <h2 className="text-xl font-extrabold">{title}</h2>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
          >
            <FiX size={18} />
          </motion.button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </motion.div>
    </motion.div>
  );
}
