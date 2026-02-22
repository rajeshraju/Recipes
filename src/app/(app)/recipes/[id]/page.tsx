import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, Users, ChefHat, ArrowLeft, Pencil } from "lucide-react";
import { DeleteRecipeButton } from "@/components/recipes/DeleteRecipeButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RecipeDetailPage({ params }: PageProps) {
  const session = await requireAuth();
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      categories: { include: { category: true } },
      ingredients: { orderBy: { order: "asc" } },
      steps: { orderBy: { stepNumber: "asc" } },
    },
  });

  if (!recipe) notFound();

  const isAdmin = session.user.role === "ADMIN";
  const isOwner = recipe.authorId === session.user.id;
  const canEdit = isAdmin || (session.user.role === "EDITOR" && isOwner);
  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/recipes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold flex-1">{recipe.title}</h1>
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/recipes/${id}/edit`}>
                <Pencil className="mr-1 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <DeleteRecipeButton recipeId={id} />
          </div>
        )}
      </div>

      {recipe.imagePath && (
        <div className="relative aspect-video rounded-xl overflow-hidden">
          <Image src={recipe.imagePath} alt={recipe.title} fill className="object-cover" />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {recipe.categories.map(({ category }) => (
          <Badge key={category.id} variant="secondary">
            {category.name}
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap gap-6 text-sm text-gray-500">
        {recipe.servings && (
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {recipe.servings} servings
          </span>
        )}
        {recipe.prepTime && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            Prep: {recipe.prepTime} min
          </span>
        )}
        {recipe.cookTime && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            Cook: {recipe.cookTime} min
          </span>
        )}
        {totalTime > 0 && (
          <span className="flex items-center gap-1.5 font-medium text-gray-700">
            Total: {totalTime} min
          </span>
        )}
        {recipe.author.name && (
          <span className="flex items-center gap-1.5 ml-auto">
            <ChefHat className="h-4 w-4" />
            {recipe.author.name}
          </span>
        )}
      </div>

      {recipe.description && (
        <p className="text-gray-600 leading-relaxed">{recipe.description}</p>
      )}

      <Separator />

      <div className="grid md:grid-cols-[280px_1fr] gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing) => (
              <li key={ing.id} className="flex gap-2 text-sm">
                <span className="font-medium text-gray-900 min-w-fit">
                  {ing.amount} {ing.unit}
                </span>
                <span className="text-gray-600">{ing.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Instructions</h2>
          <ol className="space-y-4">
            {recipe.steps.map((step) => (
              <li key={step.id} className="flex gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-sm font-semibold">
                  {step.stepNumber}
                </div>
                <p className="text-gray-700 leading-relaxed pt-0.5">{step.instruction}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
