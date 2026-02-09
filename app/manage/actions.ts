
"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";

// --- Auth ---

export async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === "true";
}

export async function login(formData: FormData) {
  const password = formData.get("password") as string;
  if (password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    // Set cookie for 1 day
    cookieStore.set(COOKIE_NAME, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    return { success: true };
  }
  return { success: false, error: "Invalid password" };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  revalidatePath("/manage");
}

// --- Categories ---

export async function getCategories() {
  return await prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function createCategory(name: string) {
  if (!await checkAuth()) return { success: false, error: "Unauthorized" };
  try {
    await prisma.category.create({ data: { name } });
    revalidatePath("/manage");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to create category (might already exist)" };
  }
}

export async function deleteCategory(id: string) {
  if (!await checkAuth()) return { success: false, error: "Unauthorized" };
  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath("/manage");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to delete category" };
  }
}

// --- Coupons ---

export async function createCoupon(data: {
  title: string;
  description: string;
  category: string;
  redemptionLimit: number;
}) {
  if (!await checkAuth()) return { success: false, error: "Unauthorized" };
  try {
    await prisma.coupon.create({ data });
    revalidatePath("/manage");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to create coupon" };
  }
}

export async function deleteCoupon(id: string) {
  if (!await checkAuth()) return { success: false, error: "Unauthorized" };
  try {
    await prisma.coupon.delete({ where: { id } });
    revalidatePath("/manage");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to delete coupon" };
  }
}

export async function updateCoupon(id: string, data: {
  title?: string;
  description?: string;
  category?: string;
  redemptionLimit?: number;
  is_redeemed?: boolean;
}) {
  if (!await checkAuth()) return { success: false, error: "Unauthorized" };
  try {
    await prisma.coupon.update({ where: { id }, data });
    revalidatePath("/manage");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to update coupon" };
  }
}
export async function resetCouponRedemptions(id: string) {
  if (!await checkAuth()) return { success: false, error: "Unauthorized" };
  try {
    await prisma.$transaction([
      prisma.redemption.deleteMany({ where: { coupon_id: id } }),
      prisma.coupon.update({ where: { id }, data: { is_redeemed: false } }),
    ]);
    revalidatePath("/manage");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to reset redemptions" };
  }
}
