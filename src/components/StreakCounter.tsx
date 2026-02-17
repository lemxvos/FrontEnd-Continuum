import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCounterProps {
  count: number;
  className?: string;
}

export default function StreakCounter({ count, className }: StreakCounterProps) {
  if (count <= 0) return null;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", className)}>
      <Flame className="h-3.5 w-3.5 text-warning" />
      <span className="text-warning">{count}</span>
    </span>
  );
}
