"use client";

import { useState } from "react";
import {
  createCoupon,
  deleteCoupon,
  updateCoupon,
  resetCouponRedemptions,
} from "@/app/manage/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Edit, Trash2, Plus, RotateCcw, RefreshCcw } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Coupon {
  id: string;
  title: string;
  description: string;
  category: string;
  redemptionLimit: number;
  is_redeemed: boolean;
  redemptions: any[];
}

interface CouponManagerProps {
  coupons: Coupon[];
  categories: Category[];
}

export default function CouponManager({
  coupons,
  categories,
}: CouponManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    redemptionLimit: 1,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: categories[0]?.name || "",
      redemptionLimit: 1,
    });
    setEditingCoupon(null);
  };

  const openCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      title: coupon.title,
      description: coupon.description,
      category: coupon.category,
      redemptionLimit: coupon.redemptionLimit,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (editingCoupon) {
      await updateCoupon(editingCoupon.id, formData);
    } else {
      await createCoupon(formData);
    }

    setLoading(false);
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await deleteCoupon(id);
  };

  const handleResetRedemption = async (id: string) => {
    if (
      !confirm(
        "Reset redemption count to 0? This will delete all redemption records.",
      )
    )
      return;
    await resetCouponRedemptions(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="gap-2">
          <Plus size={18} /> New Coupon
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {coupons.map((coupon) => (
          <Card
            key={coupon.id}
            className={`bg-white ${coupon.is_redeemed ? "opacity-75 bg-gray-50" : ""}`}
          >
            <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg">{coupon.title}</h3>
                  <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full">
                    {coupon.category}
                  </span>
                  {coupon.is_redeemed && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      Redeemed
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {coupon.description}
                </p>
                <p className="text-xs text-gray-400">
                  Limit: {coupon.redemptionLimit} | Used:{" "}
                  {coupon.redemptions.length}
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResetRedemption(coupon.id)}
                  title="Reset Count & Status"
                >
                  <RefreshCcw size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(coupon)}
                >
                  <Edit size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:bg-red-50"
                  onClick={() => handleDelete(coupon.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCoupon ? "Edit Coupon" : "Create Coupon"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
              >
                <option value="" disabled>
                  Select...
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Redemption Limit</label>
              <Input
                type="number"
                min="1"
                value={formData.redemptionLimit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    redemptionLimit: parseInt(e.target.value),
                  })
                }
                required
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
