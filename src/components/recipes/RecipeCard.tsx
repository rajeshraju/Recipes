import Link from "next/link";
import Image from "next/image";
import { Clock, Users, ChefHat } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Category {
  category: { id: string; name: string; slug: string };
}

interface RecipeCardProps {
  recipe: {
    id: string;
    title: string;
    description?: string | null;
    imagePath?: string | null;
    servings?: number | null;
    prepTime?: number | null;
    cookTime?: number | null;
    author: { name?: string | null };
    categories: Category[];
    _count: { ingredients: number; steps: number };
  };
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

  return (
    <Link href={`/recipes/${recipe.id}`}>
      <Card className="group hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col">
        <div className="aspect-video relative bg-gray-100 overflow-hidden">
          {recipe.imagePath ? (
            <Image
              src={recipe.imagePath}
              alt={recipe.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <ChefHat className="h-12 w-12 text-gray-300" />
            </div>
          )}
        </div>
        <CardContent className="flex-1 pt-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{recipe.title}</h3>
          {recipe.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{recipe.description}</p>
          )}
          <div className="flex flex-wrap gap-1">
            {recipe.categories.slice(0, 3).map(({ category }) => (
              <Badge key={category.id} variant="secondary" className="text-xs">
                {category.name}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="pt-0 pb-4 flex items-center gap-4 text-xs text-gray-500">
          {totalTime > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {totalTime} min
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {recipe.servings}
            </span>
          )}
          {recipe.author.name && (
            <span className="ml-auto truncate">{recipe.author.name}</span>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
