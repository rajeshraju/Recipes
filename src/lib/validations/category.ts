import { z } from "zod";
import slugify from "slugify";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  description: z.string().max(200).optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export function toSlug(name: string): string {
  return slugify(name, { lower: true, strict: true });
}
