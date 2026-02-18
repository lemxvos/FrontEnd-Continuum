/**
 * InsightsPanel - Painel de insights e análises
 */

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, Zap, Target } from "lucide-react";

interface Insight {
  title: string;
  description: string;
  action?: { label: string; path: string };
  type: "info" | "success" | "warning" | "tip";
}

interface InsightData {
  recentInsights: Insight[];
  recommendations: Insight[];
  patterns: { title: string; description: string }[];
}

const typeColors = {
  info: "bg-blue-50 text-blue-900 border-blue-200",
  success: "bg-green-50 text-green-900 border-green-200",
  warning: "bg-yellow-50 text-yellow-900 border-yellow-200",
  tip: "bg-purple-50 text-purple-900 border-purple-200",
};

const typeIcons = {
  info: Lightbulb,
  success: TrendingUp,
  warning: Zap,
  tip: Target,
};

export function InsightsPanel() {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/metrics/insights");
      setData(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao carregar insights");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Skeleton className="h-96 rounded-lg" />;
  if (!data) return null;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="w-full rounded-none border-b">
          <TabsTrigger value="insights" className="flex-1">
            💡 Insights
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex-1">
            🎯 Recomendações
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex-1">
            🔍 Padrões
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="p-4 space-y-3">
          {data.recentInsights && data.recentInsights.length > 0 ? (
            data.recentInsights.map((insight, idx) => {
              const Icon = typeIcons[insight.type];
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-3 rounded-lg border  ${typeColors[insight.type]}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{insight.title}</p>
                      <p className="text-xs opacity-75 mt-0.5 leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum insight no momento
            </p>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="p-4 space-y-3">
          {data.recommendations && data.recommendations.length > 0 ? (
            data.recommendations.map((rec, idx) => {
              const Icon = typeIcons[rec.type];
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-3 rounded-lg border ${typeColors[rec.type]}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{rec.title}</p>
                      <p className="text-xs opacity-75 mt-0.5 leading-relaxed">
                        {rec.description}
                      </p>
                      {rec.action && (
                        <a
                          href={rec.action.path}
                          className="text-xs font-medium mt-2 inline-block underline opacity-75 hover:opacity-100"
                        >
                          {rec.action.label} →
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma recomendação
            </p>
          )}
        </TabsContent>

        <TabsContent value="patterns" className="p-4 space-y-3">
          {data.patterns && data.patterns.length > 0 ? (
            data.patterns.map((pattern, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-3 rounded-lg border border-border bg-accent"
              >
                <p className="font-semibold text-sm">{pattern.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {pattern.description}
                </p>
              </motion.div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum padrão detectado ainda
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}\n