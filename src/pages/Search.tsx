import { useState } from "react";
import api from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Search as SearchIcon, Users, FolderKanban, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface SearchResult {
  type: string;
  id: string;
  name: string;
  mentions: number;
}

const typeConfig: Record<string, { icon: any; colorClass: string }> = {
  person: { icon: Users, colorClass: "text-entity-person bg-entity-person/10" },
  project: { icon: FolderKanban, colorClass: "text-entity-project bg-entity-project/10" },
  habit: { icon: Target, colorClass: "text-entity-habit bg-entity-habit/10" },
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ q: query });
      if (type) params.set("type", type);
      const { data } = await api.get(`/api/connections/search?${params}`);
      setResults(data.results || data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">Search</h2>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} placeholder="Buscar pessoas, projetos, hábitos..." className="pl-10" />
        </div>
        <Button onClick={handleSearch} disabled={loading}>Buscar</Button>
      </div>

      <div className="flex gap-1.5">
        {[{ v: "", l: "Todos" }, { v: "person", l: "Pessoas" }, { v: "project", l: "Projetos" }, { v: "habit", l: "Hábitos" }].map((f) => (
          <button key={f.v} onClick={() => setType(f.v)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${type === f.v ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground hover:text-foreground"}`}>{f.l}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
      ) : results.length > 0 ? (
        <div className="space-y-1">
          {results.map((r, i) => {
            const config = typeConfig[r.type] || typeConfig.person;
            const Icon = config.icon;
            return (
              <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} onClick={() => navigate(`/entities/${r.id}`)} className="surface rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-[hsl(var(--surface-2))] transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${config.colorClass}`}><Icon className="h-3.5 w-3.5" /></div>
                  <span className="text-sm font-medium">{r.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{r.mentions}</span>
              </motion.div>
            );
          })}
        </div>
      ) : searched ? (
        <div className="surface rounded-xl p-12 text-center">
          <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum resultado</p>
        </div>
      ) : null}
    </div>
  );
}
