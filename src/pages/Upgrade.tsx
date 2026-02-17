import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

const plans = [
  {
    name: "FREE",
    price: "R$ 0",
    features: ["30 entradas no journal", "5 hábitos", "10 pessoas", "5 projetos"],
  },
  {
    name: "PRO",
    price: "R$ 19/mês",
    features: ["Entradas ilimitadas", "Hábitos ilimitados", "Pessoas ilimitadas", "Projetos ilimitados", "Análise avançada", "Exportação ilimitada"],
    highlight: true,
  },
];

export default function UpgradePage() {
  const { user, updateUser } = useAuthStore();
  const isPro = user?.plan === "PRO";
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      api.post("/api/subscription/sync")
        .then(({ data }) => {
          if (data.planType === "PRO" || data.status === "ACTIVE" || data.plan === "PRO") {
            updateUser({ plan: "PRO" });
            toast.success("Você agora é PRO! 🎉");
          }
        })
        .catch(() => {
          api.get("/auth/me").then(({ data }) => {
            if (data.plan === "PRO") {
              updateUser({ plan: "PRO" });
              toast.success("Você agora é PRO! 🎉");
            }
          }).catch(() => {});
        });
    }
  }, [searchParams]);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/api/subscription/checkout");
      if (data.url) window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao iniciar checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold">{isPro ? "Você é PRO ✨" : "Upgrade"}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isPro ? "Aproveite todos os recursos" : "Desbloqueie o potencial completo"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan, i) => {
          const isCurrent = plan.name === (isPro ? "PRO" : "FREE");
          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`surface rounded-xl p-6 space-y-4 relative ${plan.highlight && !isCurrent ? "ring-2 ring-primary" : ""} ${isCurrent ? "ring-2 ring-success" : ""}`}
            >
              {isCurrent && (
                <span className="absolute top-3 right-3 bg-success text-success-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Atual</span>
              )}
              <div className="flex items-center gap-2">
                <Sparkles className={`h-5 w-5 ${plan.highlight ? "text-primary" : "text-muted-foreground"}`} />
                <h3 className="text-lg font-bold">{plan.name}</h3>
              </div>
              <p className="text-3xl font-bold">{plan.price}</p>
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.highlight && !isPro ? (
                <Button className="w-full" disabled={loading} onClick={handleUpgrade}>
                  {loading && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
                  Assinar PRO
                </Button>
              ) : (
                <Button className="w-full" variant="outline" disabled>
                  {isCurrent ? "Plano atual" : "Plano gratuito"}
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
