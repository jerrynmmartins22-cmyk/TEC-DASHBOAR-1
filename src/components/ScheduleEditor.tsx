import { useAppStore } from '@/lib/store';
import { ServiceBoxCard } from './ServiceBox';
import { Button } from '@/components/ui/button';
import { formatScheduleText, copyToClipboard } from '@/lib/formatSchedule';
import { Plus, Copy, FileText, Check } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { toast } from 'sonner';

export const ScheduleEditor = () => {
  const { currentSchedule, addBox } = useAppStore();
  const [copied, setCopied] = useState(false);

  if (!currentSchedule) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">
            Selecione ou crie uma agenda para começar
          </p>
        </div>
      </div>
    );
  }

  const handleCopy = async () => {
    const text = formatScheduleText(currentSchedule);
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      toast.success('Agenda copiada para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Erro ao copiar agenda');
    }
  };

  const dateFormatted = format(parseISO(currentSchedule.date), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const totalBoxes = currentSchedule.boxes.length;
  const totalServices = currentSchedule.boxes.reduce((acc, box) => acc + box.services.length, 0);
  const assignedTeams = currentSchedule.boxes.filter((box) => box.team && box.team.members.length > 0).length;

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-sky-400/15 bg-[#081228]/45 backdrop-blur-[6px]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground capitalize">
            {dateFormatted}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs sm:text-sm text-muted-foreground">
            <span>
              Turno: <span className="text-primary font-medium">{currentSchedule.shift}</span>
            </span>
            <span className="text-border">•</span>
            <span className="font-mono">{totalBoxes} caixa(s)</span>
            <span className="text-border">•</span>
            <span className="font-mono">{totalServices} O.S.</span>
            <span className="text-border">•</span>
            <span className="font-mono">{assignedTeams}/{totalBoxes} equipes</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={() => addBox(currentSchedule.id)}
            className="bg-secondary/50 border-border/50 hover:bg-secondary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Caixa
          </Button>
          <Button onClick={handleCopy} className="noc-cta rounded-lg">
            {copied ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            {copied ? 'Copiado!' : 'Copiar Agenda'}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {currentSchedule.boxes.length === 0 ? (
          <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-center border border-dashed border-border/60 rounded-xl p-6 bg-card/20">
            <FileText className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground mb-3">Nenhuma caixa cadastrada nesta agenda.</p>
            <Button variant="outline" size="sm" onClick={() => addBox(currentSchedule.id)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar primeira caixa
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {currentSchedule.boxes.map((box) => (
              <ServiceBoxCard 
                key={box.id} 
                box={box} 
                scheduleId={currentSchedule.id} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
