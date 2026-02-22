import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { RecipeForm } from "@/components/recipes/RecipeForm";

export default async function NewRecipePage() {
  await requireRole("EDITOR");
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return <RecipeForm mode="create" categories={categories} />;
}
