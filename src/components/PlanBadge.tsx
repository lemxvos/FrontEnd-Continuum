import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export default function PlanBadge({ className }: { className?: string }) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const isPro = user?.plan === "PRO";

  return (
    <button
      onClick={() => !isPro && navigate("/upgrade")}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors",
        isPro
          ? "bg-primary/15 text-primary"
          : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer",
        className
      )}
    >
      {isPro && <Sparkles className="h-3 w-3" />}
      {isPro ? "PRO" : "FREE"}
    </button>
  );
}
