import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Save, Eye, Edit3, Loader2 } from "lucide-react";
import MentionTag, { extractEntityMentions } from "@/components/MentionTag";
import MentionInput from "@/components/MentionInput";
import UpgradeModal from "@/components/UpgradeModal";

interface Entity {
  id: string;
  name: string;
  type: "PERSON" | "HABIT" | "PROJECT" | "GOAL" | "DREAM" | "CUSTOM";
}

function renderMarkdown(text: string | undefined | null): string {
  if (!text) return "<p class=\"text-muted-foreground\">Nada para preview...</p>";
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-4 mb-1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\{\{entity:([^}]+)\}\}/g, '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">📌</span>')
    .replace(/\n/g, "<br/>");
}

export default function JournalEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";

  const [title, setTitle] = useState(() =>
    isNew ? localStorage.getItem("continuum_draft_title") || "" : ""
  );
  const [content, setContent] = useState(() =>
    isNew ? localStorage.getItem("continuum_draft") || "" : ""
  );
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [entities, setEntities] = useState<Entity[]>([]);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!isNew && id) {
      api.get(`/api/notes/${id}`)
        .then(({ data }) => {
          // Load content and title as-is from backend
          setTitle(data.title || "");
          setContent(data.content);
        })
        .catch((err) => {
          toast.error(err.response?.data?.message || "Erro");
          navigate("/journal");
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Load entities for mention suggestions (only for autocomplete UI)
  useEffect(() => {
    const loadEntities = async () => {
      try {
        const [people, habits, projects] = await Promise.all([
          api.get("/api/entities?type=PERSON").then(({ data }) => data || []),
          api.get("/api/entities?type=HABIT").then(({ data }) => data || []),
          api.get("/api/entities?type=PROJECT").then(({ data }) => data || []),
        ]);
        setEntities([...people, ...habits, ...projects]);
      } catch (err) {
        console.error("Erro ao carregar entidades:", err);
      }
    };
    loadEntities();
  }, []);

  // Auto-save every 30s
  useEffect(() => {
    if (isNew) {
      localStorage.setItem("continuum_draft", content);
      localStorage.setItem("continuum_draft_title", title);
    }
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    if (!isNew && content.trim()) {
      autoSaveRef.current = setTimeout(() => handleSave(true), 30000);
    }
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [content, title]);

  const handleSave = async (silent = false) => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      // Send title and content as-is to backend
      // Backend is responsible for extracting {{entity:id}} mentions
      if (isNew) {
        const { data: entry } = await api.post("/api/notes", { title, content });
        localStorage.removeItem("continuum_draft");
        localStorage.removeItem("continuum_draft_title");
        if (!silent) toast.success("Entrada criada!");
        navigate(`/journal/${entry.id}`, { replace: true });
      } else {
        await api.put(`/api/notes/${id}`, { title, content });
        if (!silent) toast.success("Entrada salva!");
      }
    } catch (err: any) {
      if (err.response?.status === 403 || err.response?.status === 400) {
        setUpgradeOpen(true);
      } else {
        toast.error(err.response?.data?.message || "Erro ao salvar");
      }
    } finally {
      setSaving(false);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const mentionedEntityIds = extractEntityMentions(content);

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate("/journal")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPreview(!preview)}
            className={preview ? "text-primary" : ""}
          >
            {preview ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button onClick={() => handleSave(false)} disabled={saving || !content.trim()} className="gap-1">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar
          </Button>
        </div>
      </div>

      {/* Title input */}
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título (opcional)"
        className="text-lg font-semibold"
      />

      {preview ? (
        <div className="surface rounded-xl p-6 min-h-[400px]">
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content || "Nada para preview...") }}
          />
        </div>
      ) : (
        <MentionInput
          value={content}
          onChange={setContent}
          placeholder="Escreva sobre seu dia... Digite @, #, ou * para ver sugestões de entidades criadas."
          minHeight="min-h-[400px]"
          className="font-mono text-sm"
        />
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <div className="flex items-center gap-3">
          <span>{wordCount} palavras</span>
          <span>{charCount} caracteres</span>
        </div>
      </div>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}
