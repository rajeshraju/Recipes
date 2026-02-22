import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-gray-500">Page not found</p>
        <Button asChild>
          <Link href="/recipes">Go to recipes</Link>
        </Button>
      </div>
    </div>
  );
}
