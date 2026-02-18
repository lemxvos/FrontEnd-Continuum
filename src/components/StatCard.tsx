/**
 * StatCard - Cartão de estatística com tendência e ícone
 */

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'yellow';
  onClick?: () => void;
}

const colorMap = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
  yellow: 'bg-yellow-500',
};

const bgMap = {
  blue: 'bg-blue-50 dark:bg-blue-950',
  green: 'bg-green-50 dark:bg-green-950',
  purple: 'bg-purple-50 dark:bg-purple-950',
  orange: 'bg-orange-50 dark:bg-orange-950',
  pink: 'bg-pink-50 dark:bg-pink-950',
  yellow: 'bg-yellow-50 dark:bg-yellow-950',
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = 'blue',
  onClick,
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`rounded-lg p-4 border border-border transition-all ${
        onClick ? 'cursor-pointer hover:border-primary/50' : ''
      } ${bgMap[color]}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>

        {icon && (
          <div className={`p-2 rounded-lg ${bgMap[color]} text-${color}-600 dark:text-${color}-400`}>
            {icon}
          </div>
        )}
      </div>

      {trend && trendValue !== undefined && (
        <div className="flex items-center gap-1 mt-3">
          {trend === 'up' && (
            <>
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                +{trendValue}%
              </span>
            </>
          )}
          {trend === 'down' && (
            <>
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-xs font-medium text-red-600 dark:text-red-400">
                -{trendValue}%
              </span>
            </>
          )}
          {trend === 'stable' && (
            <>
              <Minus className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {trendValue}% sem mudança
              </span>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}