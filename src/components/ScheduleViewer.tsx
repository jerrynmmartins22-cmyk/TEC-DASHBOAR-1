import { useAppStore } from '@/lib/store';
import { ViewModeBox } from './ViewModeBox';
import { FileText, Copy, Check, Sun, Moon, Search, X, CalendarDays, ArrowUpDown } from 'lucide-react';

import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ServiceStatus } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const formatTeamName = (box: { team: { members: { name: string }[] } | null }): string => {
  if (!box.team || box.team.members.length === 0) {
    return '';
  }

  const names = box.team.members.map(m => m.name);
  if (names.length === 1) {
    return names[0];
  }
  if (names.length === 2) {
    return `${names[0]} E ${names[1]}`;
  }
  if (names.length === 3) {
    return `${names[0]}, ${names[1]} E ${names[2]}`;
  }
  return names.join(', ');
};

const formatStatusText = (status?: string, completedAt?: string): string => {
  if (!status || status === 'pendente') return '';
  return ` - ${status} às ${completedAt || ''}`;
};

type StatusFilter = 'todas' | ServiceStatus;

export const ScheduleViewer = () => {
  const { currentSchedule, schedules, setCurrentSchedule, hasLoaded } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [searchOS, setSearchOS] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todas');
  const [sortBy, setSortBy] = useState<'number' | 'pending'>('number');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/' && !isTyping) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearchOS('');
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const trimmedSearch = searchOS.trim();
  const matchCount = trimmedSearch && currentSchedule
    ? currentSchedule.boxes.reduce(
        (acc, box) =>
          acc + box.services.filter((s) => s.osNumber.includes(trimmedSearch)).length,
        0
      )
    : 0;

  const handleToggleShift = () => {
    if (!currentSchedule) return;

    const targetShift = currentSchedule.shift === 'MANHÃ' ? 'TARDE' : 'MANHÃ';

    // Ensure we compare dates safely (ignoring potential time components if any)
    const currentDateStr = currentSchedule.date.split('T')[0];

    const foundSchedule = schedules.find(
      s => s.date.split('T')[0] === currentDateStr && s.shift === targetShift
    );

    if (foundSchedule) {
      setCurrentSchedule(foundSchedule);
      // Removed success toast to make transition smoother/faster
    } else {
      toast.info(`Não foi encontrada uma agenda de ${targetShift} para esta data.`);
    }
  };

  if (!currentSchedule) {
    if (!hasLoaded) {
      return (
        <div className="flex-1 p-4 space-y-4 overflow-hidden">
          <div className="h-16 rounded-xl glass-card animate-pulse" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 rounded-xl glass-card animate-pulse" />
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">
            Selecione uma agenda para visualizar
          </p>
        </div>
      </div>
    );
  }

  const handleCopyWithStatus = async () => {
    const dateFormatted = format(parseISO(currentSchedule.date), 'dd/MM/yyyy', { locale: ptBR });

    let output = `Serviços da Agenda: ${dateFormatted} - TURNO: ${currentSchedule.shift}\n`;
    output += '---------------------------------------------------------\n';

    // Sort boxes by number to ensure they appear in order 1, 2, 3...
    const sortedBoxes = [...currentSchedule.boxes].sort((a, b) => a.number - b.number);

    for (const box of sortedBoxes) {
      const teamName = formatTeamName(box);
      const boxNumber = String(box.number).padStart(2, '0');
      const boxStatus = box.status ? ` ${box.status}` : '';

      // Determine the header line format
      // Example: BOÂO, FELIPE E PEDRO: (CAIXA - 01) TOKIO
      let headerLine = '';
      if (teamName) {
        headerLine = `${teamName}: (CAIXA - ${boxNumber})${boxStatus}`;
      } else {
        headerLine = `(CAIXA - ${boxNumber})${boxStatus}`;
      }

      output += `${headerLine}\n`;

      // Departure time
      // Example: Saida:08:35
      if (box.departureTime) {
        output += `Saida:${box.departureTime}\n`;
      } else {
        output += `Saida: --:--\n`;
      }

      output += '\n'; // Empty line between header/departure and services

      if (box.services.length === 0) {
        output += '- VAZIA\n';
      } else {
        for (const service of box.services) {
          // Service format: - [OS] ([TYPE]) - [status] às [time]
          // Example: - 6394789 (UPGRADE) - cancelado às 10:37

          let serviceLine = `- ${service.osNumber} (${service.type})`;

          if (service.status && service.status !== 'pendente') {
            // Ensure status is lowercase if needed, though type is usually formatted
            // The user example shows lowercase "cancelado", "concluido"
            // Our status types are lowercase in code usually? Let's check.
            // Types are 'pendente' | 'concluido' | 'cancelado' | 'reagendado'

            const timeStr = service.completedAt ? ` às ${service.completedAt}` : '';
            serviceLine += ` - ${service.status}${timeStr}`;
          }

          output += `${serviceLine}\n`;
        }
      }

      output += '\n'; // Empty line before Galpão

      // Return time
      // Example: Galpão:12:35
      if (box.returnTime) {
        output += `Galpão:${box.returnTime}\n`;
      } else {
        output += `Galpão: --:--\n`;
      }

      output += '---------------------------------------------------------\n';
    }

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      toast.success('Agenda copiada com sucesso!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const dateFormatted = format(parseISO(currentSchedule.date), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  const stats = currentSchedule.boxes.reduce(
    (acc, box) => {
      acc.totalBoxes += 1;
      for (const s of box.services) {
        acc.totalServices += 1;
        const st = s.status || 'pendente';
        acc[st] += 1;
      }
      return acc;
    },
    { totalBoxes: 0, totalServices: 0, pendente: 0, concluido: 0, cancelado: 0, reagendado: 0 }
  );

  const progressPct = stats.totalServices > 0
    ? Math.round((stats.concluido / stats.totalServices) * 100)
    : 0;

  const lowerSearch = trimmedSearch.toLowerCase();

  const visibleBoxes = [...currentSchedule.boxes]
    .filter((box) => {
      const matchesStatus =
        statusFilter === 'todas' ||
        box.services.some((s) => (s.status || 'pendente') === statusFilter);

      if (!matchesStatus) return false;
      if (!lowerSearch) return true;

      const matchesOS = box.services.some((s) => s.osNumber.toLowerCase().includes(lowerSearch));
      const matchesCity = !!box.city && box.city.toLowerCase().includes(lowerSearch);
      const matchesTeam = !!box.team?.members.some((m) => m.name.toLowerCase().includes(lowerSearch));
      return matchesOS || matchesCity || matchesTeam;
    })
    .sort((a, b) => {
      if (sortBy === 'pending') {
        const aPending = a.services.filter((s) => !s.status || s.status === 'pendente').length;
        const bPending = b.services.filter((s) => !s.status || s.status === 'pendente').length;
        if (bPending !== aPending) return bPending - aPending;
      }
      return a.number - b.number;
    });

  const filterChips: { key: StatusFilter; label: string; count: number; activeClass: string }[] = [
    { key: 'todas', label: 'Todas', count: stats.totalServices, activeClass: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-semibold border-cyan-300/50 shadow-[0_0_12px_rgba(6,182,212,0.35)]' },
    { key: 'pendente', label: 'Pendentes', count: stats.pendente, activeClass: 'bg-indigo-500/25 text-indigo-200 border-indigo-400/50' },
    { key: 'concluido', label: 'Concluídas', count: stats.concluido, activeClass: 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50' },
    { key: 'reagendado', label: 'Reagendadas', count: stats.reagendado, activeClass: 'bg-amber-500/25 text-amber-300 border-amber-400/50' },
    { key: 'cancelado', label: 'Canceladas', count: stats.cancelado, activeClass: 'bg-red-500/25 text-red-300 border-red-400/50' },
  ];

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-sky-400/15 bg-[#081228]/45 backdrop-blur-[6px]">
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/25 text-cyan-300 shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground capitalize">
              {dateFormatted}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">Turno:</span>
              <div className="flex items-center gap-2 bg-slate-950/60 p-1 rounded-lg border border-sky-400/20">
                <Sun className={`w-4 h-4 ${currentSchedule.shift === 'MANHÃ' ? 'text-accent' : 'text-muted-foreground'}`} />
                <Switch
                  checked={currentSchedule.shift === 'TARDE'}
                  onCheckedChange={handleToggleShift}
                  className="data-[state=checked]:bg-cyan-500 data-[state=unchecked]:bg-accent"
                />
                <Moon className={`w-4 h-4 ${currentSchedule.shift === 'TARDE' ? 'text-cyan-300' : 'text-muted-foreground'}`} />
              </div>
              <span className={`text-sm font-semibold ${currentSchedule.shift === 'MANHÃ' ? 'text-accent' : 'text-cyan-300'}`}>
                {currentSchedule.shift}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-64 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-300/70 pointer-events-none" />
            <Input
              ref={searchInputRef}
              type="text"
              value={searchOS}
              onChange={(e) => setSearchOS(e.target.value)}
              placeholder="Buscar OS, técnico ou cidade (/)"
              className="pl-8 pr-8 h-9 bg-slate-950/60 border-sky-400/20 focus:border-cyan-400/60 text-sm"
            />
            {searchOS && (
              <button
                onClick={() => setSearchOS('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                title="Limpar busca (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button onClick={handleCopyWithStatus} className="noc-cta rounded-lg shrink-0">
            {copied ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            {copied ? 'Copiado!' : 'Copiar com Status'}
          </Button>
        </div>
      </div>

      {/* KPI & Status Filter Bar */}
      <div className="px-4 py-2.5 border-b border-sky-400/15 bg-[#071022]/35 backdrop-blur-[4px] space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {filterChips.map((chip) => {
              const isActive = statusFilter === chip.key;
              return (
                <button
                  key={chip.key}
                  onClick={() => setStatusFilter(chip.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                    isActive
                      ? chip.activeClass
                      : "bg-slate-950/50 text-sky-200/70 border-sky-400/15 hover:bg-sky-400/10 hover:text-white"
                  )}
                >
                  <span>{chip.label}</span>
                  <span className="font-mono text-[11px] opacity-85">{chip.count}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 text-xs text-sky-200/70">
            <button
              onClick={() => setSortBy((prev) => (prev === 'number' ? 'pending' : 'number'))}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/50 border border-sky-400/20 hover:border-cyan-400/40 text-sky-200 transition-colors"
              title="Alternar ordenação das caixas"
            >
              <ArrowUpDown className="w-3 h-3 text-cyan-300" />
              <span>{sortBy === 'number' ? 'Ordem: Caixa' : 'Ordem: Pendências'}</span>
            </button>
            <span className="font-mono">{stats.totalBoxes} caixa(s)</span>
            <span>•</span>
            <span className="font-mono font-semibold text-cyan-300">{progressPct}% concluído</span>
          </div>
        </div>
        {stats.totalServices > 0 && (
          <div className="w-full h-2 rounded-full bg-slate-950/80 border border-sky-400/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 transition-all duration-500 shadow-[0_0_12px_rgba(34,211,238,0.5)]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </div>

      {trimmedSearch && (
        <div className="px-4 py-1.5 text-xs text-muted-foreground bg-secondary/20 border-b border-border/50">
          {matchCount > 0
            ? `${matchCount} OS encontrada(s) para "${trimmedSearch}" - destacada(s) em azul.`
            : `Nenhuma OS encontrada para "${trimmedSearch}".`}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {visibleBoxes.length === 0 ? (
          <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center border border-dashed border-border/60 rounded-xl p-6 bg-card/20">
            <p className="text-sm text-muted-foreground mb-2">
              Nenhuma caixa possui O.S. com o status selecionado.
            </p>
            <Button variant="outline" size="sm" onClick={() => setStatusFilter('todas')}>
              Mostrar todas as caixas
            </Button>
          </div>
        ) : (
          <div
            key={`${currentSchedule.id}-${statusFilter}`}
            className={`grid gap-4 md:grid-cols-2 xl:grid-cols-3 animate-in fade-in zoom-in-95 duration-300 ${currentSchedule.shift === 'MANHÃ' ? 'slide-in-from-left-4' : 'slide-in-from-right-4'
              }`}
          >
            {visibleBoxes.map((box) => (
              <ViewModeBox
                key={box.id}
                box={box}
                scheduleId={currentSchedule.id}
                highlightOS={trimmedSearch}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
