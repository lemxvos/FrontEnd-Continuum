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
} from "lucide-react";

interface DashboardStats {
  totalNotes: number;
  totalEntities: number;
  uniquePeople: number;
  uniqueHabits: number;
  uniqueProjects: number;
  thisWeekNotes: number;
  thisMonthNotes: number;
  averageNotesPerDay: number;
  mostMentionedEntity?: { id: string; name: string; type: string; count: number };
  recentEntities: Array<{ id: string; name: string; type: string; mentions: number }>;
}\n\nexport default function DashboardPage() {\n  const navigate = useNavigate();\n  const [stats, setStats] = useState<DashboardStats | null>(null);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    loadDashboard();\n  }, []);\n\n  const loadDashboard = async () => {\n    setLoading(true);\n    try {\n      const { data } = await api.get(\"/api/metrics/dashboard\");\n      setStats(data);\n    } catch (err: any) {\n      toast.error(err.response?.data?.message || \"Erro ao carregar dashboard\");\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  if (loading) {\n    return (\n      <div className=\"space-y-6\">\n        <Skeleton className=\"h-48 rounded-xl\" />\n        <Skeleton className=\"h-64 rounded-xl\" />\n      </div>\n    );\n  }\n\n  if (!stats) return null;\n\n  return (\n    <div className=\"space-y-6\">\n      {/* Header */}\n      <div className=\"flex items-center justify-between\">\n        <div>\n          <h1 className=\"text-3xl font-bold\">📊 Dashboard</h1>\n          <p className=\"text-sm text-muted-foreground mt-1\">\n            Visão geral da sua vida\n          </p>\n        </div>\n        <div className=\"flex gap-2\">\n          <Button variant=\"outline\" onClick={loadDashboard}>\n            Atualizar\n          </Button>\n          <Button onClick={() => navigate(\"/journal/new\")} className=\"gap-2\">\n            <Plus className=\"h-4 w-4\" />\n            Novo\n          </Button>\n        </div>\n      </div>\n\n      {/* Stats Grid - Updated with StatCard */}\n      <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3\">\n        <StatCard\n          title=\"Notas\"\n          value={stats?.totalNotes || 0}\n          icon={<Activity className=\"h-5 w-5\" />}\n          color=\"blue\"\n          trend={stats?.thisMonthNotes ? \"up\" : \"stable\"}\n          trendValue={Math.round((stats?.thisMonthNotes || 0) / Math.max(stats?.totalNotes || 1, 1) * 100)}\n        />\n        <StatCard\n          title=\"Entidades\"\n          value={stats?.totalEntities || 0}\n          icon={<Users className=\"h-5 w-5\" />}\n          color=\"purple\"\n        />\n        <StatCard\n          title=\"Pessoas\"\n          value={stats?.uniquePeople || 0}\n          icon={<Users className=\"h-5 w-5\" />}\n          color=\"blue\"\n        />\n        <StatCard\n          title=\"Hábitos\"\n          value={stats?.uniqueHabits || 0}\n          icon={<Target className=\"h-5 w-5\" />}\n          color=\"green\"\n        />\n        <StatCard\n          title=\"Projetos\"\n          value={stats?.uniqueProjects || 0}\n          icon={<FolderKanban className=\"h-5 w-5\" />}\n          color=\"orange\"\n        />\n        <StatCard\n          title=\"Esta Semana\"\n          value={stats?.thisWeekNotes || 0}\n          icon={<TrendingUp className=\"h-5 w-5\" />}\n          color=\"pink\"\n        />\n      </div>\n\n      {/* Most Mentioned */}\n      {stats?.mostMentionedEntity && (\n        <motion.div\n          initial={{ opacity: 0, y: 10 }}\n          animate={{ opacity: 1, y: 0 }}\n          className=\"bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6\"\n        >\n          <div className=\"flex items-center justify-between mb-4\">\n            <div>\n              <p className=\"text-sm text-muted-foreground font-medium\">★ Mais mencionada</p>\n              <h3 className=\"text-2xl font-bold mt-1\">\n                {stats.mostMentionedEntity.name}\n              </h3>\n              <p className=\"text-sm text-muted-foreground mt-1\">\n                {stats.mostMentionedEntity.count} menções\n              </p>\n            </div>\n            <Button\n              variant=\"ghost\"\n              onClick={() => navigate(`/entities/${stats.mostMentionedEntity?.id}`)}\n              className=\"gap-2\"\n            >\n              Ver <ArrowRight className=\"h-4 w-4\" />\n            </Button>\n          </div>\n        </motion.div>\n      )}\n\n      {/* Network Visualization */}\n      <div className=\"bg-card border border-border rounded-lg p-6\">\n        <EntityNetwork />\n      </div>\n\n      {/* Insights Panel */}\n      <InsightsPanel />\n\n      {/* Recent Entities */}\n      <div className=\"bg-card border border-border rounded-lg p-6\">\n        <h2 className=\"text-lg font-bold mb-4\">Entidades recentes</h2>\n        <div className=\"space-y-2\">\n          {stats?.recentEntities && stats.recentEntities.length > 0 ? (\n            stats.recentEntities.map((entity, idx) => (\n              <motion.button\n                key={entity.id}\n                initial={{ opacity: 0, x: -10 }}\n                animate={{ opacity: 1, x: 0 }}\n                transition={{ delay: idx * 0.05 }}\n                onClick={() => navigate(`/entities/${entity.id}`)}\n                className=\"w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors group\"\n              >\n                <div className=\"flex items-center gap-3 flex-1\">\n                  <span className=\"text-lg\">📌</span>\n                  <div className=\"text-left\">\n                    <p className=\"font-medium\">{entity.name}</p>\n                    <p className=\"text-xs text-muted-foreground\">\n                      {entity.type.toLowerCase()} · {entity.mentions} menções\n                    </p>\n                  </div>\n                </div>\n                <ArrowRight className=\"h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform\" />\n              </motion.button>\n            ))\n          ) : (\n            <p className=\"text-sm text-muted-foreground text-center py-4\">\n              Nenhuma entidade ainda\n            </p>\n          )}\n        </div>\n      </div>\n\n      {/* Quick Actions */}\n      <div className=\"grid grid-cols-2 md:grid-cols-4 gap-3\">\n        {[\n          { label: \"Nova nota\", path: \"/journal/new\", icon: \"📝\" },\n          { label: \"Entidades\", path: \"/entities\", icon: \"🌍\" },\n          { label: \"Conexões\", path: \"/connections\", icon: \"🔗\" },\n          { label: \"Pesquisar\", path: \"/search\", icon: \"🔍\" },\n        ].map((action) => (\n          <Button\n            key={action.path}\n            variant=\"outline\"\n            onClick={() => navigate(action.path)}\n            className=\"h-auto flex-col items-center justify-center gap-2 p-4\"\n          >\n            <span className=\"text-2xl\">{action.icon}</span>\n            <span className=\"text-xs font-medium\">{action.label}</span>\n          </Button>\n        ))}\n      </div>\n    </div>\n  );\n}\n