import React from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * Shared KPI card used by FlotaKpiOverview and SensorizeitKpiOverview.
 * Extracted from the identical card markup that both overviews repeated
 * six times each. All class strings are preserved exactly.
 */
interface KpiCardProps {
  id: string;
  label: string;
  count: number;
  /** Text shown under the count (e.g. '12% en despliegue') */
  detail: string;
  /** Tailwind classes for the detail line under the count */
  detailClass: string;
  /** Tailwind classes for the count value (e.g. 'text-emerald-700') */
  countClass: string;
  icon: LucideIcon;
  /** Tailwind classes for the icon bubble background (e.g. 'bg-emerald-50') */
  iconBg: string;
  /** Tailwind classes for the icon color (e.g. 'text-emerald-600') */
  iconColor: string;
  /** Tailwind hover border class (e.g. 'hover:border-emerald-300') */
  hoverBorder: string;
  onClick: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  id,
  label,
  count,
  detail,
  detailClass,
  countClass,
  icon: Icon,
  iconBg,
  iconColor,
  hoverBorder,
  onClick,
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white rounded-xl p-4 border border-slate-200 shadow-sm ${hoverBorder} transition-all cursor-pointer group flex flex-col justify-between`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center ${iconColor} group-hover:scale-110 transition-transform`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3">
        <div className={`text-2xl font-bold ${countClass}`}>{count}</div>
        <div className={`text-xs mt-0.5 ${detailClass}`}>{detail}</div>
      </div>
    </div>
  );
};