"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { recipeSchema, type RecipeInput } from "@/lib/validations/recipe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { IngredientFields } from "./IngredientFields";
import { StepFields } from "./StepFields";
import { ImageUpload } from "./ImageUpload";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface RecipeFormProps {
  mode: "create" | "edit";
  categories: Category[];
  recipe?: {
    id: string;
    title: string;
    description?: string | null;
    imagePath?: string | null;
    servings?: number | null;
    prepTime?: number | null;
    cookTime?: number | null;
    categories: { category: Category }[];
    ingredients: { id: string; name: string; amount: string; unit?: string | null; order: number }[];
    steps: { id: string; stepNumber: number; instruction: string }[];
  };
}

export function RecipeForm({ mode, categories, recipe }: RecipeFormProps) {
  const router = useRouter();
  const [savedRecipeId, setSavedRecipeId] = useState<string | null>(recipe?.id ?? null);
  const [imagePath, setImagePath] = useState<string | null>(recipe?.imagePath ?? null);

  const form = useForm<RecipeInput>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: recipe?.title ?? "",
      description: recipe?.description ?? "",
      servings: recipe?.servings ?? undefined,
      prepTime: recipe?.prepTime ?? undefined,
      cookTime: recipe?.cookTime ?? undefined,
      categoryIds: recipe?.categories.map((c) => c.category.id) ?? [],
      ingredients:
        recipe?.ingredients.length
          ? recipe.ingredients.map((i) => ({
              name: i.name,
              amount: i.amount,
              unit: i.unit ?? "",
              order: i.order,
            }))
          : [{ name: "", amount: "", unit: "", order: 0 }],
      steps:
        recipe?.steps.length
          ? recipe.steps.map((s) => ({
              instruction: s.instruction,
              stepNumber: s.stepNumber,
            }))
          : [{ instruction: "", stepNumber: 1 }],
    },
  });

  const selectedCategoryIds = form.watch("categoryIds");

  function toggleCategory(id: string) {
    const current = form.getValues("categoryIds");
    const updated = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id];
    form.setValue("categoryIds", updated, { shouldValidate: true });
  }

  async function onSubmit(data: RecipeInput) {
    const url = savedRecipeId ? `/api/recipes/${savedRecipeId}` : "/api/recipes";
    const method = savedRecipeId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error?.formErrors?.[0] ?? "Failed to save recipe");
      return;
    }

    if (!savedRecipeId) {
      setSavedRecipeId(json.id);
      toast.success("Recipe created! You can now add an image.");
    } else {
      toast.success("Recipe updated!");
      router.push(`/recipes/${savedRecipeId}`);
      router.refresh();
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {mode === "create" ? "New Recipe" : "Edit Recipe"}
        </h1>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Recipe name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of the recipe..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="servings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Servings</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="4"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="prepTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prep time (min)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="15"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cookTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cook time (min)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="30"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Badge
                    key={cat.id}
                    variant={selectedCategoryIds.includes(cat.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleCategory(cat.id)}
                  >
                    {cat.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ingredients *</CardTitle>
            </CardHeader>
            <CardContent>
              <IngredientFields control={form.control} />
              {form.formState.errors.ingredients?.root && (
                <p className="text-sm text-red-500 mt-2">
                  {form.formState.errors.ingredients.root.message}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Steps *</CardTitle>
            </CardHeader>
            <CardContent>
              <StepFields control={form.control} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? "Saving..."
                : savedRecipeId
                ? "Save changes"
                : "Create recipe"}
            </Button>
          </div>
        </form>
      </Form>

      {savedRecipeId && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle>Recipe Image</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                recipeId={savedRecipeId}
                currentImagePath={imagePath}
                onSuccess={(path) => setImagePath(path)}
              />
              {imagePath && mode === "edit" && (
                <Button
                  className="mt-4"
                  onClick={() => router.push(`/recipes/${savedRecipeId}`)}
                >
                  View recipe
                </Button>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
