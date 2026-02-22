import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-utils";
import { recipeSchema } from "@/lib/validations/recipe";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";

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

  return NextResponse.json(recipes);
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === "VIEWER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = recipeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { ingredients, steps, categoryIds, ...recipeData } = parsed.data;

  const recipe = await prisma.recipe.create({
    data: {
      ...recipeData,
      authorId: user.id,
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
      ingredients: true,
      steps: true,
      categories: { include: { category: true } },
    },
  });

  return NextResponse.json(recipe, { status: 201 });
}
