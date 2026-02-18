import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface LimitBannerProps {
  current: number;
  max: number;
  label: string;
}

export default function LimitBanner({ current, max, label }: LimitBannerProps) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  // Não mostrar para usuários de planos pagos
  if (user?.plan && user.plan !== "FREE") return null;

  const ratio = current / max;
  const isNear = ratio >= 0.8;
  const isAtLimit = current >= max;

  if (!isNear) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        className={`rounded-2xl p-4 flex items-center justify-between gap-3 ${
          isAtLimit
            ? "bg-destructive/10 border border-destructive/30"
            : "bg-warning/10 border border-warning/30"
        }`}
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className={`h-5 w-5 shrink-0 ${isAtLimit ? "text-destructive" : "text-warning"}`} />
          <p className="text-sm">
            {current}/{max} {label} usados
            {isAtLimit ? " — limite atingido" : ""}
          </p>
        </div>
        <Button size="sm" onClick={() => navigate("/upgrade")} className="shrink-0 gap-1">
          <Sparkles className="h-3.5 w-3.5" />
          Upgrade
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}
