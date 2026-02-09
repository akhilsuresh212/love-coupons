import { prisma } from "@/lib/db";
import { SpinWheel } from "@/components/SpinWheel";
import { FloatingHearts } from "@/components/ui/FloatingHearts";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SpinPage() {
  // Get only unredeemed coupons for the wheel to make it meaningful?
  // User said "one per available coupon". "Available" usually implies unredeemed.
  const coupons = await prisma.coupon.findMany({
    where: { is_redeemed: false },
    include: { redemptions: true },
  });

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
      <FloatingHearts />

      <div className="absolute top-8 left-8">
        <Link href="/">
          <Button variant="ghost" className="gap-2 pl-2">
            <ArrowLeft size={16} /> Back
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-great-vibes text-primary drop-shadow-sm">
            Wheel of Love 🎡
          </h1>
          <p className="text-muted-foreground">
            Spin to decide our next adventure!
          </p>
        </div>

        {coupons.length > 0 ? (
          <SpinWheel coupons={coupons} />
        ) : (
          <div className="text-center p-12 bg-white/50 rounded-2xl border border-pink-100 backdrop-blur-sm">
            <p className="text-xl text-gray-600 mb-4">
              All coupons have been redeemed! 🥰
            </p>
            <p className="text-sm text-gray-400">Time to generate more?</p>
            <div className="mt-6">
              <Link href="/">
                <Button>Back Home</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
