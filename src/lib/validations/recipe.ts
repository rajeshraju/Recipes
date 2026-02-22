import { z } from "zod";

const ingredientSchema = z.object({
  name: z.string().min(1, "Ingredient name is required"),
  amount: z.string().min(1, "Amount is required"),
  unit: z.string().optional(),
  order: z.number().int().min(0),
});

const stepSchema = z.object({
  instruction: z.string().min(1, "Instruction is required"),
  stepNumber: z.number().int().min(1),
});

export const recipeSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  servings: z.number().int().min(1).max(100).optional().nullable(),
  prepTime: z.number().int().min(0).max(9999).optional().nullable(),
  cookTime: z.number().int().min(0).max(9999).optional().nullable(),
  categoryIds: z.array(z.string()),
  ingredients: z.array(ingredientSchema).min(1, "At least one ingredient is required"),
  steps: z.array(stepSchema).min(1, "At least one step is required"),
});

export type RecipeInput = z.infer<typeof recipeSchema>;
