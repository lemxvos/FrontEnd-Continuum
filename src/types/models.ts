/**
 * TIPOS DO CONTINUUM
 * 
 * REGRA DE OURO:
 * - Esses tipos são O CONTRATO com o backend
 * - Frontend NÃO calcula, transforma, ou infere nada
 * - Apenas recebe e exibe dados já processados
 */

// ════════════════════════════════════════════════════════════════
// ENTIDADES (Entity)
// ════════════════════════════════════════════════════════════════

export type EntityType = 
  | "person" 
  | "project" 
  | "habit" 
  | "goal" 
  | "dream" 
  | "event" 
  | "custom";

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  icon?: string;
  color?: string;
  
  // Opcional: metadados descritivos (NÃO para cálculos)
  description?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ════════════════════════════════════════════════════════════════
// NOTAS (Journal)
// ════════════════════════════════════════════════════════════════

/**
 * Quando o backend processa uma nota:
 * 1. Identifica menções {type:id}
 * 2. Busca a Entity correspondente
 * 3. Retorna com array `entities` JÁ RESOLVIDO
 * 
 * O frontend recebe tudo pronto. Não faz parsing!
 */
export interface Note {
  id: string;
  title: string;
  content: string; // Markdown com menções {type:id} literais
  folderPath: string; // ex: "vida/amigos/emilly"
  
  // Entidades JÁ extraídas e validadas pelo backend
  entities: Entity[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload CRIAÇÃO DE NOTA
 * O frontend envia assim (backend valida tudo)
 */
export interface CreateNotePayload {
  title: string;
  content: string; // Com menções {type:id} literais
  folderPath: string;
}

/**
 * Payload ATUALIZAÇÃO DE NOTA
 * Envia a nota inteira de novo
 */
export interface UpdateNotePayload {
  title: string;
  content: string;
  folderPath: string;
}

// ════════════════════════════════════════════════════════════════
// PASTAS (Folder)
// ════════════════════════════════════════════════════════════════

export interface Folder {
  path: string; // "vida/amigos"
  name: string; // "amigos"
  depth: number; // Nível de hierarquia
  notesCount: number;
}

// ════════════════════════════════════════════════════════════════
// BUSCA/FILTER
// ════════════════════════════════════════════════════════════════

export interface SearchFilters {
  query?: string;
  entity?: string; // ID da entidade
  folderPath?: string;
  dateRange?: {
    from: string; // ISO date
    to: string;
  };
}

export interface SearchResult {
  notes: Note[];
  total: number;
}

// ════════════════════════════════════════════════════════════════
// API RESPONSES (Envelope)
// ════════════════════════════════════════════════════════════════

/**
 * Resposta padrão da API
 * Tudo vem dentro de {data, error}
 */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  timestamp: string;
}

// ════════════════════════════════════════════════════════════════
// PAGINAÇÃO
// ════════════════════════════════════════════════════════════════

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

// ════════════════════════════════════════════════════════════════
// STATS (Só para display, backend é fonte de verdade)
// ════════════════════════════════════════════════════════════════

export interface EntityStats {
  entityId: string;
  name: string;
  type: EntityType;
  
  // Contadores LIDOS do backend (NÃO calculados!)
  mentionCount: number;
  lastMentionedAt: string;
  firstMentionedAt: string;
  
  // Coocorrências CALCULADAS pelo backend
  relatedEntities: Array<{
    entityId: string;
    name: string;
    coocurrenceCount: number;
  }>;
}
