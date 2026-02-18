import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { motion } from "framer-motion";
import { Users, FolderKanban, Target, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface TopEntity {
  type: string;
  id: string;
  name: string;
  mentions: number;
}

interface DashboardResponse {
  uniquePeople: number;
  uniqueProjects: number;
  uniqueHabits: number;
  totalMentions: number;
  topPeople: TopEntity[];
  topProjects: TopEntity[];
  topHabits: TopEntity[];
}

function StatCard({ icon: Icon, label, value, colorClass }: { icon: any; label: string; value: number; colorClass: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="surface rounded-xl p-5 flex items-center gap-4">
      <div className={`p-2.5 rounded-lg bg-accent ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
}

function TopList({ title, items, icon: Icon, colorClass }: { title: string; items: TopEntity[]; icon: any; colorClass: string }) {
  const navigate = useNavigate();
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="surface rounded-xl p-5">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum ainda</p>
      ) : (
        <ul className="space-y-1">
          {items.map((item) => (
            <li
              key={item.id}
              onClick={() => navigate(`/entities/${item.id}`)}
              className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-accent cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-3.5 w-3.5 ${colorClass}`} />
                <span className="text-sm">{item.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{item.mentions}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

export default function ConnectionsPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/metrics/dashboard")
      .then(({ data }) => setData(data))
      .catch((err) => toast.error(err.response?.data?.message || "Erro"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold">Conexões</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">Conexões</h2>
        <p className="text-sm text-muted-foreground mt-1">Seu grafo de vida — conexões criadas pelo journal</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Pessoas" value={data?.uniquePeople || 0} colorClass="text-entity-person" />
        <StatCard icon={FolderKanban} label="Projetos" value={data?.uniqueProjects || 0} colorClass="text-entity-project" />
        <StatCard icon={Target} label="Hábitos" value={data?.uniqueHabits || 0} colorClass="text-entity-habit" />
        <StatCard icon={TrendingUp} label="Menções" value={data?.totalMentions || 0} colorClass="text-primary" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TopList title="Top Pessoas" items={data?.topPeople || []} icon={Users} colorClass="text-entity-person" />
        <TopList title="Top Projetos" items={data?.topProjects || []} icon={FolderKanban} colorClass="text-entity-project" />
        <TopList title="Top Hábitos" items={data?.topHabits || []} icon={Target} colorClass="text-entity-habit" />
      </div>
    </div>
  );
}
