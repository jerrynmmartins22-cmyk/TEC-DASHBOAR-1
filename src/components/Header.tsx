import { Radio, Calendar, Database } from 'lucide-react';
import { ModeToggle } from './ModeToggle';
import { useAppStore } from '@/lib/store';
import { useEffect } from 'react';

export const Header = () => {
  const { dbStatus, checkDbStatus } = useAppStore();

  useEffect(() => {
    checkDbStatus();
  }, [checkDbStatus]);

  useEffect(() => {
    if (dbStatus !== 'disconnected') return;
    const interval = setInterval(() => {
      if (!document.hidden && navigator.onLine) {
        checkDbStatus();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [dbStatus, checkDbStatus]);

  return (
    <header className="glass-card rounded-none border-x-0 border-t-0 border-b border-sky-400/20 px-3 py-3 sm:px-6 sm:py-3.5 relative">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-400/25 to-blue-600/25 border border-cyan-400/40 glow-primary shrink-0">
            <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground">
              TEC<span className="text-gradient">-DASHBOARD</span>
            </h1>
            <p className="hidden sm:flex text-xs text-sky-200/60 items-center gap-1.5">
              <Calendar className="w-3 h-3 text-cyan-400/80" />
              Gerenciamento de Serviços em Campo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/60 border border-sky-400/20"
            title={`Banco de Dados: ${dbStatus === 'connected' ? 'Conectado' : dbStatus === 'checking' ? 'Verificando' : 'Desconectado'}`}
          >
            <div className={`relative flex items-center justify-center w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`}>
              {dbStatus !== 'connected' && (
                <div className="absolute w-full h-full rounded-full animate-ping opacity-75 bg-red-500"></div>
              )}
            </div>
            <Database className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${dbStatus === 'connected' ? 'text-emerald-400' : 'text-red-400'}`} />
            <span className={`hidden sm:inline text-xs font-medium ${dbStatus === 'connected' ? 'text-emerald-300' : 'text-red-400'}`}>
              {dbStatus === 'checking' ? 'Verificando...' : dbStatus === 'connected' ? 'Supabase' : 'Offline'}
            </span>
          </div>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};
