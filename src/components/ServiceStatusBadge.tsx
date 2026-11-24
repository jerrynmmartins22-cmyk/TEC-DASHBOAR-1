import { ServiceStatus } from '@/types';
import { Check, X, Clock, Minus } from 'lucide-react';

interface ServiceStatusBadgeProps {
  status?: ServiceStatus;
  completedAt?: string;
}

const statusConfig: Record<ServiceStatus, { label: string; className: string; icon: React.ReactNode }> = {
  pendente: {
    label: 'Pendente',
    className: 'bg-indigo-500/15 text-indigo-200 border-indigo-400/30',
    icon: <Minus className="w-3 h-3" />,
  },
  concluido: {
    label: 'Concluído',
    className: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    icon: <Check className="w-3 h-3" />,
  },
  cancelado: {
    label: 'Cancelado',
    className: 'bg-red-500/20 text-red-300 border-red-400/40',
    icon: <X className="w-3 h-3" />,
  },
  reagendado: {
    label: 'Reagendado',
    className: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    icon: <Clock className="w-3 h-3" />,
  },
};

export const ServiceStatusBadge = ({ status = 'pendente', completedAt }: ServiceStatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig['pendente'];

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.icon}
      <span>{config.label}</span>
      {completedAt && <span className="opacity-75">às {completedAt}</span>}
    </div>
  );
};
