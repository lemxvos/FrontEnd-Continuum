/**
 * RelatedEntities - Mostra entidades relacionadas
 *
 * Entidades relacionadas são aquelas mencionadas juntas em notas
 * (co-ocorrências)
 */

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Network, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface RelatedEntity {
  id: string;
  name: string;
  type: string;
  icon?: string;
  color?: string;
  connectionStrength: number; // 0-1, baseado em co-ocorrências
}

interface RelatedEntitiesProps {
  entityId: string;
}

const typeColors: Record<string, string> = {
  PERSON: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  HABIT: "bg-green-500/20 text-green-700 border-green-500/30",
  PROJECT: "bg-orange-500/20 text-orange-700 border-orange-500/30",
  GOAL: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  DREAM: "bg-pink-500/20 text-pink-700 border-pink-500/30",
  EVENT: "bg-purple-500/20 text-purple-700 border-purple-500/30",
  CUSTOM: "bg-gray-500/20 text-gray-700 border-gray-500/30",
};

export function RelatedEntities({ entityId }: RelatedEntitiesProps) {
  const navigate = useNavigate();
  const [related, setRelated] = useState<RelatedEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxStrength, setMaxStrength] = useState(0);

  useEffect(() => {
    loadRelated();
  }, [entityId]);

  const loadRelated = async () => {
    setLoading(true);
    try {
      // Tenta via endpoint específico de relações
      const { data } = await api.get(`/api/entities/${entityId}/related`).catch(() => ({ data: [] }));

      const relatedList = Array.isArray(data) ? data : [];
      setRelated(relatedList);

      // Encontrar valor máximo de connectionStrength para normalizar
      const max = Math.max(...relatedList.map((e) => e.connectionStrength || 0), 1);
      setMaxStrength(max);
    } catch (err) {
      console.error("Erro ao carregar relações:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
    );
  }

  if (related.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Network className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhuma relação encontrada</p>
        <p className="text-xs text-muted-foreground mt-1">
          Essa entidade será conectada conforme for mencionada com outras
        </p>
      </div>
    );
  }

  // Ordenar por força de conexão
  const sorted = [...related].sort((a, b) => (b.connectionStrength || 0) - (a.connectionStrength || 0));

  return (
    <div className="space-y-2">
      {sorted.map((entity, idx) => {
        const strength = entity.connectionStrength || 0;
        const percentage = maxStrength ? (strength / maxStrength) * 100 : 0;
        const colorClass = typeColors[entity.type] || typeColors.CUSTOM;

        return (
          <motion.button
            key={entity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => navigate(`/entities/${entity.id}`)}
            className="w-full text-left"
          >
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg border transition-all hover:shadow-md",
                colorClass
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{entity.icon || "📌"}</span>
                  <span className="font-medium truncate">{entity.name}</span>
                  <span className="text-xs opacity-60 ml-auto">{strength.toFixed(0)} conexões</span>
                </div>
                <div className="mt-1 w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-current rounded-full transition-all" style={{ width: `${percentage}%` }} />
                </div>
              </div>
              <ArrowRight className="h-4 w-4 opacity-60 flex-shrink-0" />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
