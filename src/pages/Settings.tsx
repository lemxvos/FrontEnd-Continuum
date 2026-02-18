import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { User, Mail, Crown, Download, LogOut, XCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [subInfo, setSubInfo] = useState<any>(null);

  useEffect(() => {
    api.get("/api/subscriptions/me")
      .then(({ data }) => setSubInfo(data))
      .catch(() => {});
  }, []);

  const handleExport = async () => {
    try {
      const { data } = await api.get("/api/notes");
      const entries = Array.isArray(data) ? data : [];
      const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "continuum-export.json";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Dados exportados!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro");
    }
  };

  const handleCancelSubscription = async () => {
    setCanceling(true);
    try {
      await api.post("/api/subscriptions/cancel");
      updateUser({ plan: "FREE" });
      toast.success("Assinatura cancelada.");
      setCancelOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro");
    } finally {
      setCanceling(false);
    }
  };

  const Section = ({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="surface rounded-xl p-5 space-y-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
      {children}
    </motion.div>
  );

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold">Settings</h2>

      <Section title="Perfil">
        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{user?.username || "User"}</p>
            <p className="text-xs text-muted-foreground">Username</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{user?.email}</p>
            <p className="text-xs text-muted-foreground">Email</p>
          </div>
        </div>
      </Section>

      <Section title="Assinatura" delay={0.05}>
        <div className="flex items-center gap-3">
          <Crown className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-medium">{user?.plan || "FREE"}</p>
            <p className="text-xs text-muted-foreground">
              {subInfo?.status === "ACTIVE" && subInfo?.currentPeriodEnd
                ? `Renova em ${new Date(subInfo.currentPeriodEnd).toLocaleDateString("pt-BR")}`
                : "Plano atual"}
            </p>
          </div>
        </div>
        {user?.plan === "FREE" && (
          <Button variant="outline" size="sm" onClick={() => navigate("/upgrade")} className="gap-1">
            <Crown className="h-3.5 w-3.5" />
            Upgrade de plano
          </Button>
        )}
        {user?.plan && user.plan !== "FREE" && (
          <Button variant="outline" size="sm" onClick={() => setCancelOpen(true)} className="gap-1 text-destructive hover:text-destructive">
            <XCircle className="h-3.5 w-3.5" />
            Cancelar assinatura
          </Button>
        )}
      </Section>

      <Section title="Ações" delay={0.1}>
        <Button variant="outline" size="sm" onClick={handleExport} className="w-full justify-start gap-2">
          <Download className="h-3.5 w-3.5" />
          Exportar dados (JSON)
        </Button>
        <Button variant="outline" size="sm" onClick={logout} className="w-full justify-start gap-2 text-destructive hover:text-destructive">
          <LogOut className="h-3.5 w-3.5" />
          Sair da conta
        </Button>
      </Section>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar assinatura PRO</AlertDialogTitle>
            <AlertDialogDescription>Você perderá acesso aos recursos PRO ao final do período atual.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter PRO</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelSubscription} disabled={canceling} className="bg-destructive text-destructive-foreground">
              {canceling && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
              Cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
