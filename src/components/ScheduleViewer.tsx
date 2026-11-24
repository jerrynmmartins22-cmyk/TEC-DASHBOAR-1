import { useAppStore } from '@/lib/store';
import { ViewModeBox } from './ViewModeBox';
import { FileText, Copy, Check, Sun, Moon, Search, X } from 'lucide-react';

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
  const { currentSchedule, schedules, setCurrentSchedule } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [searchOS, setSearchOS] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todas');
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

  const visibleBoxes = statusFilter === 'todas'
    ? currentSchedule.boxes
    : currentSchedule.boxes.filter((box) =>
        box.services.some((s) => (s.status || 'pendente') === statusFilter)
      );

  const filterChips: { key: StatusFilter; label: string; count: number; activeClass: string }[] = [
    { key: 'todas', label: 'Todas', count: stats.totalServices, activeClass: 'bg-primary text-primary-foreground border-primary' },
    { key: 'pendente', label: 'Pendentes', count: stats.pendente, activeClass: 'bg-secondary text-foreground border-border' },
    { key: 'concluido', label: 'Concluídas', count: stats.concluido, activeClass: 'bg-green-500/20 text-green-300 border-green-500/40' },
    { key: 'reagendado', label: 'Reagendadas', count: stats.reagendado, activeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
    { key: 'cancelado', label: 'Canceladas', count: stats.cancelado, activeClass: 'bg-destructive/20 text-destructive border-destructive/40' },
  ];

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border/50 bg-card/50">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground capitalize">
            {dateFormatted}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">Turno:</span>
            <div className="flex items-center gap-2 bg-secondary/30 p-1 rounded-lg border border-border/50">
              <Sun className={`w-4 h-4 ${currentSchedule.shift === 'MANHÃ' ? 'text-accent' : 'text-muted-foreground'}`} />
              <Switch
                checked={currentSchedule.shift === 'TARDE'}
                onCheckedChange={handleToggleShift}
                className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-accent"
              />
              <Moon className={`w-4 h-4 ${currentSchedule.shift === 'TARDE' ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <span className={`text-sm font-medium ${currentSchedule.shift === 'MANHÃ' ? 'text-accent' : 'text-primary'}`}>
              {currentSchedule.shift}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-56 min-w-[160px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={searchInputRef}
              type="text"
              inputMode="numeric"
              value={searchOS}
              onChange={(e) => setSearchOS(e.target.value)}
              placeholder="Buscar OS... (/)"
              className="pl-8 pr-8 h-9 bg-secondary/40 border-border/50 font-mono text-sm"
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
          <Button onClick={handleCopyWithStatus} className="glow-primary shrink-0">
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
      <div className="px-4 py-2.5 border-b border-border/40 bg-card/30 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {filterChips.map((chip) => {
              const isActive = statusFilter === chip.key;
              return (
                <button
                  key={chip.key}
                  onClick={() => setStatusFilter(chip.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                    isActive
                      ? chip.activeClass
                      : "bg-secondary/30 text-muted-foreground border-border/40 hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  <span>{chip.label}</span>
                  <span className="font-mono text-[11px] opacity-80">{chip.count}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{stats.totalBoxes} caixa(s)</span>
            <span>•</span>
            <span className="font-mono font-medium text-foreground">{progressPct}% concluído</span>
          </div>
        </div>
        {stats.totalServices > 0 && (
          <div className="w-full h-1.5 rounded-full bg-secondary/60 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-success transition-all duration-500"
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
