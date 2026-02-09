"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const HEARTS = ["💖", "💗", "💓", "💞", "💕", "💘"];

export function FloatingHearts() {
  const [hearts, setHearts] = useState<
    { id: number; x: number; delay: number; char: string }[]
  >([]);

  useEffect(() => {
    // Generate static random hearts on client side only to avoid hydration mismatch
    const newHearts = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 10,
      char: HEARTS[Math.floor(Math.random() * HEARTS.length)],
    }));
    setHearts(newHearts);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute text-2xl opacity-20"
          initial={{ y: "110vh", x: `${heart.x}vw` }}
          animate={{
            y: "-10vh",
            x: `${heart.x + (Math.random() * 10 - 5)}vw`,
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            delay: heart.delay,
            ease: "linear",
          }}
        >
          {heart.char}
        </motion.div>
      ))}
    </div>
  );
}
