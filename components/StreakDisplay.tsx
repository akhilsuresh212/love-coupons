"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  MILESTONE_MESSAGES,
  MILESTONES,
  STREAK_BREAK_MESSAGES,
} from "@/lib/streak";

// ──────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────

interface StreakApiResponse {
  currentStreak: number;
  longestStreak: number;
  lastRedeemedDate: string | null;
  isBroken: boolean;
  nextMilestone: number | null;
  milestoneProgress: number;
}

// ──────────────────────────────────────────────────────
// Heart Burst Animation
// ──────────────────────────────────────────────────────

function HeartBurst({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const hearts = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 360;
    const rad = (angle * Math.PI) / 180;
    const distance = 60 + Math.random() * 40;
    return {
      id: i,
      x: Math.cos(rad) * distance,
      y: Math.sin(rad) * distance,
      scale: 0.5 + Math.random() * 0.8,
      delay: Math.random() * 0.2,
    };
  });

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
      {hearts.map((h) => (
        <motion.span
          key={h.id}
          initial={{ opacity: 1, x: 0, y: 0, scale: 0.2 }}
          animate={{
            opacity: [1, 1, 0],
            x: h.x,
            y: h.y,
            scale: [0.2, h.scale, 0],
          }}
          transition={{
            duration: 1.2,
            delay: h.delay,
            ease: "easeOut",
          }}
          className="absolute text-lg"
        >
          💖
        </motion.span>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────
// Milestone Celebration Modal
// ──────────────────────────────────────────────────────

function MilestoneCelebration({
  milestone,
  onClose,
}: {
  milestone: number;
  onClose: () => void;
}) {
  const message =
    MILESTONE_MESSAGES[milestone] || `${milestone} days of love! 💖`;

  useEffect(() => {
    // Confetti burst
    const end = Date.now() + 2500;
    const colors = ["#E75480", "#C2185B", "#FFF0F5", "#FF69B4", "#FFB6C1"];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.6 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.6 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 18, stiffness: 200 }}
        className="bg-white/95 backdrop-blur-md rounded-3xl p-8 md:p-10 shadow-2xl border border-pink-100 max-w-sm w-full text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative gradient ring */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-pink-200 to-rose-300 rounded-full opacity-30 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-gradient-to-br from-rose-200 to-pink-300 rounded-full opacity-30 blur-2xl" />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-6xl mb-4"
        >
          🏆
        </motion.div>
        <h3 className="text-2xl md:text-3xl font-bold text-gray-800 font-great-vibes mb-2">
          Milestone Reached!
        </h3>
        <p className="text-lg text-rose-600 font-medium mb-6">{message}</p>
        <button
          onClick={onClose}
          className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold shadow-lg hover:shadow-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 active:scale-95"
        >
          Yay! 🎉
        </button>
      </motion.div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────
// Streak Break Modal
// ──────────────────────────────────────────────────────

function StreakBreakModal({ onClose }: { onClose: () => void }) {
  const [message] = useState(
    () =>
      STREAK_BREAK_MESSAGES[
        Math.floor(Math.random() * STREAK_BREAK_MESSAGES.length)
      ],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 250 }}
        className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-pink-100 max-w-sm w-full text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-gradient-to-br from-rose-100 to-pink-200 rounded-full opacity-40 blur-xl" />

        <motion.div
          initial={{ y: -10 }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-5xl mb-4"
        >
          💔
        </motion.div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">Streak Paused</h3>
        <p className="text-base text-rose-500 font-medium mb-6">{message}</p>
        <button
          onClick={onClose}
          className="px-8 py-3 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl hover:from-rose-500 hover:to-pink-600 transition-all duration-300 active:scale-95"
        >
          Start New Streak 🔥
        </button>
      </motion.div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────
// Main StreakDisplay component
// ──────────────────────────────────────────────────────

export function StreakDisplay() {
  const [data, setData] = useState<StreakApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [showMilestone, setShowMilestone] = useState<number | null>(null);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const hasShownBreak = useRef(false);

  const fetchStreak = useCallback(async () => {
    try {
      const res = await fetch("/api/streak", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const json: StreakApiResponse = await res.json();
      setData(json);

      // Show break modal once when streak is broken (and we had a previous streak)
      if (json.isBroken && json.currentStreak > 0 && !hasShownBreak.current) {
        hasShownBreak.current = true;
        setShowBreakModal(true);
      }
    } catch (err) {
      console.error("Streak fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  // Listen for custom streak events emitted from RedeemFlow
  useEffect(() => {
    const handleStreakUpdate = (e: CustomEvent) => {
      const detail = e.detail;
      if (detail?.milestone) {
        setShowMilestone(detail.milestone);
        setShowHeartBurst(true);
      }
      if (detail?.didBreak) {
        setShowBreakModal(true);
      }
      // Refetch to get latest data
      fetchStreak();
    };

    window.addEventListener(
      "streak-update",
      handleStreakUpdate as EventListener,
    );
    return () =>
      window.removeEventListener(
        "streak-update",
        handleStreakUpdate as EventListener,
      );
  }, [fetchStreak]);

  if (loading) {
    return (
      <div className="streak-container animate-pulse">
        <div className="h-20 bg-pink-50/50 rounded-2xl" />
      </div>
    );
  }

  if (!data || (data.currentStreak === 0 && !data.lastRedeemedDate)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="streak-container"
      >
        <div className="streak-card streak-card--empty">
          <p className="text-muted-foreground text-sm text-center">
            ✨ Redeem your first coupon to start a romance streak!
          </p>
        </div>
      </motion.div>
    );
  }

  const {
    currentStreak,
    longestStreak,
    nextMilestone,
    milestoneProgress,
    isBroken,
  } = data;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="streak-container relative"
      >
        <div
          className={`streak-card mb-3 ${isBroken ? "streak-card--broken" : ""}`}
        >
          {/* Heart burst animation overlay */}
          <AnimatePresence>
            {showHeartBurst && (
              <HeartBurst onComplete={() => setShowHeartBurst(false)} />
            )}
          </AnimatePresence>

          {/* Top row: Streak count + longest */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <motion.span
                key={currentStreak}
                initial={{ scale: 1.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="streak-fire-icon"
              >
                🔥
              </motion.span>
              <div>
                <motion.h3
                  key={`count-${currentStreak}`}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="streak-count-text"
                >
                  {currentStreak} Day{currentStreak !== 1 ? "s" : ""} Romance
                  Streak
                </motion.h3>
              </div>
            </div>
            {longestStreak > 0 && (
              <span className="streak-best-text">
                Best: {longestStreak} day{longestStreak !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="streak-progress-wrapper">
            {/* Milestone markers */}
            <div className="streak-milestones">
              {MILESTONES.map((m) => {
                const position = calculateMilestonePosition(
                  m,
                  currentStreak,
                  nextMilestone,
                );
                if (position === null) return null;
                const reached = currentStreak >= m;
                return (
                  <div
                    key={m}
                    className={`streak-milestone-marker ${
                      reached ? "streak-milestone-marker--reached" : ""
                    }`}
                    style={{ left: `${position}%` }}
                  >
                    <span className="streak-milestone-dot" />
                    <span className="streak-milestone-label">{m}d</span>
                  </div>
                );
              })}
            </div>

            {/* Progress bar track */}
            <div className="streak-progress-track">
              <motion.div
                className={`streak-progress-fill ${
                  currentStreak > 0 ? "streak-progress-fill--active" : ""
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${milestoneProgress}%` }}
                transition={{
                  duration: 1,
                  ease: [0.34, 1.56, 0.64, 1],
                  delay: 0.2,
                }}
              />
            </div>

            {/* Streak progress text */}
            {nextMilestone && (
              <div className="streak-progress-label">
                <span>
                  {currentStreak}/{nextMilestone} days to next milestone
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showBreakModal && (
          <StreakBreakModal onClose={() => setShowBreakModal(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMilestone !== null && (
          <MilestoneCelebration
            milestone={showMilestone}
            onClose={() => setShowMilestone(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ──────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────

/**
 * Calculate where a milestone marker should be positioned on the progress bar.
 * Returns null if the milestone is irrelevant to the current range.
 */
function calculateMilestonePosition(
  milestone: number,
  currentStreak: number,
  nextMilestone: number | null,
): number | null {
  if (!nextMilestone) {
    // Past all milestones — show all markers spread out
    return (milestone / 30) * 100;
  }

  // Find the range for the progress bar
  const milestoneIndex = MILESTONES.indexOf(
    nextMilestone as (typeof MILESTONES)[number],
  );
  const prevMilestone = milestoneIndex > 0 ? MILESTONES[milestoneIndex - 1] : 0;

  // Only show markers within the current range
  if (milestone < prevMilestone || milestone > nextMilestone) return null;

  const range = nextMilestone - prevMilestone;
  return ((milestone - prevMilestone) / range) * 100;
}
