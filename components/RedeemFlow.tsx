"use client";

import { useState } from "react";
import { Coupon } from "@prisma/client";
import { Button } from "./ui/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import confetti from "canvas-confetti";
import { redeemCoupon } from "@/app/actions";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface RedeemFlowProps {
  coupon: Coupon;
}

export function RedeemFlow({ coupon }: RedeemFlowProps) {
  const [step, setStep] = useState<"initial" | "redeemed" | "note">("initial");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleRedeemClick = () => {
    // Trigger confetti
    const end = Date.now() + 1000;
    const colors = ["#E75480", "#C2185B", "#FFF0F5"];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    setStep("redeemed");
  };

  const handleFinalize = async () => {
    setIsSubmitting(true);
    const result = await redeemCoupon(coupon.id, note);
    if (result.success) {
      router.push("/");
    } else {
      alert("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (coupon.is_redeemed) {
    return (
      <div className="text-center p-8 bg-pink-50/50 rounded-2xl border border-pink-100">
        <h3 className="text-2xl font-bold text-gray-500 mb-2">
          Already Redeemed ❤️
        </h3>
        <p className="text-gray-400">
          This coupon has been used. Hope it was wonderful!
        </p>
        <div className="mt-6">
          <Button onClick={() => router.push("/")} variant="outline">
            Back to Collection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {step === "initial" && (
          <motion.div
            key="initial"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Button
              size="lg"
              className="w-full text-lg h-16 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-lg shadow-pink-200"
              onClick={handleRedeemClick}
            >
              Redeem This Coupon 💖
            </Button>
          </motion.div>
        )}

        {step === "redeemed" && (
          <motion.div
            key="redeemed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-great-vibes text-rose-600">
                Yay! Coupon Redeemed! 🎉
              </h3>
              <p className="text-muted-foreground text-sm">
                Add a little note to remember this moment?
              </p>
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write a sweet memory or note here..."
              className="w-full p-4 rounded-xl border-2 border-pink-100 focus:border-pink-300 focus:ring-0 bg-white/50 text-gray-700 placeholder:text-gray-300 min-h-[120px] resize-none transition-colors"
              autoFocus
            />

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => handleFinalize()} // Skip note
                disabled={isSubmitting}
              >
                Skip Note
              </Button>
              <Button
                className="flex-[2]"
                onClick={handleFinalize}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Memory 💌"
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
