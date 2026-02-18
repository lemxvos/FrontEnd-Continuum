import { cn } from "@/lib/utils";
import { Users, Target, FolderKanban, Star, Heart } from "lucide-react";

type EntityType = "person" | "habit" | "project" | "goal" | "dream" | "event" | "custom";

const entityConfig: Record<EntityType, { colorClass: string; icon: typeof Users }> = {
  person: { colorClass: "text-entity-person bg-entity-person/10", icon: Users },
  habit: { colorClass: "text-entity-habit bg-entity-habit/10", icon: Target },
  project: { colorClass: "text-entity-project bg-entity-project/10", icon: FolderKanban },
  goal: { colorClass: "text-entity-goal bg-entity-goal/10", icon: Star },
  dream: { colorClass: "text-entity-dream bg-entity-dream/10", icon: Heart },
  event: { colorClass: "text-muted-foreground bg-muted/10", icon: Users },
  custom: { colorClass: "text-muted-foreground bg-muted/10", icon: Users },
};

interface MentionTagProps {
  type: EntityType;
  name: string;
  entityId?: string;
  className?: string;
  onClick?: () => void;
}

export default function MentionTag({ type, name, entityId, className, onClick }: MentionTagProps) {
  const config = entityConfig[type] || entityConfig.custom;
  const Icon = config.icon;
  
  return (
    <span
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-opacity hover:opacity-80",
        config.colorClass,
        className
      )}
      data-entity-id={entityId}
    >
      <Icon className="h-3 w-3" />
      {name}
    </span>
  );
}

/**
 * Extract entity mentions in format {{entity:id}} from content
 * This is the only format that backend recognizes
 * E.g. {{entity:ent_8f2a}}
 * 
 * Returns array of entity IDs (no parsing of names - that's backend's job)
 */
export function extractEntityMentions(content: string): string[] {
  const mentions: string[] = [];
  const formatRegex = /\{\{entity:([^}]+)\}\}/g;
  
  let match;
  while ((match = formatRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
}
