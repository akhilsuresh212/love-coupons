"use client";

import { useState } from "react";
import { createCategory, deleteCategory } from "@/app/manage/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface CategoryManagerProps {
  categories: Category[];
}

export default function CategoryManager({ categories }: CategoryManagerProps) {
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setLoading(true);
    await createCategory(newCategory);
    setNewCategory("");
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (
      !confirm("Are you sure? This might affect coupons using this category.")
    )
      return;
    await deleteCategory(id);
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex gap-4">
            <Input
              placeholder="Category Name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Card key={cat.id} className="bg-white">
            <CardContent className="p-4 flex justify-between items-center">
              <span className="font-medium">{cat.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={() => handleDelete(cat.id)}
              >
                <Trash2 size={18} />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
