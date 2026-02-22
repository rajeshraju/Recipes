import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { RecipeForm } from "@/components/recipes/RecipeForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRecipePage({ params }: PageProps) {
  const session = await requireAuth();
  const { id } = await params;

  if (session.user.role === "VIEWER") redirect("/recipes");

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      categories: { include: { category: true } },
      ingredients: { orderBy: { order: "asc" } },
      steps: { orderBy: { stepNumber: "asc" } },
    },
  });

  if (!recipe) notFound();

  const isAdmin = session.user.role === "ADMIN";
  const isOwner = recipe.authorId === session.user.id;
  if (!isAdmin && !isOwner) redirect("/recipes");

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <RecipeForm
      mode="edit"
      categories={categories}
      recipe={{
        ...recipe,
        ingredients: recipe.ingredients.map((i) => ({
          ...i,
          unit: i.unit ?? undefined,
          description: undefined,
        })),
      }}
    />
  );
}
