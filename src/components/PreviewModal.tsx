import { useAppStore } from '@/lib/store';
import { formatScheduleText, copyToClipboard } from '@/lib/formatSchedule';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export const PreviewModal = () => {
  const { currentSchedule } = useAppStore();
  const [copied, setCopied] = useState(false);

  if (!currentSchedule) return null;

  const previewText = formatScheduleText(currentSchedule);

  const handleCopy = async () => {
    const success = await copyToClipboard(previewText);
    if (success) {
      setCopied(true);
      toast.success('Agenda copiada!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full bg-slate-950/50 border-sky-400/25 text-cyan-200 hover:bg-cyan-400/15 hover:border-cyan-400/50 hover:text-white">
          <Eye className="w-4 h-4 mr-2 text-cyan-300" />
          Preview da Agenda
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-[#070f24]/95 backdrop-blur-xl border-sky-400/25">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-6">
            <span className="text-foreground">Preview da Agenda</span>
            <Button onClick={handleCopy} size="sm" className="noc-cta rounded-lg">
              {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
              {copied ? 'Copiado' : 'Copiar'}
            </Button>
          </DialogTitle>
        </DialogHeader>
        <pre className="bg-slate-950/75 border border-sky-400/15 p-4 rounded-xl font-mono text-sm whitespace-pre-wrap text-sky-100 overflow-auto max-h-96">
          {previewText}
        </pre>
      </DialogContent>
    </Dialog>
  );
};
