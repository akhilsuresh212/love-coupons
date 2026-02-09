"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function redeemCoupon(couponId: string, note: string) {
  try {
    // Transaction to ensure both happen or neither
    await prisma.$transaction([
      prisma.coupon.update({
        where: { id: couponId },
        data: { is_redeemed: true },
      }),
      prisma.redemption.create({
        data: {
          coupon_id: couponId,
          note: note,
        },
      }),
    ]);

    revalidatePath("/");
    revalidatePath(`/coupon/${couponId}`);
    revalidatePath("/spin");
    return { success: true };
  } catch (error) {
    console.error("Failed to redeem coupon:", error);
    return { success: false, error: "Failed to redeem coupon" };
  }
}
