import { cookies } from "next/headers";
import LoginForm from "@/components/admin/LoginForm";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ManagePage() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === "true";

  if (!isAdmin) {
    return <LoginForm />;
  }

  const coupons = await prisma.coupon.findMany({
    orderBy: { created_at: "desc" },
    include: { redemptions: true },
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <AdminDashboard initialCoupons={coupons} initialCategories={categories} />
  );
}
