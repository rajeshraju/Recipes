import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-utils";
import { recipeSchema } from "@/lib/validations/recipe";
import { deleteImageFile } from "@/lib/upload";

async function canEditRecipe(userId: string, role: string, recipeId: string) {
  if (role === "ADMIN") return true;
  if (role === "VIEWER") return false;
  const recipe = await prisma.recipe.findUnique({ where: { id: recipeId }, select: { authorId: true } });
  return recipe?.authorId === userId;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  if (!recipe) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(recipe);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await canEditRecipe(user.id, user.role, id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = recipeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { ingredients, steps, categoryIds, ...recipeData } = parsed.data;

  const recipe = await prisma.$transaction(async (tx) => {
    await tx.ingredient.deleteMany({ where: { recipeId: id } });
    await tx.step.deleteMany({ where: { recipeId: id } });
    await tx.recipeCategory.deleteMany({ where: { recipeId: id } });

    return tx.recipe.update({
      where: { id },
      data: {
        ...recipeData,
        ingredients: {
          create: ingredients.map((ing) => ({
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            order: ing.order,
          })),
        },
        steps: {
          create: steps.map((step) => ({
            instruction: step.instruction,
            stepNumber: step.stepNumber,
          })),
        },
        categories: {
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
      include: {
        ingredients: { orderBy: { order: "asc" } },
        steps: { orderBy: { stepNumber: "asc" } },
        categories: { include: { category: true } },
      },
    });
  });

  return NextResponse.json(recipe);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await canEditRecipe(user.id, user.role, id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const recipe = await prisma.recipe.findUnique({ where: { id }, select: { imagePath: true } });
  if (recipe?.imagePath) {
    await deleteImageFile(recipe.imagePath);
  }

  await prisma.recipe.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
