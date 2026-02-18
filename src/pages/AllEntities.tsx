/**
 * AllEntities - Página centralizada de Entidades
 * 
 * Mostra TODAS as entidades com:
 * - Filtro por tipo
 * - Pesquisa por nome
 * - Cards com informações (menções, relação, stats)
 * - Relacionamentos entre entidades
 */

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Users,
  Target,
  FolderKanban,
  Star,
  Heart,
  HelpCircle,
  Zap,
  Network,
  TrendingUp,
} from "lucide-react";
import EntityCard from "@/components/EntityCard";
import LimitBanner from "@/components/LimitBanner";
import UpgradeModal from "@/components/UpgradeModal";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Entity {
  id: string;
  name: string;
  description?: string;
  type: string;
  icon?: string;
  color?: string;
  tracking?: { enabled: boolean } | null;
  currentStreak?: number;
  totalCompletions?: number;
  mentions?: number;
  relatedCount?: number;
  updatedAt?: string;
  createdAt?: string;
}

interface EntityStats {
  PERSON?: number;
  HABIT?: number;
  PROJECT?: number;
  GOAL?: number;
  DREAM?: number;
  EVENT?: number;
  CUSTOM?: number;
  total?: number;
}

const typeFilters = [
  { type: "ALL", label: "Todos", icon: Network, color: "text-muted-foreground" },
  { type: "PERSON", label: "Pessoas", icon: Users, color: "text-blue-500" },
  { type: "HABIT", label: "Hábitos", icon: Target, color: "text-green-500" },
  { type: "PROJECT", label: "Projetos", icon: FolderKanban, color: "text-orange-500" },
  { type: "GOAL", label: "Objetivos", icon: Star, color: "text-yellow-500" },
  { type: "DREAM", label: "Sonhos", icon: Heart, color: "text-pink-500" },
  { type: "EVENT", label: "Eventos", icon: Zap, color: "text-purple-500" },
  { type: "CUSTOM", label: "Custom", icon: HelpCircle, color: "text-gray-500" },
];

const iconMap: Record<string, typeof Users> = {
  PERSON: Users,
  HABIT: Target,
  PROJECT: FolderKanban,
  GOAL: Star,
  DREAM: Heart,
  EVENT: Zap,
  CUSTOM: HelpCircle,
};

export default function AllEntitiesPage() {
  const navigate = useNavigate();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [stats, setStats] = useState<EntityStats>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"recent" | "mentions" | "name">("recent");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Entity | null>(null);

  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    setLoading(true);
    try {
      const [entitiesRes, statsRes] = await Promise.all([
        api.get("/api/entities"),
        api.get("/api/metrics/dashboard").catch(() => ({ data: {} })),
      ]);

      const entitiesList = Array.isArray(entitiesRes.data) ? entitiesRes.data : [];
      setEntities(entitiesList);

      const dashboardStats: EntityStats = {};
      dashboardStats.PERSON = statsRes.data.uniquePeople || 0;
      dashboardStats.HABIT = statsRes.data.uniqueHabits || 0;
      dashboardStats.PROJECT = statsRes.data.uniqueProjects || 0;
      dashboardStats.GOAL = statsRes.data.uniqueGoals || 0;
      dashboardStats.DREAM = statsRes.data.uniqueDreams || 0;
      dashboardStats.total =
        entitiesList.length ||
        (Object.values(dashboardStats).reduce((a, b) => a + (b || 0), 0) as number);

      setStats(dashboardStats);
      if (statsRes.data.limitReached) {
        setUpgradeOpen(true);
      }
    } catch (err: any) {
      if (err.response?.status === 403) setUpgradeOpen(true);
      else toast.error(err.response?.data?.message || "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  };

  const filteredEntities = useMemo(() => {
    let result = entities;

    if (selectedType !== "ALL") {
      result = result.filter(
        (e) => (e.type || "CUSTOM").toUpperCase() === selectedType
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          (e.name || "").toLowerCase().includes(q) ||
          (e.description || "").toLowerCase().includes(q)
      );
    }

    if (sortBy === "mentions") {
      result.sort((a, b) => (b.mentions || 0) - (a.mentions || 0));
    } else if (sortBy === "name") {
      result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else {
      result.sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt || 0).getTime() -
          new Date(a.updatedAt || a.createdAt || 0).getTime()
      );
    }

    return result;
  }, [entities, selectedType, searchQuery, sortBy]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/entities/${deleteTarget.id}`);
      setEntities((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      toast.success("Entidade removida!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao deletar");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            🌍 Entidades ({stats.total || entities.length})
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Centralize tudo que importa. Pessoas, projetos, hábitos e mais.
          </p>
        </div>
        <Button
          onClick={() => navigate("/entities/new")}
          size="lg"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Entidade
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: "Pessoas", value: stats.PERSON || 0, icon: Users },
          { label: "Hábitos", value: stats.HABIT || 0, icon: Target },
          { label: "Projetos", value: stats.PROJECT || 0, icon: FolderKanban },
          { label: "Outros", value: (stats.GOAL || 0) + (stats.DREAM || 0) + (stats.EVENT || 0) + (stats.CUSTOM || 0), icon: Zap },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-accent border border-border"
          >
            <div className="flex items-center gap-2">
              <stat.icon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <LimitBanner />

      <div className="space-y-4 bg-card border border-border rounded-lg p-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Buscar</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo</label>
          <div className="flex flex-wrap gap-2">
            {typeFilters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.type}
                  onClick={() => setSelectedType(filter.type)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border",
                    selectedType === filter.type
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:border-primary hover:bg-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Ordenar por</label>
          <div className="flex gap-2">
            {[
              { value: "recent", label: "Recentes" },
              { value: "mentions", label: "Menções" },
              { value: "name", label: "Nome" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value as any)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border",
                  sortBy === option.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:border-primary hover:bg-accent"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      )}

      {!loading && filteredEntities.length === 0 && (
        <div className="text-center py-12">
          <Network className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {searchQuery || selectedType !== "ALL"
              ? "Nenhuma entidade encontrada"
              : "Crie sua primeira entidade para começar"}
          </p>
          <Button
            variant="ghost"
            onClick={() => navigate("/entities/new")}
            className="mt-3"
          >
            Criar entidade
          </Button>
        </div>
      )}

      {!loading && filteredEntities.length > 0 && (
        <motion.div
          className="grid gap-3"
          layout
        >
          <p className="text-sm text-muted-foreground">
            {filteredEntities.length} entidade{filteredEntities.length !== 1 ? "s" : ""}
          </p>
          {filteredEntities.map((entity, idx) => (
            <motion.div
              key={entity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <EntityCard
                entity={entity}
                onClick={() => navigate(`/entities/${entity.id}`)}
                onDelete={() => setDeleteTarget(entity)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar entidade?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.name}" será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </div>
  );
}
