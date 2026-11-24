import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Edit3, Eye } from 'lucide-react';

export const ModeToggle = () => {
  const { mode, setMode } = useAppStore();

  return (
    <div className="flex items-center gap-1 p-1 bg-slate-950/60 rounded-xl border border-sky-400/20">
      <Button
        variant={mode === 'edit' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setMode('edit')}
        className={mode === 'edit' ? 'noc-cta rounded-lg' : 'text-sky-200/70 hover:text-white hover:bg-sky-400/10 rounded-lg'}
      >
        <Edit3 className="w-4 h-4 sm:mr-2" />
        <span className="hidden sm:inline">Edição</span>
      </Button>
      <Button
        variant={mode === 'view' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setMode('view')}
        className={mode === 'view' ? 'noc-cta rounded-lg' : 'text-sky-200/70 hover:text-white hover:bg-sky-400/10 rounded-lg'}
      >
        <Eye className="w-4 h-4 sm:mr-2" />
        <span className="hidden sm:inline">Visualização</span>
      </Button>
    </div>
  );
};
