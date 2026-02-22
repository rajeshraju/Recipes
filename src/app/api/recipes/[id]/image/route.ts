import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-utils";
import { saveImageFile, deleteImageFile } from "@/lib/upload";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === "VIEWER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    select: { authorId: true, imagePath: true },
  });

  if (!recipe) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.role !== "ADMIN" && recipe.authorId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image file provided" }, { status: 400 });
  }

  try {
    if (recipe.imagePath) {
      await deleteImageFile(recipe.imagePath);
    }
    const imagePath = await saveImageFile(file);
    const updated = await prisma.recipe.update({
      where: { id },
      data: { imagePath },
    });
    return NextResponse.json({ imagePath: updated.imagePath });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
