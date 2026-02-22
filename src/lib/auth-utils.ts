import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

const roleHierarchy: Record<Role, number> = {
  VIEWER: 0,
  EDITOR: 1,
  ADMIN: 2,
};

export async function getSession() {
  return auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireRole(minimumRole: Role) {
  const session = await requireAuth();
  if (roleHierarchy[session.user.role] < roleHierarchy[minimumRole]) {
    redirect("/recipes");
  }
  return session;
}

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}
