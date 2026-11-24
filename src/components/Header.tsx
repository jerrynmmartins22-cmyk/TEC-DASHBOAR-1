import { Wrench, Calendar, Database } from 'lucide-react';
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
    <header className="glass-card rounded-none border-x-0 border-t-0 border-b border-border/50 px-3 py-3 sm:px-6 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/20 glow-primary shrink-0">
            <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              TEC-DASHBOARD
            </h1>
            <p className="hidden sm:flex text-xs sm:text-sm text-muted-foreground items-center gap-1">
              <Calendar className="w-3 h-3" />
              Gerenciamento de Serviços em Campo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          <div
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-secondary/50 border border-border/50"
            title={`Banco de Dados: ${dbStatus === 'connected' ? 'Conectado' : dbStatus === 'checking' ? 'Verificando' : 'Desconectado'}`}
          >
            <div className={`relative flex items-center justify-center w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}>
              {dbStatus !== 'connected' && (
                <div className="absolute w-full h-full rounded-full animate-ping opacity-75 bg-red-500"></div>
              )}
            </div>
            <Database className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${dbStatus === 'connected' ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`hidden sm:inline text-xs font-medium ${dbStatus === 'connected' ? 'text-green-500' : 'text-red-500'}`}>
              {dbStatus === 'checking' ? 'Verificando...' : dbStatus === 'connected' ? 'Supabase' : 'Offline'}
            </span>
          </div>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};
