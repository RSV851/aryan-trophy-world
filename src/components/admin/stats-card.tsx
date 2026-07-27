import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accentColor?: 'gold' | 'emerald' | 'blue' | 'purple' | 'rose';
  isLoading?: boolean;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = 'gold',
  isLoading = false,
}: StatsCardProps) {
  const colorMap = {
    gold: {
      bg: 'bg-[#C5A55A]/10',
      text: 'text-[#C5A55A]',
      border: 'border-[#C5A55A]/30',
      glow: 'shadow-[0_0_25px_rgba(197,165,90,0.15)]',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      glow: 'shadow-[0_0_25px_rgba(16,185,129,0.15)]',
    },
    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      glow: 'shadow-[0_0_25px_rgba(59,130,246,0.15)]',
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
      glow: 'shadow-[0_0_25px_rgba(168,85,247,0.15)]',
    },
    rose: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      glow: 'shadow-[0_0_25px_rgba(244,63,94,0.15)]',
    },
  };

  const style = colorMap[accentColor];

  if (isLoading) {
    return (
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-28 bg-gray-800" />
          <Skeleton className="h-10 w-10 rounded-lg bg-gray-800" />
        </div>
        <Skeleton className="h-8 w-20 bg-gray-800" />
        <Skeleton className="h-3 w-36 bg-gray-800" />
      </div>
    );
  }

  return (
    <div className={`bg-[#111827]/80 backdrop-blur-md border ${style.border} ${style.glow} rounded-xl p-5 transition-all duration-200 hover:translate-y-[-2px] flex flex-col justify-between`}>
      <div className="flex justify-between items-start">
        <span className="text-xs uppercase tracking-wider font-semibold text-gray-300">
          {title}
        </span>
        <div className={`p-2.5 rounded-lg ${style.bg} ${style.text}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-3xl font-extrabold tracking-tight text-white font-mono">
          {value}
        </h3>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-1 flex items-center space-x-1 font-medium">
            <span>{subtitle}</span>
          </p>
        )}
      </div>
    </div>
  );
}
