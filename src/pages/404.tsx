import { Button, buttonVariants } from "@/components/ui/button";
import { Home, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex h-[calc(100vh-100px)] flex-col items-center justify-center">
      <h1 className="text-center text-5xl font-extrabold">Page Not Found</h1>
      <p className="mt-4 text-center text-lg">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex justify-center gap-6">
        <Link className={buttonVariants()} href="/">
          <Home className="mr-2 h-4 w-4" />
          Go Home
        </Link>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
