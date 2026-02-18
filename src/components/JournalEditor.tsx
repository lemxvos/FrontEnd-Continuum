/**
 * JOURNAL EDITOR
 *
 * Editor de notas com suporte a menções
 *
 * FLUXO:
 * 1. Usuário digita conteúdo em textarea
 * 2. Detecta padrão {type ou @name
 * 3. Mostra autocomplete
 * 4. Seleciona entidade
 * 5. INSERE {type:id} no texto
 * 6. Ao salvar: envia content com menções ao backend
 * 7. Backend parseia, valida, retorna com entities[]
 * 8. Store sincroniza
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useMentionAutocompleteState,
  useMentionTokens,
  insertMentionAtPosition,
} from "@/hooks/useMentions";
import { MentionDisplay } from "./MentionDisplay";
import { EntitySelector } from "./EntitySelector";
import { useNoteStore } from "@/stores/noteStore";
import { useEntityStore } from "@/stores/entityStore";
import { Entity, CreateNotePayload, UpdateNotePayload, Note } from "@/types/models";
import { Loader2 } from "lucide-react";

interface JournalEditorProps {
  /**
   * Se é novo ou edição
   * Se undefined = novo
   * Se string = editando esse ID
   */
  noteId?: string;

  // Callback ao salvar com sucesso
  onSaveSuccess?: (note: Note) => void;

  // Callback ao cancelar
  onCancel?: () => void;

  // Pasta padrão para new notes
  defaultFolder?: string;
}

export function JournalEditor({
  noteId,
  onSaveSuccess,
  onCancel,
  defaultFolder = "inbox",
}: JournalEditorProps) {
  // State local do editor
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [folderPath, setFolderPath] = useState(defaultFolder);
  const [cursorPos, setCursorPos] = useState(0);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Stores
  const { create: createNote, update: updateNote, isLoading: notesLoading, currentNote } = useNoteStore();
  const { lastSearchResults: suggestedEntities } = useEntityStore();

  // Carrega nota se é edit mode
  useEffect(() => {
    if (noteId) {
      const note = currentNote;
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setFolderPath(note.folderPath);
      }
    }
  }, [noteId, currentNote]);

  // Detecta se está digitando menção
  const mentionState = useMentionAutocompleteState(content, cursorPos);

  // Hook: Tokeniza menções para preview
  const tokens = useMentionTokens(content);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setCursorPos(e.target.selectionStart);
  };

  const handleSelectionChange = () => {
    if (textareaRef.current) {
      setCursorPos(textareaRef.current.selectionStart);
    }
  };

  /**
   * Quando usuário seleciona uma entidade do autocomplete
   *
   * IMPORTANTE:
   * - Insere {type:id} no texto
   * - NÃO valida nada
   * - Backend faz a validação ao receber
   */
  const handleEntitySelect = (entity: Entity) => {
    if (mentionState && textareaRef.current) {
      // Remove a query parcial e insere a menção completa
      const beforeMention = content.slice(0, mentionState.position + 1);
      const afterMention = content.slice(cursorPos);

      const fullMention = `${entity.type}:${entity.id}`;
      const newContent = `${beforeMention}${fullMention}${afterMention}`;

      setContent(newContent);
      setIsAutocompleteOpen(false);

      // Restaura foco no textarea
      setTimeout(() => {
        if (textareaRef.current) {
          const newPos = beforeMention.length + fullMention.length + 1; // +1 pra fechar chave
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newPos, newPos);
          setCursorPos(newPos);
        }
      }, 0);
    }
  };

  /**
   * Salva a nota
   */
  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Título e conteúdo são obrigatórios");
      return;
    }

    setIsSaving(true);
    try {
      let savedNote: Note;

      if (noteId) {
        // Edição
        const payload: UpdateNotePayload = {
          title,
          content,
          folderPath,
        };
        savedNote = await updateNote(noteId, payload);
      } else {
        // Criação
        const payload: CreateNotePayload = {
          title,
          content,
          folderPath,
        };
        savedNote = await createNote(payload);
      }

      onSaveSuccess?.(savedNote);
    } catch (error: any) {
      alert(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Se está carregando
  if (noteId && notesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Input
            placeholder="Título da nota"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-bold mb-2"
          />
          <Input
            placeholder="Caminho da pasta (ex: vida/amigos)"
            value={folderPath}
            onChange={(e) => setFolderPath(e.target.value)}
            className="text-sm text-gray-600"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      </div>

      {/* Tabs: Editor / Preview */}
      <Tabs defaultValue="editor" className="flex-1 flex flex-col">
        <TabsList>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            placeholder={
              "Escreva sua nota aqui. Use {type:id} para mencionar entidades.\nExemplo: Saí com {person:ent_8f2a}"
            }
            value={content}
            onChange={handleTextChange}
            onSelect={handleSelectionChange}
            onClick={handleSelectionChange}
            onKeyUp={handleSelectionChange}
            className="h-full font-mono text-sm"
          />

          {/* Autocomplete popup */}
          {mentionState && (
            <div className="absolute bottom-0 left-0 z-50">
              <EntitySelector
                isOpen={true}
                onOpenChange={setIsAutocompleteOpen}
                initialQuery={mentionState.query}
                onSelect={handleEntitySelect}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="preview" className="flex-1 overflow-auto">
          <div className="prose prose-sm max-w-none p-4">
            <h1>{title}</h1>
            <p className="text-gray-500 text-sm">📁 {folderPath}</p>
            <hr />
            {/*
              IMPORTANTE:
              - Se a nota foi salva, `currentNote.entities` vem do backend
              - Se não foi salva, entities pode estar vazio
              - Mostra o raw text com menções de forma legível
            */}
            <MentionDisplay
              content={content}
              entities={currentNote?.entities || []}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Status info */}
      {mentionState && (
        <div className="text-sm text-gray-500 px-4">
          💡 Digitando menção: {mentionState.trigger}{mentionState.query}
        </div>
      )}
    </div>
  );
}
