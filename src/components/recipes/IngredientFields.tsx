"use client";

import { useFieldArray, Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Plus, Trash2 } from "lucide-react";
import type { RecipeInput } from "@/lib/validations/recipe";

interface IngredientFieldsProps {
  control: Control<RecipeInput>;
}

export function IngredientFields({ control }: IngredientFieldsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients",
  });

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_100px_100px_36px] gap-2 text-xs font-medium text-gray-500 px-1">
        <span>Ingredient</span>
        <span>Amount</span>
        <span>Unit</span>
        <span />
      </div>
      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-[1fr_100px_100px_36px] gap-2">
          <FormField
            control={control}
            name={`ingredients.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="e.g. Flour" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`ingredients.${index}.amount`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="1/2" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`ingredients.${index}.unit`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="cups" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
            disabled={fields.length === 1}
          >
            <Trash2 className="h-4 w-4 text-gray-400" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ name: "", amount: "", unit: "", order: fields.length })}
      >
        <Plus className="mr-1 h-4 w-4" />
        Add ingredient
      </Button>
    </div>
  );
}
