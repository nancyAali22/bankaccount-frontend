import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 p-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Compass className="size-6" aria-hidden="true" />
      </div>
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Button asChild className="mt-2">
        <Link to="/">Back to overview</Link>
      </Button>
    </div>
  );
}
