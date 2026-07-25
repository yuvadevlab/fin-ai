"use client";

import React from "react";
import { Badge, Button } from "@finai/ui";
import { type Category } from "@/features/categories";

export function CategorySettingsList({ categories }: { categories: Category[] }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <Badge key={c.id} variant="secondary" className="rounded-full px-3 py-1 text-xs">
            {c.name}
          </Badge>
        ))}
      </div>
      <div className="pt-2">
        <a href="/categories">
          <Button size="sm" variant="outline" className="w-full cursor-pointer">
            Manage Categories
          </Button>
        </a>
      </div>
    </div>
  );
}
