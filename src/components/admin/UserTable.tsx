"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface User {
  id: string;
  name?: string | null;
  email: string;
  role: "ADMIN" | "EDITOR" | "VIEWER";
  createdAt: string;
  _count: { recipes: number };
}

const roleBadge: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  EDITOR: "bg-blue-100 text-blue-700",
  VIEWER: "bg-gray-100 text-gray-700",
};

export function UserTable({ users }: { users: User[] }) {
  const router = useRouter();
  const { data: session } = useSession();

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete user "${name}"? All their recipes will also be deleted.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      toast.success("User deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Recipes</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="w-24">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name ?? "-"}</TableCell>
            <TableCell className="text-gray-500">{user.email}</TableCell>
            <TableCell>
              <Badge className={roleBadge[user.role]}>{user.role}</Badge>
            </TableCell>
            <TableCell>{user._count.recipes}</TableCell>
            <TableCell className="text-gray-500 text-sm">
              {new Date(user.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/admin/users/${user.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700"
                  disabled={user.id === session?.user?.id}
                  onClick={() => handleDelete(user.id, user.name ?? user.email)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
