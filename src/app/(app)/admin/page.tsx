import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Tag } from "lucide-react";

export default async function AdminDashboard() {
  const [recipeCount, userCount, categoryCount] = await Promise.all([
    prisma.recipe.count(),
    prisma.user.count(),
    prisma.category.count(),
  ]);

  const stats = [
    { label: "Total Recipes", value: recipeCount, icon: BookOpen, color: "text-orange-500" },
    { label: "Total Users", value: userCount, icon: Users, color: "text-blue-500" },
    { label: "Categories", value: categoryCount, icon: Tag, color: "text-green-500" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{stat.label}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
