/**
 * HOOK: useMentions
 * 
 * Helpers para trabalhar com menções no frontend
 * 
 * REGRA DE OURO:
 * - Não parseia menções (isso é backend)
 * - Não valida menções (isso é backend)
 * - Apenas FORMATA menções corretamente: {type:id}
 * - Não tenta entender se existe ou se é válido
 */

import { useMemo } from "react";

interface MentionToken {
  type: "text" | "mention";
  value: string;
  entity?: {
    type: string;
    id: string;
  };
}

/**
 * Hook para tokenizar um texto com menções
 * 
 * ENTRADA: "Saí com {person:ent_8f2a} e foi legal"
 * SAÍDA: [
 *   { type: "text", value: "Saí com " },
 *   { type: "mention", value: "{person:ent_8f2a}", entity: { type: "person", id: "ent_8f2a" } },
 *   { type: "text", value: " e foi legal" }
 * ]
 * 
 * Usado por: Componentes que renderizam conteúdo com menções
 */
export function useMentionTokens(content: string): MentionToken[] {
  return useMemo(() => {
    const regex = /\{([a-z_]+):([a-zA-Z0-9_]+)\}/g;
    const tokens: MentionToken[] = [];
    let lastIndex = 0;

    let match;
    while ((match = regex.exec(content)) !== null) {
      // Adiciona texto antes da menção
      if (match.index > lastIndex) {
        tokens.push({
          type: "text",
          value: content.substring(lastIndex, match.index),
        });
      }

      // Adiciona a menção
      const [fullMatch, entityType, entityId] = match;
      tokens.push({
        type: "mention",
        value: fullMatch,
        entity: {
          type: entityType,
          id: entityId,
        },
      });

      lastIndex = regex.lastIndex;
    }

    // Adiciona texto restante
    if (lastIndex < content.length) {
      tokens.push({
        type: "text",
        value: content.substring(lastIndex),
      });
    }

    return tokens;
  }, [content]);
}

/**
 * Hook que retorna array de menciones extraídas
 * 
 * ENTRADA: "Saí com {person:ent_8f2a} e {person:ent_91ab}"
 * SAÍDA: [
 *   { type: "person", id: "ent_8f2a" },
 *   { type: "person", id: "ent_91ab" }
 * ]
 * 
 * IMPORTANTE: Apenas extrai o padrão, não valida nada!
 */
export function useMentionedEntityReferences(content: string) {
  return useMemo(() => {
    const regex = /\{([a-z_]+):([a-zA-Z0-9_]+)\}/g;
    const mentions: Array<{ type: string; id: string }> = [];

    let match;
    while ((match = regex.exec(content)) !== null) {
      const [, entityType, entityId] = match;
      mentions.push({
        type: entityType,
        id: entityId,
      });
    }

    return mentions;
  }, [content]);
}

/**
 * Helper: Formata uma menção corretamente
 * 
 * INPUT: type="person", id="ent_8f2a"
 * OUTPUT: "{person:ent_8f2a}"
 */
export function formatMention(type: string, id: string): string {
  return `{${type.toLowerCase()}:${id}}`;
}

/**
 * Helper: Insere uma menção em um ponto específico do texto
 * 
 * ENTRADA:
 * - text: "Saí com "
 * - position: 8
 * - type: "person"
 * - id: "ent_8f2a"
 * 
 * SAÍDA: "Saí com {person:ent_8f2a}"
 */
export function insertMentionAtPosition(
  text: string,
  position: number,
  type: string,
  id: string
): string {
  const mention = formatMention(type, id);
  return text.slice(0, position) + mention + text.slice(position);
}

/**
 * Helper: Valida se uma string é uma menção válida
 * 
 * Apenas verifica o FORMATO, não se existe no backend!
 * 
 * "{person:ent_8f2a}" → true
 * "{habit:ent_123}" → true
 * "not a mention" → false
 */
export function isValidMentionFormat(text: string): boolean {
  const regex = /^\{[a-z_]+:[a-zA-Z0-9_]+\}$/;
  return regex.test(text);
}

/**
 * Hook: Conta menções no texto (apenas contagem, sem significado semântico)
 * 
 * Usado para:
 * - Mostrar "X mentões" em um preview
 * - Nada de cálculos de índice ou relevância!
 */
export function useMentionCount(content: string): number {
  return useMemo(() => {
    const regex = /\{[a-z_]+:[a-zA-Z0-9_]+\}/g;
    const matches = content.match(regex);
    return matches ? matches.length : 0;
  }, [content]);
}

/**
 * Interface esperada pelo hook de autocomplete
 */
export interface AutocompleteMention {
  trigger: "@" | "{"; // @ para pessoas, { para qualquer coisa
  query: string;
  position: number;
}

/**
 * Hook: Detecta se o usuário está digitando uma menção
 * 
 * Procura pelo padrão: "Olá @jo" ou "Saí com {pe"
 * 
 * Retorna null se não está digitando menção
 * Retorna { trigger, query, position } se está
 */
export function useMentionAutocompleteState(
  text: string,
  cursorPosition: number
): AutocompleteMention | null {
  return useMemo(() => {
    if (cursorPosition === 0) return null;

    // Busca '@' ou '{' para trás a partir do cursor
    for (let i = cursorPosition - 1; i >= 0; i--) {
      const char = text[i];

      // Se encontrou @, é início de menção de person direto
      if (char === "@" && (i === 0 || text[i - 1] === " " || text[i - 1] === "\n")) {
        const query = text.slice(i + 1, cursorPosition).trim();
        return {
          trigger: "@",
          query,
          position: i,
        };
      }

      // Se encontrou { dentro de parênteses (type:...)
      if (char === "{") {
        // Verifica se está bem-formado: {type:...
        const closing = text.indexOf("}", i);
        if (closing === -1 || closing > cursorPosition) {
          const query = text.slice(i + 1, cursorPosition).trim();
          return {
            trigger: "{",
            query,
            position: i,
          };
        }
      }

      // Para se encontrar espaço ou quebra de linha antes de @ ou {
      if ((char === " " || char === "\n") && 
          (text[i + 1] !== "@" && text[i + 1] !== "{")) {
        break;
      }
    }

    return null;
  }, [text, cursorPosition]);
}
