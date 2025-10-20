import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
}

export function Loader({ className }: LoaderProps = {}) {
  return <Loader2 className={cn("animate-spin", className)} />;
}

export default function LoaderContainer() {
  return (
    <div className="flex h-full items-center justify-center pt-8">
      <Loader />
    </div>
  );
}
