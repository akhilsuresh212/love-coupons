import { prisma } from "@/lib/db";
import { CouponCard } from "@/components/CouponCard";
import { FloatingHearts } from "@/components/ui/FloatingHearts";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function Home() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { created_at: "asc" },
  });

  return (
    <main className="min-h-screen relative p-4 md:p-8">
      <FloatingHearts />

      <div className="max-w-6xl mx-auto space-y-12">
        <header className="text-center space-y-4 pt-12">
          <h1 className="text-5xl md:text-7xl font-great-vibes text-primary drop-shadow-sm animate-fade-in">
            Akhil’s Love Coupons 💖
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-lg mx-auto">
            Redeemable for hugs, kisses, and special moments. Choose wisely (or
            not)! 😉
          </p>

          <div className="pt-4">
            <Link href="/spin">
              <Button
                size="lg"
                className="rounded-full px-8 text-lg shadow-lg bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 border-none text-white ring-offset-2 ring-pink-200"
              >
                🎡 Surprise Me!
              </Button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="animate-in fade-in slide-in-from-bottom duration-700"
              style={{ animationDelay: `${Math.random() * 500}ms` }}
            >
              <CouponCard coupon={coupon} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
