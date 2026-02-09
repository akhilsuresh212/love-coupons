"use client";

import { useState } from "react";
import { logout } from "@/app/manage/actions";
import { Button } from "@/components/ui/Button";
import CategoryManager from "./CategoryManager";
import CouponManager from "./CouponManager";

interface AdminDashboardProps {
  initialCoupons: any[]; // precise type better but any ok for now
  initialCategories: any[];
}

export default function AdminDashboard({
  initialCoupons,
  initialCategories,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"coupons" | "categories">(
    "coupons",
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            Admin Dashboard 🛠️
          </h1>
          <div className="flex items-center gap-4">
            <nav className="flex gap-2">
              <Button
                variant={activeTab === "coupons" ? "primary" : "ghost"}
                onClick={() => setActiveTab("coupons")}
              >
                Coupons
              </Button>
              <Button
                variant={activeTab === "categories" ? "primary" : "ghost"}
                onClick={() => setActiveTab("categories")}
              >
                Categories
              </Button>
            </nav>
            <form action={logout}>
              <Button variant="outline" size="sm">
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "coupons" ? (
          <CouponManager
            coupons={initialCoupons}
            categories={initialCategories}
          />
        ) : (
          <CategoryManager categories={initialCategories} />
        )}
      </main>
    </div>
  );
}
