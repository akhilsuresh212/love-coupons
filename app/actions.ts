"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendRedemptionEmail } from "@/lib/email";
import { processRedemptionStreak, type StreakUpdateResult } from "@/lib/streak";

export async function redeemCoupon(couponId: string, note: string) {
  try {
    // Transaction to ensure both happen or neither
    // 1. Fetch current state
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      include: { redemptions: true },
    });

    if (!coupon) {
      throw new Error("Coupon not found");
    }

    if (
      coupon.is_redeemed ||
      coupon.redemptions.length >= coupon.redemptionLimit
    ) {
      return { success: false, error: "Coupon already fully redeemed" };
    }

    // 2. Perform redemption
    // If this is the last allowed redemption, mark as redeemed
    const isFullyRedeemed =
      coupon.redemptions.length + 1 >= coupon.redemptionLimit;

    await prisma.$transaction([
      prisma.coupon.update({
        where: { id: couponId },
        data: { is_redeemed: isFullyRedeemed },
      }),
      prisma.redemption.create({
        data: {
          coupon_id: couponId,
          note: note,
        },
      }),
    ]);

    // 3. Send email notification (fire and forget, don't block response)
    // We do this after the transaction to ensure we only send email if DB update succeeded
    sendRedemptionEmail(coupon.title, note).catch((err) => {
      console.error("Background email sending failed:", err);
    });

    // 4. Process streak update
    let streakResult: StreakUpdateResult | null = null;
    try {
      streakResult = await processRedemptionStreak();
    } catch (err) {
      console.error("Streak processing failed (non-blocking):", err);
    }

    revalidatePath("/");
    revalidatePath(`/coupon/${couponId}`);
    revalidatePath("/spin");
    return { success: true, streakResult };
  } catch (error) {
    console.error("Failed to redeem coupon:", error);
    return { success: false, error: "Failed to redeem coupon" };
  }
}
