import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { UserTable } from "@/components/admin/UserTable";
import { Plus } from "lucide-react";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { recipes: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button asChild>
          <Link href="/admin/users/new">
            <Plus className="mr-1 h-4 w-4" />
            New user
          </Link>
        </Button>
      </div>
      <UserTable users={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))} />
    </div>
  );
}
