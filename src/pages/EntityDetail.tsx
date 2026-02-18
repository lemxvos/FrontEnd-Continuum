import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, CheckCircle, Users, Target, FolderKanban, Star, Heart, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import HeatmapGrid from "@/components/HeatmapGrid";
import StreakCounter from "@/components/StreakCounter";
import ProgressModal from "@/components/ProgressModal";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Entity {
  id: string;
  name: string;
  description?: string;
  type: string;
  tracking?: { enabled: boolean; frequency?: string; unit?: string; targetValue?: number } | null;
  createdAt: string;
}

interface EntityStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number;
  lastTrackedDate?: string;
}

interface Mention {
  noteId: string;
  noteTitle: string;
  date: string;
  context: string;
}

const iconMap: Record<string, { icon: typeof Users; colorClass: string }> = {
  PERSON: { icon: Users, colorClass: "text-entity-person bg-entity-person/10" },
  HABIT: { icon: Target, colorClass: "text-entity-habit bg-entity-habit/10" },
  PROJECT: { icon: FolderKanban, colorClass: "text-entity-project bg-entity-project/10" },
  GOAL: { icon: Star, colorClass: "text-entity-goal bg-entity-goal/10" },
  DREAM: { icon: Heart, colorClass: "text-entity-dream bg-entity-dream/10" },
  CUSTOM: { icon: HelpCircle, colorClass: "text-muted-foreground bg-muted" },
};

function highlightSnippet(text: string) {
  return text
    .replace(/@([\w\u00C0-\u024F]+)/g, '<span class="mention-person">@$1</span>')
    .replace(/#([\w\u00C0-\u024F]+)/g, '<span class="mention-project">#$1</span>')
    .replace(/\*([\w\u00C0-\u024F]+)/g, '<span class="mention-habit">*$1</span>');
}

export default function EntityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entity, setEntity] = useState<Entity | null>(null);
  const [stats, setStats] = useState<EntityStats | null>(null);
  const [heatmap, setHeatmap] = useState<Record<string, number>>({});
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);

  const loadData = () => {
    const promises: Promise<any>[] = [
      api.get(`/api/entities/${id}`).then(({ data }) => setEntity(data)),
    ];

    // Load stats and heatmap (may fail if not trackable)
    promises.push(
      api.get(`/api/entities/${id}/stats`).then(({ data }) => setStats(data)).catch(() => {}),
      api.get(`/api/entities/${id}/heatmap`).then(({ data }) => {
        if (typeof data === "object" && !Array.isArray(data)) {
          setHeatmap(data);
        }
      }).catch(() => {}),
      api.get(`/api/metrics/entities/${id}/timeline`).then(({ data }) => {
        if (data?.mentions && Array.isArray(data.mentions)) {
          setMentions(data.mentions);
        }
      }).catch(() => {}),
    );

    Promise.all(promises)
      .catch((err) => toast.error(err.response?.data?.message || "Erro"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const handleDelete = async () => {
    try {
      await api.delete(`/api/entities/${id}`);
      toast.success("Entidade excluída!");
      navigate(-1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro");
    }
  };

  const handleCheckmark = async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      await api.post(`/api/entities/${id}/track`, {
        date: today,
        value: 1,
      });
      toast.success("Registrado! ✓");
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  if (!entity) {
    return <p className="text-muted-foreground text-center py-12">Entidade não encontrada.</p>;
  }

  const config = iconMap[entity.type] || iconMap.CUSTOM;
  const Icon = config.icon;
  const isTrackable = entity.tracking?.enabled;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="surface rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mt-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className={`p-3 rounded-xl ${config.colorClass}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{entity.name}</h2>
              {entity.description && (
                <p className="text-sm text-muted-foreground mt-1">{entity.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Criado em {format(new Date(entity.createdAt), "dd MMM yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            {isTrackable && (
              <>
                <Button variant="outline" size="sm" onClick={handleCheckmark} className="gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Hoje
                </Button>
                <Button variant="outline" size="sm" onClick={() => setProgressOpen(true)}>
                  Registrar
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" onClick={() => setDeleteOpen(true)} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      {isTrackable && stats && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="surface rounded-xl p-4 text-center">
            <StreakCounter count={stats.currentStreak} className="justify-center text-base" />
            <p className="text-xs text-muted-foreground mt-1">Streak atual</p>
          </div>
          <div className="surface rounded-xl p-4 text-center">
            <p className="text-lg font-bold">{stats.longestStreak}</p>
            <p className="text-xs text-muted-foreground">Maior streak</p>
          </div>
          <div className="surface rounded-xl p-4 text-center">
            <p className="text-lg font-bold">{stats.totalCompletions}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="surface rounded-xl p-4 text-center">
            <p className="text-lg font-bold">{stats.completionRate?.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Conclusão</p>
          </div>
        </motion.div>
      )}

      {/* Heatmap */}
      {isTrackable && Object.keys(heatmap).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="surface rounded-xl p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Atividade (365 dias)</p>
          <HeatmapGrid data={heatmap} />
        </motion.div>
      )}

      {/* Timeline */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">Timeline ({mentions.length} menções)</p>
        {mentions.length === 0 ? (
          <div className="surface rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">Nenhuma menção no journal ainda</p>
          </div>
        ) : (
          mentions.map((m, i) => (
            <motion.div
              key={`${m.noteId}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="surface rounded-lg p-4 cursor-pointer hover:bg-[hsl(var(--surface-2))] transition-colors"
              onClick={() => navigate(`/journal/${m.noteId}`)}
            >
              <p className="text-xs text-muted-foreground mb-1">
                {format(new Date(m.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </p>
              <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightSnippet(m.context) }} />
            </motion.div>
          ))
        )}
      </div>

      {/* Delete dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar "{entity.name}"?</AlertDialogTitle>
            <AlertDialogDescription>Dados de tracking e menções no journal serão desassociados.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Deletar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Progress modal */}
      {isTrackable && (
        <ProgressModal
          open={progressOpen}
          onClose={() => setProgressOpen(false)}
          entityId={entity.id}
          entityName={entity.name}
          unit={entity.tracking?.unit}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
