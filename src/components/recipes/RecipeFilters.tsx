"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface RecipeFiltersProps {
  categories: Category[];
}

export function RecipeFilters({ categories }: RecipeFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const activeCategory = searchParams.get("category") ?? "";

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search recipes or ingredients..."
          defaultValue={q}
          className="pl-9"
          onChange={(e) => {
            const timer = setTimeout(() => updateFilter("q", e.target.value), 300);
            return () => clearTimeout(timer);
          }}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={activeCategory === "" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => updateFilter("category", "")}
        >
          All
        </Badge>
        {categories.map((cat) => (
          <Badge
            key={cat.id}
            variant={activeCategory === cat.slug ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() =>
              updateFilter("category", activeCategory === cat.slug ? "" : cat.slug)
            }
          >
            {activeCategory === cat.slug && <X className="mr-1 h-3 w-3" />}
            {cat.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
