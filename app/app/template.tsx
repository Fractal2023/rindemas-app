"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** Re-mounts on every navigation: gives each tab a soft entrance. */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
