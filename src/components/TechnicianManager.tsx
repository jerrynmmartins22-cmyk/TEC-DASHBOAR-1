import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, X, Users } from 'lucide-react';

export const TechnicianManager = () => {
  const [newName, setNewName] = useState('');
  const { technicians, addTechnician, removeTechnician } = useAppStore();

  const handleAdd = () => {
    if (newName.trim()) {
      addTechnician(newName.trim());
      setNewName('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="glass-card p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-cyan-300" />
        <h2 className="font-semibold text-foreground">Técnicos</h2>
        <span className="text-xs font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 px-2 py-0.5 rounded-full">
          {technicians.length}
        </span>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Nome do técnico..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyPress={handleKeyPress}
          className="bg-slate-950/50 border-sky-400/20 focus:border-cyan-400/60 text-foreground placeholder:text-muted-foreground"
        />
        <Button onClick={handleAdd} size="icon" className="shrink-0 noc-cta rounded-lg">
          <UserPlus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
        {technicians.map((tech) => (
          <div
            key={tech.id}
            className="flex items-center gap-1.5 bg-slate-950/50 border border-sky-400/15 text-sky-100 px-2.5 py-1 rounded-lg text-xs group hover:border-cyan-400/35 transition-colors"
          >
            <span className="font-mono">{tech.name}</span>
            <button
              onClick={() => removeTechnician(tech.id)}
              title="Remover técnico"
              className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
