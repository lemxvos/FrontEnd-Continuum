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
    planId: "free",
  },
  {
    name: "PLUS",
    price: "R$ 9/mês",
    features: ["100 entradas no journal", "20 hábitos", "30 pessoas", "20 projetos", "Análise básica"],
    planId: "plus",
  },
  {
    name: "PRO",
    price: "R$ 19/mês",
    features: ["Entradas ilimitadas", "Hábitos ilimitados", "Pessoas ilimitadas", "Projetos ilimitados", "Análise avançada", "Exportação ilimitada"],
    planId: "pro",
    highlight: true,
  },
  {
    name: "VISION",
    price: "R$ 39/mês",
    features: ["Tudo do PRO", "Prioridade no suporte", "Acesso antecipado a features", "Integração com Google Calendar"],
    planId: "vision",
  },
];

export default function UpgradePage() {
  const { user, updateUser } = useAuthStore();
  const currentPlan = user?.plan || "FREE";
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      // Atualizar dados do usuário após checkout bem-sucedido
      api.get("/auth/me")
        .then(({ data }) => {
          if (data.plan && data.plan !== currentPlan) {
            updateUser({ plan: data.plan });
            toast.success(`Bem-vindo ao plano ${data.plan}! 🎉`);
          }
        })
        .catch(() => {});
    }
  }, [searchParams]);

  const handleCheckout = async (planId: string) => {
    if (planId === "free" || planId === currentPlan.toLowerCase()) return;
    
    setLoading(true);
    try {
      const { data } = await api.post("/api/subscriptions/checkout", { planId });
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
        <h2 className="text-2xl font-bold">{currentPlan === "FREE" ? "Escolha seu plano" : `Você está no plano ${currentPlan}`}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {currentPlan === "FREE" ? "Desbloqueie o potencial completo" : "Aproveite todos os recursos"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan, i) => {
          const isCurrent = plan.name === currentPlan;
          const isPayable = plan.planId !== "free" && plan.planId !== currentPlan.toLowerCase();
          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`surface rounded-xl p-6 space-y-4 relative flex flex-col ${plan.highlight && !isCurrent ? "ring-2 ring-primary" : ""} ${isCurrent ? "ring-2 ring-success" : ""}`}
            >
              {isCurrent && (
                <span className="absolute top-3 right-3 bg-success text-success-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Atual</span>
              )}
              <div className="flex items-center gap-2">
                <Sparkles className={`h-5 w-5 ${plan.highlight ? "text-primary" : "text-muted-foreground"}`} />
                <h3 className="text-lg font-bold">{plan.name}</h3>
              </div>
              <p className="text-3xl font-bold">{plan.price}</p>
              <ul className="space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {isPayable ? (
                <Button 
                  className="w-full" 
                  disabled={loading} 
                  onClick={() => handleCheckout(plan.planId)}
                  variant={plan.highlight ? "default" : "outline"}
                >
                  {loading && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
                  Assinar {plan.name}
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
