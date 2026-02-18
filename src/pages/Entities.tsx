import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Users, Target, FolderKanban, Star, Heart, Plus } from "lucide-react";
import EntityCard from "@/components/EntityCard";

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

interface EntityStats {
  PERSON?: number;
  HABIT?: number;
  PROJECT?: number;
  GOAL?: number;
  DREAM?: number;
}

const typeGroups = [
  { type: "PERSON", label: "Pessoas", icon: Users, color: "text-entity-person", path: "/entities/people" },
  { type: "HABIT", label: "Hábitos", icon: Target, color: "text-entity-habit", path: "/entities/habits" },
  { type: "PROJECT", label: "Projetos", icon: FolderKanban, color: "text-entity-project", path: "/entities/projects" },
];

export default function EntitiesOverview() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [stats, setStats] = useState<EntityStats>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get("/api/entities").then(({ data }) => Array.isArray(data) ? data : []),
      api.get("/api/metrics/dashboard").then(({ data }) => {
        // Mapear DashboardMetrics para EntityStats
        const stats: EntityStats = {};
        stats.PERSON = data.uniquePeople || 0;
        stats.HABIT = data.uniqueHabits || 0;
        stats.PROJECT = data.uniqueProjects || 0;
        return stats;
      }).catch(() => ({})),
    ])
      .then(([entities, stats]) => {
        setEntities(entities);
        setStats(stats);
      })
      .catch((err) => toast.error(err.response?.data?.message || "Erro"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold">Entidades</h2>
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Entidades</h2>
        <Button onClick={() => navigate("/entities/new")} className="gap-1">
          <Plus className="h-4 w-4" />
          Nova entidade
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {typeGroups.map((g) => (
          <motion.div
            key={g.type}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate(g.path)}
            className="surface rounded-xl p-4 cursor-pointer hover:bg-[hsl(var(--surface-2))] transition-colors"
          >
            <g.icon className={`h-5 w-5 ${g.color} mb-2`} />
            <p className="text-2xl font-bold">{(stats as any)[g.type] || 0}</p>
            <p className="text-xs text-muted-foreground">{g.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent entities */}
      {entities.length === 0 ? (
        <div className="surface rounded-xl p-12 text-center">
          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-1">Nenhuma entidade</h3>
          <p className="text-sm text-muted-foreground mb-4">Crie pessoas, hábitos e projetos para mencioná-los no journal.</p>
          <Button onClick={() => navigate("/entities/new")} className="gap-1">
            <Plus className="h-4 w-4" />
            Criar primeira entidade
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Todas ({entities.length})</h3>
          {entities.slice(0, 20).map((entity) => (
            <EntityCard
              key={entity.id}
              entity={entity}
              onClick={() => navigate(`/entities/${entity.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
