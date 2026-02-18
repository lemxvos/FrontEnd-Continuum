/**
 * ENTITY STORE
 * 
 * Gerencia o estado das entidades do usuário
 * 
 * REGRA: Store é APENAS cache do backend
 * Nunca calcula, nunca infere
 */

import { create } from "zustand";
import { Entity, EntityType } from "@/types/models";
import { entityService } from "@/services/entityService";

interface EntityState {
  // Cache de entidades
  entities: Entity[];
  isLoading: boolean;
  error: string | null;

  // Últimas buscas (para autocomplete)
  lastSearchQuery: string;
  lastSearchResults: Entity[];

  // Ações
  fetch: () => Promise<void>;
  fetchByType: (type: EntityType) => Promise<Entity[]>;
  search: (query: string, type?: EntityType) => Promise<Entity[]>;
  create: (payload: Parameters<typeof entityService.create>[0]) => Promise<Entity>;
  update: (id: string, payload: Parameters<typeof entityService.update>[1]) => Promise<Entity>;
  delete: (id: string) => Promise<void>;
  getOne: (id: string) => Entity | undefined;
  reset: () => void;
}

export const useEntityStore = create<EntityState>((set, get) => ({
  entities: [],
  isLoading: false,
  error: null,
  lastSearchQuery: "",
  lastSearchResults: [],

  /**
   * Carrega TODAS as entidades
   * Guardas em cache local
   */
  fetch: async () => {
    set({ isLoading: true, error: null });
    try {
      const entities = await entityService.listAll();
      set({ entities, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Erro ao carregar entidades",
        isLoading: false,
      });
    }
  },

  /**
   * Busca entidades de um tipo específico
   * Não muta state, apenas retorna
   */
  fetchByType: async (type: EntityType) => {
    try {
      return await entityService.listByType(type);
    } catch (error: any) {
      set({ error: error.message });
      return [];
    }
  },

  /**
   * Autocomplete de entidades
   * Útil para o componente EntitySelector
   */
  search: async (query: string, type?: EntityType) => {
    if (!query.trim()) {
      set({ lastSearchResults: [], lastSearchQuery: "" });
      return [];
    }

    try {
      const results = await entityService.autocomplete(query, { type });
      set({ lastSearchResults: results, lastSearchQuery: query });
      return results;
    } catch (error: any) {
      set({ error: error.message });
      return [];
    }
  },

  /**
   * Criar nova entidade
   * Adiciona ao cache local
   */
  create: async (payload) => {
    try {
      const newEntity = await entityService.create(payload);
      set((state) => ({
        entities: [...state.entities, newEntity],
      }));
      return newEntity;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * Atualizar entidade
   * Sincroniza no cache
   */
  update: async (id: string, payload) => {
    try {
      const updated = await entityService.update(id, payload);
      set((state) => ({
        entities: state.entities.map((e) => (e.id === id ? updated : e)),
      }));
      return updated;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * Deletar entidade
   * Remove do cache local
   */
  delete: async (id: string) => {
    try {
      await entityService.delete(id);
      set((state) => ({
        entities: state.entities.filter((e) => e.id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * Buscar entidade por ID no cache local
   * Se não encontrar, retorna undefined
   */
  getOne: (id: string) => {
    return get().entities.find((e) => e.id === id);
  },

  /**
   * Limpar cache e estado
   */
  reset: () => {
    set({
      entities: [],
      isLoading: false,
      error: null,
      lastSearchQuery: "",
      lastSearchResults: [],
    });
  },
}));
