/**
 * ENTITY SERVICE
 * 
 * Contrato com o backend para operações de ENTIDADES
 * 
 * REGRA: Apenas HTTP, sem lógica de validação local!
 */

import api from "@/lib/axios";
import { Entity, EntityType, EntityStats } from "@/types/models";

export interface CreateEntityPayload {
  type: EntityType;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
}

export interface UpdateEntityPayload {
  name?: string;
  icon?: string;
  color?: string;
  description?: string;
}

export const entityService = {
  /**
   * Criar nova entidade
   * 
   * POST /api/entities
   * Body: { type, name, icon?, color?, description? }
   * 
   * Backend valida:
   * - type é válido
   * - name não é duplicado (opcional)
   * - estrutura correta
   */
  async create(payload: CreateEntityPayload): Promise<Entity> {
    const response = await api.post<Entity>("/api/entities", payload);
    return response.data;
  },

  /**
   * Atualizar entidade
   * 
   * PATCH /api/entities/:id
   * Body: { name?, icon?, color?, description? }
   * 
   * Backend atualiza metadata da entidade
   * (NOT: não recalcula índices, isso é automático)
   */
  async update(id: string, payload: UpdateEntityPayload): Promise<Entity> {
    const response = await api.patch<Entity>(`/api/entities/${id}`, payload);
    return response.data;
  },

  /**
   * Deletar entidade
   * 
   * DELETE /api/entities/:id
   * 
   * Comportamento:
   * - Remove a entidade
   * - Opcionalmente: remove todas as menções ou deixa orfã?
   *   (Isso deve ser documentado no backend)
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/api/entities/${id}`);
  },

  /**
   * Obter entidade única
   * 
   * GET /api/entities/:id
   */
  async getOne(id: string): Promise<Entity> {
    const response = await api.get<Entity>(`/api/entities/${id}`);
    return response.data;
  },

  /**
   * Listar TODAS as entidades do usuário
   * 
   * GET /api/entities
   * Query params (optional):
   * - type: filtrar por tipo (person, project, etc)
   * - search: buscar por name
   * 
   * IMPORTANTE: Essa é a lista para AUTOCOMPLETE!
   * Frontend usa isso pra preencher o dropdown de menções
   */
  async listAll(options?: {
    type?: EntityType;
    search?: string;
  }): Promise<Entity[]> {
    const response = await api.get<Entity[]>("/api/entities", {
      params: {
        ...(options?.type && { type: options.type }),
        ...(options?.search && { search: options.search }),
      },
    });
    return response.data;
  },

  /**
   * Listar entidades de um tipo específico
   * 
   * GET /api/entities/type/:type
   * 
   * Exemplo: GET /api/entities/type/person
   */
  async listByType(type: EntityType): Promise<Entity[]> {
    const response = await api.get<Entity[]>(`/api/entities/type/${type}`);
    return response.data;
  },

  /**
   * Obter estatísticas de entidade
   * 
   * GET /api/entities/:id/stats
   * 
   * Retorna:
   * - Quantas vezes foi mencionada
   * - Quando foi última menção
   * - Entidades relacionadas (coocorrências)
   * 
   * IMPORTANTE: Esses dados vêm do backend!
   * Frontend NÃO calcula isso
   */
  async getStats(id: string): Promise<EntityStats> {
    const response = await api.get<EntityStats>(`/api/entities/${id}/stats`);
    return response.data;
  },

  /**
   * Validar se entidade existe
   * 
   * GET /api/entities/:id/exists
   * 
   * Retorna: { exists: boolean }
   * 
   * Usado por:
   * - Validação em tempo real de menções
   * - Antes de criar uma nova nota com menção
   */
  async exists(id: string): Promise<boolean> {
    try {
      const response = await api.get<{ exists: boolean }>(
        `/api/entities/${id}/exists`
      );
      return response.data.exists;
    } catch (error) {
      return false;
    }
  },

  /**
   * Autocomplete de entidades
   * 
   * GET /api/entities/search
   * Query params:
   * - q: query string (buscará em name)
   * - type: filtrar por tipo (optional)
   * - limit: máximo de resultados (default 10)
   * 
   * IMPORTANTE: Essa é a rota para o componente EntitySelector!
   * Usada em tempo real conforme o usuário digita
   */
  async autocomplete(query: string, options?: {
    type?: EntityType;
    limit?: number;
  }): Promise<Entity[]> {
    const response = await api.get<Entity[]>("/api/entities/search", {
      params: {
        q: query,
        ...(options?.type && { type: options.type }),
        limit: options?.limit ?? 10,
      },
    });
    return response.data;
  },
};
