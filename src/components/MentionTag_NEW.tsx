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

const typeMap: Record<string, EntityType> = {
  PERSON: "person",
  HABIT: "habit",
  PROJECT: "project",
  GOAL: "goal",
  DREAM: "dream",
  CUSTOM: "person",
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

/**
 * Extract mentions in format {TYPE:name} from content
 * E.g. {PERSON:João}, {PROJECT:Continuum}, {HABIT:Meditação}
 */
export function extractMentions(content: string) {
  const mentions: { type: EntityType; name: string }[] = [];
  
  // Match format: {type:name} where type is PERSON, HABIT, PROJECT, etc
  const formatRegex = /\{(PERSON|HABIT|PROJECT|GOAL|DREAM|CUSTOM):([^}]+)\}/g;
  
  let match;
  while ((match = formatRegex.exec(content)) !== null) {
    const entityType = typeMap[match[1]];
    if (entityType) {
      mentions.push({ type: entityType, name: match[2] });
    }
  }
  
  return mentions;
}

/**
 * Convert @ # * shortcuts to {TYPE:name} format for storage
 * This runs when saving to normalize shortcuts to standard format
 */
export function normalizeShortcuts(content: string, entities: Entity[]): string {
  if (!content) return content;

  const personMap = new Map(entities.filter(e => e.type === "PERSON").map(e => [e.name.toLowerCase(), `{PERSON:${e.name}}`]));
  const projectMap = new Map(entities.filter(e => e.type === "PROJECT").map(e => [e.name.toLowerCase(), `{PROJECT:${e.name}}`]));
  const habitMap = new Map(entities.filter(e => e.type === "HABIT").map(e => [e.name.toLowerCase(), `{HABIT:${e.name}}`]));

  let result = content;
  
  // Replace @name shortcuts with {PERSON:name}
  result = result.replace(/@([\w\u00C0-\u024F]+)/g, (match, name) => {
    if (personMap.has(name.toLowerCase())) {
      return personMap.get(name.toLowerCase())!;
    }
    return ""; // Remove invalid mentions
  });

  // Replace #name shortcuts with {PROJECT:name}
  result = result.replace(/#([\w\u00C0-\u024F]+)/g, (match, name) => {
    if (projectMap.has(name.toLowerCase())) {
      return projectMap.get(name.toLowerCase())!;
    }
    return ""; // Remove invalid mentions
  });

  // Replace *name shortcuts with {HABIT:name}
  result = result.replace(/(?<!\*)\*(?!\*)(?!\s)([\w\u00C0-\u024F]+)/g, (match, name) => {
    if (habitMap.has(name.toLowerCase())) {
      return habitMap.get(name.toLowerCase())!;
    }
    return ""; // Remove invalid mentions
  });

  return result;
}

/**
 * Convert {TYPE:name} format to visual shortcuts for editing
 * Uses @ # * for display/editing
 */
export function denormalizeToShortcuts(content: string): string {
  if (!content) return content;
  
  return content
    .replace(/\{PERSON:([^}]+)\}/g, "@$1")
    .replace(/\{PROJECT:([^}]+)\}/g, "#$1")
    .replace(/\{HABIT:([^}]+)\}/g, "*$1");
}
