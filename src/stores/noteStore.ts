/**
 * NOTE STORE
 * 
 * Gerencia o estado das notas (Journal) do usuário
 * 
 * REGRA: Store é APENAS cache do backend
 * Nunca parseia menções, nunca valida tipos
 */

import { create } from "zustand";
import { Note, CreateNotePayload, UpdateNotePayload, PaginatedResponse } from "@/types/models";
import { noteService } from "@/services/noteService";

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

interface NoteState {
  // Cache de notas
  notes: Note[];
  isLoading: boolean;
  error: string | null;

  // Paginação
  pagination: PaginationState;

  // Folder atual (para filtro)
  currentFolder: string | null;

  // Nota sendo editada
  currentNote: Note | null;

  // Ações
  fetchList: (options?: {
    page?: number;
    pageSize?: number;
    folderPath?: string;
  }) => Promise<void>;

  fetchOne: (id: string) => Promise<void>;

  search: (options: {
    entityId?: string;
    folderPath?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => Promise<void>;

  create: (payload: CreateNotePayload) => Promise<Note>;
  update: (id: string, payload: UpdateNotePayload) => Promise<Note>;
  delete: (id: string) => Promise<void>;

  setCurrentFolder: (folder: string | null) => void;
  setCurrentNote: (note: Note | null) => void;
  reset: () => void;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    hasMore: false,
  },
  currentFolder: null,
  currentNote: null,

  /**
   * Carrega lista de notas com paginação
   */
  fetchList: async (options) => {
    set({ isLoading: true, error: null });
    try {
      const result = await noteService.list({
        page: options?.page ?? 1,
        pageSize: options?.pageSize ?? 20,
        folderPath: options?.folderPath,
      });

      set({
        notes: result.items,
        pagination: {
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
          hasMore: result.hasMore,
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Erro ao carregar notas",
        isLoading: false,
      });
    }
  },

  /**
   * Carrega uma nota específica
   */
  fetchOne: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const note = await noteService.getOne(id);
      set({
        currentNote: note,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Erro ao carregar nota",
        isLoading: false,
      });
    }
  },

  /**
   * Busca notas por critérios
   */
  search: async (options) => {
    set({ isLoading: true, error: null });
    try {
      const notes = await noteService.search(options);
      set({
        notes,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Erro ao buscar notas",
        isLoading: false,
      });
    }
  },

  /**
   * Criar nota
   * 
   * IMPORTANTE:
   * - Frontend ENVIA: { title, content "{type:id}", folderPath }
   * - Backend RECEBE: parseia menções e retorna com entities[]
   * - Store RECEBE: nota completa com entities já resolvidas
   */
  create: async (payload) => {
    try {
      const newNote = await noteService.create(payload);
      set((state) => ({
        notes: [newNote, ...state.notes],
      }));
      return newNote;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * Atualizar nota
   * 
   * IMPORTANTE:
   * - Envia a nota INTEIRA novamente
   * - Backend recalcula menções e entities[]
   * - Store sincroniza no cache
   */
  update: async (id: string, payload) => {
    try {
      const updated = await noteService.update(id, payload);
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? updated : n)),
        currentNote: state.currentNote?.id === id ? updated : state.currentNote,
      }));
      return updated;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * Deletar nota
   */
  delete: async (id: string) => {
    try {
      await noteService.delete(id);
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        currentNote: state.currentNote?.id === id ? null : state.currentNote,
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * Mudar pasta atual (para filtro)
   */
  setCurrentFolder: (folder: string | null) => {
    set({ currentFolder: folder });
  },

  /**
   * Mudar nota sendo editada
   */
  setCurrentNote: (note: Note | null) => {
    set({ currentNote: note });
  },

  /**
   * Limpar cache e estado
   */
  reset: () => {
    set({
      notes: [],
      isLoading: false,
      error: null,
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0,
        hasMore: false,
      },
      currentFolder: null,
      currentNote: null,
    });
  },
}));
