import { Suspense } from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { RecipeFilters } from "@/components/recipes/RecipeFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

async function RecipeList({ q, category }: { q: string; category: string }) {
  const recipes = await prisma.recipe.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { ingredients: { some: { name: { contains: q, mode: "insensitive" } } } },
              ],
            }
          : {},
        category ? { categories: { some: { category: { slug: category } } } } : {},
      ],
    },
    include: {
      author: { select: { id: true, name: true } },
      categories: { include: { category: true } },
      _count: { select: { ingredients: true, steps: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (recipes.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg font-medium">No recipes found</p>
        <p className="text-sm mt-1">Try adjusting your search or add a new recipe</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}

export default async function RecipesPage({ searchParams }: PageProps) {
  const session = await requireAuth();
  const { q = "", category = "" } = await searchParams;

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const canCreate = session.user.role === "EDITOR" || session.user.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recipes</h1>
        {canCreate && (
          <Button asChild>
            <Link href="/recipes/new">
              <Plus className="mr-1 h-4 w-4" />
              New recipe
            </Link>
          </Button>
        )}
      </div>

      <Suspense>
        <RecipeFilters categories={categories} />
      </Suspense>

      <Suspense fallback={<div className="text-gray-400 text-sm">Loading recipes...</div>}>
        <RecipeList q={q} category={category} />
      </Suspense>
    </div>
  );
}
