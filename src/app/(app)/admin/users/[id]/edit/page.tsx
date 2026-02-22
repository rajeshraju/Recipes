import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditUserForm } from "./EditUserForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: PageProps) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) notFound();
  return <EditUserForm user={user} />;
}
