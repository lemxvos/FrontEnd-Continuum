import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Plus, Search, Users, Target, FolderKanban } from "lucide-react";
import EntityCard from "@/components/EntityCard";
import LimitBanner from "@/components/LimitBanner";
import UpgradeModal from "@/components/UpgradeModal";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Entity {
  id: string;
  name: string;
  description?: string;
  type: string;
  tracking?: { enabled: boolean } | null;
  currentStreak?: number;
  totalCompletions?: number;
  mentions?: number;
}

const typeMap: Record<string, { type: string; label: string; singular: string; icon: typeof Users; endpoint: string; limit: number }> = {
  people: { type: "PERSON", label: "Pessoas", singular: "pessoa", icon: Users, endpoint: "/api/entities/people", limit: 10 },
  habits: { type: "HABIT", label: "Hábitos", singular: "hábito", icon: Target, endpoint: "/api/entities/habits", limit: 5 },
  projects: { type: "PROJECT", label: "Projetos", singular: "projeto", icon: FolderKanban, endpoint: "/api/entities/projects", limit: 5 },
};

export default function EntityListPage() {
  const location = useLocation();
  const slug = location.pathname.split("/").pop() || "people";
  const config = typeMap[slug] || typeMap.people;
  const Icon = config.icon;

  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Entity | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get(config.endpoint)
      .then(({ data }) => {
        setEntities(Array.isArray(data) ? data : data.entities || []);
      })
      .catch((err) => toast.error(err.response?.data?.message || "Erro"))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/entities/${deleteTarget.id}`);
      setEntities((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      toast.success("Removido!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro");
    } finally {
      setDeleteTarget(null);
    }
  };

  const filtered = search.trim()
    ? entities.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
    : entities;

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold">{config.label}</h2>
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{config.label}</h2>
          <p className="text-sm text-muted-foreground">{entities.length} {entities.length === 1 ? config.singular : config.label.toLowerCase()}</p>
        </div>
        <Button onClick={() => navigate(`/entities/new?type=${config.type}`)} className="gap-1">
          <Plus className="h-4 w-4" />
          Novo
        </Button>
      </div>

      <LimitBanner current={entities.length} max={config.limit} label={config.label.toLowerCase()} />

      {entities.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Buscar ${config.label.toLowerCase()}...`} className="pl-10" />
        </div>
      )}

      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="surface rounded-xl p-12 text-center">
          <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-1">Nenhum(a) {config.singular}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Crie e mencione no journal com {config.type === "PERSON" ? "@nome" : config.type === "HABIT" ? "*nome" : "#nome"}
          </p>
          <Button onClick={() => navigate(`/entities/new?type=${config.type}`)} className="gap-1">
            <Plus className="h-4 w-4" />
            Criar
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {filtered.map((entity) => (
            <EntityCard
              key={entity.id}
              entity={entity}
              onClick={() => navigate(`/entities/${entity.id}`)}
            />
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>Entradas do journal não serão afetadas.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Deletar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}
