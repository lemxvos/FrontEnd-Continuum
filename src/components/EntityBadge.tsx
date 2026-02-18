/**
 * ENTITY BADGE
 * 
 * Renderiza uma entidade como badge/chip
 * 
 * REGRA: Recebe a Entity já processada, apenas exibe
 */

import { Entity } from "@/types/models";
import { Badge } from "@/components/ui/badge";

interface EntityBadgeProps {
  entity: Entity;
  variant?: "default" | "secondary" | "outline";
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}

export function EntityBadge({
  entity,
  variant = "secondary",
  onClick,
  removable = false,
  onRemove,
}: EntityBadgeProps) {
  const displayText = `${entity.icon || "📌"} ${entity.name}`;

  return (\n    <Badge\n      variant={variant}\n      onClick={onClick}\n      className=\"cursor-pointer gap-1 px-3 py-1.5\"\n      style={{\n        backgroundColor: entity.color || undefined,\n        // Se tem cor, o texto fica branco\n        color: entity.color ? \"white\" : undefined,\n      }}\n    >\n      <span>{displayText}</span>\n      {removable && (\n        <button\n          onClick={(e) => {\n            e.stopPropagation();\n            onRemove?.();\n          }}\n          className=\"ml-1 hover:opacity-70\"\n        >\n          ✕\n        </button>\n      )}\n    </Badge>\n  );\n}\n