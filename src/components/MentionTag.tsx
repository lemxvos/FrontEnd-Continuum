import { cn } from "@/lib/utils";
import { Users, Target, FolderKanban, Star, Heart } from "lucide-react";

type EntityType = "person" | "habit" | "project" | "goal" | "dream" | string;

const entityConfig: Record<string, { prefix: string; colorClass: string; icon: typeof Users }> = {
  person: { prefix: "@", colorClass: "text-entity-person bg-entity-person/10", icon: Users },
  habit: { prefix: "*", colorClass: "text-entity-habit bg-entity-habit/10", icon: Target },
  project: { prefix: "#", colorClass: "text-entity-project bg-entity-project/10", icon: FolderKanban },
  goal: { prefix: "◎", colorClass: "text-entity-goal bg-entity-goal/10", icon: Star },
  dream: { prefix: "♡", colorClass: "text-entity-dream bg-entity-dream/10", icon: Heart },
};

interface MentionTagProps {
  type: EntityType;
  name: string;
  className?: string;
  onClick?: () => void;
}

export default function MentionTag({ type, name, className, onClick }: MentionTagProps) {
  const config = entityConfig[type] || entityConfig.person;
  return (
    <span
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-opacity hover:opacity-80",
        config.colorClass,
        className
      )}
    >
      {config.prefix}{name}
    </span>
  );
}

interface Entity {
  id: string;
  name: string;
  type: "PERSON" | "HABIT" | "PROJECT" | "GOAL" | "DREAM" | "CUSTOM";
}

export function extractMentions(content: string) {
  const mentions: { type: EntityType; name: string }[] = [];
  const personRegex = /@([\w\u00C0-\u024F]+)/g;
  const projectRegex = /#([\w\u00C0-\u024F]+)/g;
  const habitRegex = /(?<!\*)\*(?!\*)(?!\s)([\w\u00C0-\u024F]+)/g;

  let match;
  while ((match = personRegex.exec(content)) !== null) {
    mentions.push({ type: "person", name: match[1] });
  }
  while ((match = projectRegex.exec(content)) !== null) {
    mentions.push({ type: "project", name: match[1] });
  }
  while ((match = habitRegex.exec(content)) !== null) {
    mentions.push({ type: "habit", name: match[1] });
  }
  return mentions;
}

/**
 * Extract ONLY valid mentions that have been created as entities
 * This prevents arbitrary text like "@anything" from being treated as mentions
 */
export function extractValidMentions(content: string, entities: Entity[]) {
  const mentions: { type: EntityType; name: string }[] = [];
  
  // Create maps for quick lookup
  const personMap = new Map(entities.filter(e => e.type === "PERSON").map(e => [e.name.toLowerCase(), "person"]));
  const projectMap = new Map(entities.filter(e => e.type === "PROJECT").map(e => [e.name.toLowerCase(), "project"]));
  const habitMap = new Map(entities.filter(e => e.type === "HABIT").map(e => [e.name.toLowerCase(), "habit"]));

  // Extract and validate
  const personRegex = /@([\w\u00C0-\u024F]+)/g;
  const projectRegex = /#([\w\u00C0-\u024F]+)/g;
  const habitRegex = /(?<!\*)\*(?!\*)(?!\s)([\w\u00C0-\u024F]+)/g;

  let match;
  while ((match = personRegex.exec(content)) !== null) {
    if (personMap.has(match[1].toLowerCase())) {
      mentions.push({ type: "person", name: match[1] });
    }
  }
  while ((match = projectRegex.exec(content)) !== null) {
    if (projectMap.has(match[1].toLowerCase())) {
      mentions.push({ type: "project", name: match[1] });
    }
  }
  while ((match = habitRegex.exec(content)) !== null) {
    if (habitMap.has(match[1].toLowerCase())) {
      mentions.push({ type: "habit", name: match[1] });
    }
  }
  return mentions;
}
