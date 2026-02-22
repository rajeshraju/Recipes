"use client";

import { useFieldArray, Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Plus, Trash2 } from "lucide-react";
import type { RecipeInput } from "@/lib/validations/recipe";

interface StepFieldsProps {
  control: Control<RecipeInput>;
}

export function StepFields({ control }: StepFieldsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "steps",
  });

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-3">
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-sm font-semibold mt-2">
            {index + 1}
          </div>
          <div className="flex-1">
            <FormField
              control={control}
              name={`steps.${index}.instruction`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder={`Step ${index + 1} instructions...`}
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
            disabled={fields.length === 1}
            className="mt-2"
          >
            <Trash2 className="h-4 w-4 text-gray-400" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ instruction: "", stepNumber: fields.length + 1 })}
      >
        <Plus className="mr-1 h-4 w-4" />
        Add step
      </Button>
    </div>
  );
}
