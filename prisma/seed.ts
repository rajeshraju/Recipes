import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("Admin123!", 12);

  await prisma.user.upsert({
    where: { email: "admin@recipes.local" },
    update: {},
    create: {
      email: "admin@recipes.local",
      name: "Admin User",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log("Admin user created: admin@recipes.local / Admin123!");

  const categories = [
    { name: "Breakfast", slug: "breakfast" },
    { name: "Lunch", slug: "lunch" },
    { name: "Dinner", slug: "dinner" },
    { name: "Desserts", slug: "desserts" },
    { name: "Snacks", slug: "snacks" },
    { name: "Drinks", slug: "drinks" },
    { name: "Vegetarian", slug: "vegetarian" },
    { name: "Vegan", slug: "vegan" },
    { name: "Quick & Easy", slug: "quick-easy" },
    { name: "Baking", slug: "baking" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log(`${categories.length} categories created.`);
  console.log("Seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
