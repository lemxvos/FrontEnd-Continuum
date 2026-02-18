/**
 * Dashboard - Visualização central de dados
 * 
 * Mostra:
 * - Resumo de entidades
 * - Relações e redes
 * - Atividade recente
 * - Stats e trends
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { StatCard } from "@/components/StatCard";
import { EntityNetwork } from "@/components/EntityNetwork";
import { InsightsPanel } from "@/components/InsightsPanel";
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  FolderKanban,
  Activity,
  Plus,
  ArrowRight,
} from 'lucide-react';

interface DashboardStats {
  totalNotes: number;
  thisMonthNotes: number;
  totalEntities: number;
  uniquePeople: number;
  uniqueHabits: number;
  uniqueProjects: number;
  thisWeekNotes: number;
  mostMentionedEntity?: {
    id: string;
    name: string;
    count: number;
  };
  recentEntities: Array<{
    id: string;
    name: string;
    type: string;
    mentions: number;
  }>;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/metrics/dashboard');
      setStats(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📊 Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão geral da sua vida
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDashboard}>
            Atualizar
          </Button>
          <Button onClick={() => navigate('/journal/new')} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          title="Notas"
          value={stats?.totalNotes || 0}
          icon={<Activity className="h-5 w-5" />}
          color="blue"
          trend={stats?.thisMonthNotes ? 'up' : 'stable'}
          trendValue={Math.round((stats?.thisMonthNotes || 0) / Math.max(stats?.totalNotes || 1, 1) * 100)}
        />
        <StatCard
          title="Entidades"
          value={stats?.totalEntities || 0}
          icon={<Users className="h-5 w-5" />}
          color="purple"
        />
        <StatCard
          title="Pessoas"
          value={stats?.uniquePeople || 0}
          icon={<Users className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Hábitos"
          value={stats?.uniqueHabits || 0}
          icon={<Target className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Projetos"
          value={stats?.uniqueProjects || 0}
          icon={<FolderKanban className="h-5 w-5" />}
          color="orange"
        />
        <StatCard
          title="Esta Semana"
          value={stats?.thisWeekNotes || 0}
          icon={<TrendingUp className="h-5 w-5" />}
          color="pink"
        />
      </div>

      {/* Most Mentioned */}
      {stats?.mostMentionedEntity && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground font-medium">★ Mais mencionada</p>
              <h3 className="text-2xl font-bold mt-1">
                {stats.mostMentionedEntity.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.mostMentionedEntity.count} menções
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate(`/entities/${stats.mostMentionedEntity?.id}`)}
              className="gap-2"
            >
              Ver <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Network Visualization */}
      <div className="bg-card border border-border rounded-lg p-6">
        <EntityNetwork />
      </div>

      {/* Insights Panel */}
      <InsightsPanel />

      {/* Recent Entities */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4">Entidades recentes</h2>
        <div className="space-y-2">
          {stats?.recentEntities && stats.recentEntities.length > 0 ? (
            stats.recentEntities.map((entity, idx) => (
              <motion.button
                key={entity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => navigate(`/entities/${entity.id}`)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors group"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-lg">📌</span>
                  <div className="text-left">
                    <p className="font-medium">{entity.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {entity.type.toLowerCase()} · {entity.mentions} menções
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </motion.button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma entidade ainda
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Nova nota', path: '/journal/new', icon: '📝' },
          { label: 'Entidades', path: '/entities', icon: '🌍' },
          { label: 'Conexões', path: '/connections', icon: '🔗' },
          { label: 'Pesquisar', path: '/search', icon: '🔍' },
        ].map((action) => (
          <Button
            key={action.path}
            variant="outline"
            onClick={() => navigate(action.path)}
            className="h-auto flex-col items-center justify-center gap-2 p-4"
          >
            <span className="text-2xl">{action.icon}</span>
            <span className="text-xs font-medium">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}