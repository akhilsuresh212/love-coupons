import { prisma } from "@/lib/db";
import { RedeemFlow } from "@/components/RedeemFlow";
import { FloatingHearts } from "@/components/ui/FloatingHearts";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CouponPage({ params }: PageProps) {
  const { id } = await params;

  const coupon = await prisma.coupon.findUnique({
    where: { id },
  });

  if (!coupon) {
    notFound();
  }

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-6 md:p-12">
      <FloatingHearts />

      <div className="absolute top-8 left-8 z-10">
        <Link href="/">
          <Button
            variant="ghost"
            className="gap-2 pl-2 bg-white/50 backdrop-blur-sm hover:bg-white/80"
          >
            <ArrowLeft size={16} /> Back
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-pink-100 p-8 md:p-12 space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
        <div className="text-center space-y-6">
          <div className="inline-block py-1 px-3 rounded-full bg-pink-100 text-pink-600 text-sm font-bold uppercase tracking-widest mb-4">
            {coupon.category}
          </div>

          <h1 className="text-4xl md:text-6xl font-great-vibes text-gray-800 leading-tight">
            {coupon.title}
          </h1>

          <div className="h-px w-24 bg-gradient-to-r from-transparent via-pink-300 to-transparent mx-auto" />

          <p className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed">
            {coupon.description}
          </p>
        </div>

        <div className="pt-8">
          <RedeemFlow coupon={coupon} />
        </div>
      </div>
    </main>
  );
}
