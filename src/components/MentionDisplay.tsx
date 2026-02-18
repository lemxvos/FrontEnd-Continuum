/**
 * MENTION DISPLAY
 *
 * Renderiza menções em um texto
 *
 * ENTRADA:
 * - content: "Saí com {person:ent_8f2a} e {project:ent_91ab}"
 * - entities: [{ id: "ent_8f2a", name: "Emilly", icon: "👩" }, ...]
 *
 * SAÍDA:
 * "Saí com [👩 Emilly] e [📊 Projeto X]"
 *
 * REGRA:
 * - Recebe entidades JÁ PROCESSADAS pelo backend
 * - Apenas renderiza como chips/badges
 * - Totalmente determinístico
 */

import { useMentionTokens } from "@/hooks/useMentions";
import { Entity } from "@/types/models";
import { EntityBadge } from "./EntityBadge";

interface MentionDisplayProps {
  content: string;
  entities: Entity[];
  className?: string;
  onEntityClick?: (entity: Entity) => void;
}

export function MentionDisplay({
  content,
  entities,
  className = "",
  onEntityClick,
}: MentionDisplayProps) {
  const tokens = useMentionTokens(content);

  // Map para buscar entidades por seu reference {type:id}
  const entityMap = new Map(
    entities.map((e) => [`${e.type}:${e.id}`, e])
  );

  return (
    <div className={`prose prose-sm max-w-none break-words ${className}`}>
      {tokens.map((token, idx) => {
        if (token.type === "text") {
          return (
            <span key={idx} className="whitespace-pre-wrap">
              {token.value}
            </span>
          );
        }

        // É uma menção
        if (token.entity) {
          const key = `${token.entity.type}:${token.entity.id}`;
          const entity = entityMap.get(key);

          // Se não encontrou a entidade, apenas mostra o raw mention
          if (!entity) {
            return <span key={idx} className="text-gray-400">{token.value}</span>;
          }

          // Renderiza como badge
          return (
            <EntityBadge
              key={idx}
              entity={entity}
              onClick={() => onEntityClick?.(entity)}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
