"use client";

import { useState, useRef } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Coupon } from "@prisma/client";
import jackpotAnimation from "../public/lottie/casinoJackpot.json";

interface JackpotProps {
  coupons: Coupon[];
}

export function Jackpot({ coupons }: JackpotProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  const handlePlay = () => {
    if (isPlaying || coupons.length === 0) return;

    setIsPlaying(true);
    setSelectedCoupon(null);
    lottieRef.current?.goToAndPlay(0);

    // Filter coupons (sanity check, though page should handle this)
    const availableCoupons = coupons;

    // Select a random coupon
    const randomIndex = Math.floor(Math.random() * availableCoupons.length);
    const winner = availableCoupons[randomIndex];

    // Simulate animation duration (approx 3-4 seconds based on Lottie usually)
    // You might need to adjust this based on the specific Lottie file length
    setTimeout(() => {
      setSelectedCoupon(winner);
      setIsModalOpen(true);
      setIsPlaying(false);

      // Trigger confetti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#FFD700", "#FFA500", "#FF4500"], // Gold/Orange theme for jackpot
      });
    }, 3500); // 3.5 seconds
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full max-w-lg">
      <div className="relative w-full aspect-video flex-col flex items-center justify-center">
        {/* Lottie Animation */}
        <Lottie
          lottieRef={lottieRef}
          animationData={jackpotAnimation}
          loop={false}
          autoplay={false}
          className="w-full h-full"
        />
      </div>

      <Button
        size="lg"
        onClick={handlePlay}
        disabled={isPlaying || coupons.length === 0}
        className="w-48 text-lg font-bold bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-amber-900/20"
      >
        {isPlaying ? "Rolling..." : "Try Your Luck"}
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="JACKPOT! 🎉"
      >
        {selectedCoupon && (
          <div className="text-center space-y-6">
            <div className="text-6xl animate-bounce py-4">
              {selectedCoupon.category === "Food"
                ? "🍔"
                : selectedCoupon.category === "Relaxation"
                  ? "🧖‍♀️"
                  : selectedCoupon.category === "Date"
                    ? "🎬"
                    : "💎"}
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
                <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                  View Reward →
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
