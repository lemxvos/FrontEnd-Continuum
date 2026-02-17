import { Users, Target, FolderKanban, Star, Heart, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import StreakCounter from "@/components/StreakCounter";

const typeConfig: Record<string, { icon: typeof Users; colorClass: string; label: string }> = {
  PERSON: { icon: Users, colorClass: "text-entity-person bg-entity-person/10", label: "Pessoa" },
  HABIT: { icon: Target, colorClass: "text-entity-habit bg-entity-habit/10", label: "Hábito" },
  PROJECT: { icon: FolderKanban, colorClass: "text-entity-project bg-entity-project/10", label: "Projeto" },
  GOAL: { icon: Star, colorClass: "text-entity-goal bg-entity-goal/10", label: "Objetivo" },
  DREAM: { icon: Heart, colorClass: "text-entity-dream bg-entity-dream/10", label: "Sonho" },
  CUSTOM: { icon: HelpCircle, colorClass: "text-muted-foreground bg-muted", label: "Custom" },
};

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

interface EntityCardProps {
  entity: Entity;
  onClick?: () => void;
  className?: string;
}

export default function EntityCard({ entity, onClick, className }: EntityCardProps) {
  const config = typeConfig[entity.type] || typeConfig.CUSTOM;
  const Icon = config.icon;
  const isTrackable = entity.tracking?.enabled;

  return (
    <div
      onClick={onClick}
      className={cn(
        "surface rounded-xl p-4 hover:bg-[hsl(var(--surface-2))] cursor-pointer transition-colors group",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", config.colorClass)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate">{entity.name}</span>
            <span className={cn("text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full", config.colorClass)}>
              {config.label}
            </span>
          </div>
          {entity.description && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{entity.description}</p>
          )}
          <div className="flex items-center gap-3 mt-1.5">
            {isTrackable && entity.currentStreak !== undefined && entity.currentStreak > 0 && (
              <StreakCounter count={entity.currentStreak} />
            )}
            {isTrackable && entity.totalCompletions !== undefined && (
              <span className="text-xs text-muted-foreground">{entity.totalCompletions} total</span>
            )}
            {entity.mentions !== undefined && entity.mentions > 0 && (
              <span className="text-xs text-muted-foreground">{entity.mentions} menções</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
