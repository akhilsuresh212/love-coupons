"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

interface Coupon {
  id: string;
  title: string;
  description: string;
  category: string;
  is_redeemed: boolean;
}

interface CouponCardProps {
  coupon: Coupon;
}

export function CouponCard({ coupon }: CouponCardProps) {
  return (
    <Link href={`/coupon/${coupon.id}`}>
      <Card
        className={`h-full flex flex-col transition-all duration-300 hover:shadow-lg cursor-pointer group ${
          coupon.is_redeemed
            ? "opacity-60 grayscale-[0.5] bg-gray-50"
            : "bg-white/80 hover:border-pink-300"
        }`}
      >
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <span
              className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                coupon.is_redeemed
                  ? "bg-gray-200 text-gray-500"
                  : "bg-pink-100 text-pink-600"
              }`}
            >
              {coupon.category}
            </span>
            {coupon.is_redeemed && (
              <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                Redeemed ❤️
              </span>
            )}
          </div>
          <CardTitle
            className={`group-hover:text-primary transition-colors ${coupon.is_redeemed ? "text-gray-600" : ""}`}
          >
            {coupon.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {coupon.description}
          </p>
        </CardContent>
        <CardFooter>
          <Button
            variant={coupon.is_redeemed ? "secondary" : "outline"}
            className="w-full group-hover:bg-primary group-hover:text-white transition-all"
            size="sm"
          >
            {coupon.is_redeemed ? "View Memory" : "View Details"}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
