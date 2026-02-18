/**
 * NOTE SERVICE
 * 
 * Contrato com o backend para operações de NOTAS (Journal)
 * 
 * REGRA: Apenas HTTP, sem transformações locais!
 */

import api from "@/lib/axios";
import { Note, CreateNotePayload, UpdateNotePayload, PaginatedResponse } from "@/types/models";

export const noteService = {
  /**
   * Criar nova nota
   * 
   * POST /api/notes
   * Body: { title, content, folderPath }
   * 
   * Backend faz:
   * - Parseia menções {type:id}
   * - Valida cada uma
   * - Retorna array entities
   */
  async create(payload: CreateNotePayload): Promise<Note> {
    const response = await api.post<Note>("/api/notes", payload);
    return response.data;
  },

  /**
   * Atualizar nota
   * 
   * PUT /api/notes/:id
   * Body: { title, content, folderPath }
   * 
   * Backend recalcula TUDO:
   * - Menções novas
   * - Menções removidas
   * - Atualiza índices
   */
  async update(id: string, payload: UpdateNotePayload): Promise<Note> {
    const response = await api.put<Note>(`/api/notes/${id}`, payload);
    return response.data;
  },

  /**
   * Deletar nota
   * 
   * DELETE /api/notes/:id
   * 
   * Backend cuida:
   * - Remove todas as menções
   * - Atualiza índices de entidades
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/api/notes/${id}`);
  },

  /**
   * Obter nota única
   * 
   * GET /api/notes/:id
   * 
   * Rqetorna nota com entities já resolvidas
   */
  async getOne(id: string): Promise<Note> {
    const response = await api.get<Note>(`/api/notes/${id}`);
    return response.data;
  },

  /**
   * Listar notas com paginação
   * 
   * GET /api/notes?page=1&pageSize=20&folderPath=vida/amigos
   * 
   * Query params:
   * - page: número da página (default 1)
   * - pageSize: itens por página (default 20)
   * - folderPath: filtrar por pasta (optional)
   * - query: buscar em title/content (optional)
   */
  async list(options?: {
    page?: number;
    pageSize?: number;
    folderPath?: string;
    query?: string;
  }): Promise<PaginatedResponse<Note>> {
    const response = await api.get<PaginatedResponse<Note>>("/api/notes", {
      params: {
        page: options?.page ?? 1,
        pageSize: options?.pageSize ?? 20,
        ...(options?.folderPath && { folderPath: options.folderPath }),
        ...(options?.query && { query: options.query }),
      },
    });
    return response.data;
  },

  /**
   * Buscar notas por míltiplos critérios
   * 
   * GET /api/notes/search
   * Query params:
   * - entityId: ID da entidade
   * - folderPath: caminho da pasta
   * - dateFrom: ISO date
   * - dateTo: ISO date
   */
  async search(options: {
    entityId?: string;
    folderPath?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Note[]> {
    const response = await api.get<Note[]>("/api/notes/search", {
      params: options,
    });
    return response.data;
  },

  /**
   * Listar pastas detectadas automaticamente
   * 
   * GET /api/notes/folders
   */
  async getFolders(): Promise<Array<{ path: string; name: string; count: number }>> {
    const response = await api.get<Array<{ path: string; name: string; count: number }>>(
      "/api/notes/folders"
    );
    return response.data;
  },
};
