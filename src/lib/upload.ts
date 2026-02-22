import { writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "recipes");
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function saveImageFile(file: File): Promise<string> {
  if (file.size > MAX_SIZE) {
    throw new Error("File size exceeds 5MB limit");
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Only JPEG, PNG, and WebP images are allowed");
  }

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const filename = `${randomUUID()}.${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return `/uploads/recipes/${filename}`;
}

export async function deleteImageFile(imagePath: string): Promise<void> {
  try {
    const filename = path.basename(imagePath);
    const filepath = path.join(UPLOAD_DIR, filename);
    await unlink(filepath);
  } catch {
    // Ignore errors if file doesn't exist
  }
}
