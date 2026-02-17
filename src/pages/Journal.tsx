import { useState, useEffect, useMemo } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Plus, BookOpen, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import JournalCard, { groupByDate } from "@/components/JournalCard";
import LimitBanner from "@/components/LimitBanner";
import UpgradeModal from "@/components/UpgradeModal";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface JournalEntry {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  deleted?: boolean;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<JournalEntry | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/journal")
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data.entries || [];
        setEntries(list);
      })
      .catch((err) => {
        if (err.response?.status === 403) setUpgradeOpen(true);
        else toast.error(err.response?.data?.message || "Erro ao carregar");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/journal/${deleteTarget.id}`);
      setEntries((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      toast.success("Entrada excluída!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro");
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter((e) => e.content.toLowerCase().includes(q));
  }, [entries, searchQuery]);

  const groups = useMemo(() => groupByDate(filteredEntries), [filteredEntries]);

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Journal</h2>
        </div>
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Journal</h2>
        <Button onClick={() => navigate("/journal/new")} className="gap-1">
          <Plus className="h-4 w-4" />
          Nova entrada
        </Button>
      </div>

      <LimitBanner current={entries.length} max={30} label="entradas" />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar entradas..."
          className="pl-10"
        />
      </div>

      {filteredEntries.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="surface rounded-xl p-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">Nenhuma entrada ainda</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Comece escrevendo sobre seu dia. Use @pessoa, #projeto e *hábito para criar conexões.
          </p>
          <Button onClick={() => navigate("/journal/new")} className="gap-1">
            <Plus className="h-4 w-4" />
            Primeira entrada
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                {group.label}
              </h3>
              <div className="space-y-2">
                {group.entries.map((entry, i) => (
                  <JournalCard
                    key={entry.id}
                    entry={entry}
                    index={i}
                    onClick={() => navigate(`/journal/${entry.id}`)}
                    onDelete={() => setDeleteTarget(entry)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir entrada</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}
