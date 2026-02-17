import { useMemo } from "react";
import { format, subDays } from "date-fns";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface HeatmapGridProps {
  /** Map of "YYYY-MM-DD" → count (or boolean Set) */
  data: Record<string, number>;
  days?: number;
  onDayClick?: (date: string) => void;
  className?: string;
}

export default function HeatmapGrid({ data, days = 365, onDayClick, className }: HeatmapGridProps) {
  const today = new Date();
  const dayList = useMemo(
    () =>
      Array.from({ length: days }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (days - 1 - i));
        return format(d, "yyyy-MM-dd");
      }),
    [days]
  );

  const getColor = (count: number) => {
    if (count === 0) return "bg-accent";
    if (count === 1) return "bg-entity-project/30";
    if (count <= 3) return "bg-entity-project/50";
    if (count <= 5) return "bg-entity-project/70";
    return "bg-entity-project";
  };

  return (
    <div className={cn("overflow-x-auto", className)}>
      <div className="grid grid-rows-7 grid-flow-col gap-[3px]">
        {dayList.map((dateStr) => {
          const count = data[dateStr] || 0;
          return (
            <Tooltip key={dateStr}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onDayClick?.(dateStr)}
                  className={cn(
                    "w-[11px] h-[11px] rounded-[2px] transition-colors",
                    getColor(count),
                    onDayClick && "hover:ring-1 hover:ring-primary"
                  )}
                />
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">{dateStr}: {count} {count === 1 ? "entry" : "entries"}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
