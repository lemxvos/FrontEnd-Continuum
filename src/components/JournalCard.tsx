import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import MentionTag, { extractMentions } from "@/components/MentionTag";
import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface JournalEntry {
  id: string;
  content: string;
  createdAt: string;
}

interface JournalCardProps {
  entry: JournalEntry;
  onClick: () => void;
  onDelete?: () => void;
  index?: number;
}

export default function JournalCard({ entry, onClick, onDelete, index = 0 }: JournalCardProps) {
  const mentions = extractMentions(entry.content);
  const preview = entry.content.replace(/[#@*]/g, "").slice(0, 200);
  const date = new Date(entry.createdAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className="surface rounded-xl p-4 hover:bg-surface-2 cursor-pointer transition-colors group relative"
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-muted-foreground">
          {format(date, "HH:mm", { locale: ptBR })}
        </p>
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="h-6 w-6 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <p className="text-sm text-foreground/80 line-clamp-3 mb-3 leading-relaxed">{preview}</p>
      {mentions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {mentions.slice(0, 5).map((m, i) => (
            <MentionTag key={`${m.type}-${m.name}-${i}`} type={m.type} name={m.name} />
          ))}
          {mentions.length > 5 && (
            <span className="text-xs text-muted-foreground px-1">+{mentions.length - 5}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}

export function groupByDate(entries: JournalEntry[]) {
  const groups: { label: string; entries: JournalEntry[] }[] = [];
  const map = new Map<string, JournalEntry[]>();

  for (const entry of entries) {
    const date = new Date(entry.createdAt);
    let label: string;
    if (isToday(date)) label = "Hoje";
    else if (isYesterday(date)) label = "Ontem";
    else if (isThisWeek(date)) label = "Esta semana";
    else label = format(date, "MMMM yyyy", { locale: ptBR });

    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(entry);
  }

  for (const [label, entries] of map) {
    groups.push({ label, entries });
  }
  return groups;
}
