"use client";

import { useState, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Coupon } from "@prisma/client";

interface SpinWheelProps {
  coupons: Coupon[];
}

export function SpinWheel({ coupons }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const controls = useAnimation();
  const wheelRef = useRef<HTMLDivElement>(null);

  // Colors for slices
  const COLORS = [
    "#E75480",
    "#FFC0CB",
    "#C2185B",
    "#FFB7B2",
    "#D81B60",
    "#F8BBD0",
  ];

  const spin = async () => {
    if (isSpinning || coupons.length === 0) return;

    setIsSpinning(true);
    setSelectedCoupon(null);

    // Calculate random landing
    const sliceAngle = 360 / coupons.length;
    const randomIndex = Math.floor(Math.random() * coupons.length);
    const landingAngle = randomIndex * sliceAngle + sliceAngle / 2; // Center of slice

    // Total rotation: 5 full spins (1800deg) + alignment to random index
    // The wheel rotates clockwise. To land on index i, we need to rotate such that index i is at the top (usually 0deg or -90deg depending on implementation).
    // Let's assume 0deg is at 3 o'clock.
    // Actually, conic gradient starts at 12 o'clock if we do `from 0deg`? No, usually 12 o'clock is 0deg in CSS if specified, or top.
    // Let's just create random rotation and calculate winner from it.

    const spins = 5;
    const extraDegrees = Math.random() * 360;
    const totalRotation = spins * 360 + extraDegrees;

    await controls.start({
      rotate: totalRotation,
      transition: { duration: 4, ease: "easeOut" },
    });

    // Calculate winner
    // Normalized angle (0-360)
    const finalAngle = totalRotation % 360;
    // Index logic:
    // If we have 4 items:
    // 0-90: Item 0?
    // It depends on how slices are rendered.
    // Let's assume Conic Gradient renders clockwise from top.
    // Pointer is at Top (0deg).
    // If wheel rotates X degrees clockwise, the slice at Top is...
    // The slice that WAS at (360 - X % 360).

    const sliceSize = 360 / coupons.length;
    // The pointer is static at the top. The wheel rotates.
    // Effective angle at top pointer = (360 - (finalAngle % 360)) % 360.
    const effectiveAngle = (360 - finalAngle) % 360;

    const winnerIndex = Math.floor(effectiveAngle / sliceSize);
    const winner = coupons[winnerIndex];

    setSelectedCoupon(winner);
    setIsModalOpen(true);
    setIsSpinning(false);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#E75480", "#C2185B", "#FFF0F5"],
    });
  };

  const conicGradient = `conic-gradient(from 0deg, ${coupons
    .map(
      (_, i) =>
        `${COLORS[i % COLORS.length]} ${(i * 100) / coupons.length}%, ${
          COLORS[i % COLORS.length]
        } ${((i + 1) * 100) / coupons.length}%`,
    )
    .join(", ")})`;

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="relative w-80 h-80 md:w-96 md:h-96">
        {/* Pointer */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-8 h-8 text-rose-600 drop-shadow-lg">
          ▼
        </div>

        {/* Wheel */}
        <motion.div
          ref={wheelRef}
          className="w-full h-full rounded-full border-4 border-white shadow-2xl overflow-hidden relative"
          style={{ background: conicGradient }}
          animate={controls}
        >
          {coupons.map((coupon, i) => {
            const angle = (360 / coupons.length) * i + 360 / coupons.length / 2;
            return (
              <div
                key={coupon.id}
                className="absolute top-1/2 left-1/2 w-full h-[1px] origin-left -translate-y-1/2 flex items-center justify-end pr-8"
                style={{ transform: `rotate(${angle - 90}deg)` }}
              >
                <span
                  className="text-white font-bold text-sm whitespace-nowrap truncate max-w-[100px] drop-shadow-md rotate-90"
                  style={{ transformOrigin: "center" }}
                >
                  {coupon.category}
                </span>
              </div>
            );
          })}
        </motion.div>

        {/* Center Decor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-inner flex items-center justify-center border-4 border-rose-100 z-10">
          <span className="text-2xl">💖</span>
        </div>
      </div>

      <Button
        size="lg"
        onClick={spin}
        disabled={isSpinning || coupons.length === 0}
        className="w-48 text-lg font-bold"
      >
        {isSpinning ? "Spinning..." : "Spin 💞"}
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Fate has chosen! ✨"
      >
        {selectedCoupon && (
          <div className="text-center space-y-6">
            <div className="text-5xl animate-bounce">
              {selectedCoupon.category === "Food"
                ? "🍰"
                : selectedCoupon.category === "Relaxation"
                  ? "💆‍♂️"
                  : selectedCoupon.category === "Date"
                    ? "🍷"
                    : "🎁"}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedCoupon.title}
              </h3>
              <p className="text-gray-500">{selectedCoupon.description}</p>
            </div>
            <div className="pt-4 flex justify-center gap-3">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Spin Again
              </Button>
              <Link href={`/coupon/${selectedCoupon.id}`}>
                <Button>View Details →</Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
