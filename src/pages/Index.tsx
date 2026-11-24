import { Header } from '@/components/Header';
import { TechnicianManager } from '@/components/TechnicianManager';
import { ScheduleSelector } from '@/components/ScheduleSelector';
import { ScheduleEditor } from '@/components/ScheduleEditor';
import { ScheduleViewer } from '@/components/ScheduleViewer';
import { PreviewModal } from '@/components/PreviewModal';
import { ServiceTypeManager } from '@/components/ServiceTypeManager';
import { useAppStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Users, Tags, CalendarPlus, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const Index = () => {
  const { currentSchedule, mode, fetchState } = useAppStore();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(mode === 'edit');

  useEffect(() => {
    setIsSidebarOpen(mode === 'edit' && !isMobile);
  }, [mode, isMobile]);

  useEffect(() => {
    const POLL_INTERVAL_MS = 15000;

    const pollIfVisible = () => {
      if (!document.hidden && navigator.onLine) {
        fetchState();
      }
    };

    pollIfVisible();
    const interval = setInterval(pollIfVisible, POLL_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        pollIfVisible();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchState]);

  const sidebarContent = (
    <>
      <Accordion type="single" collapsible defaultValue="agendas" className="w-full space-y-2">
        <AccordionItem value="agendas" className="border-none">
          <AccordionTrigger className="hover:no-underline py-2 px-1">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <CalendarPlus className="w-4 h-4 text-primary" />
              Agendas
            </span>
          </AccordionTrigger>
          <AccordionContent className="p-1">
            <ScheduleSelector />
          </AccordionContent>
        </AccordionItem>

        {mode === 'edit' && (
          <>
            <AccordionItem value="categories" className="border-none">
              <AccordionTrigger className="hover:no-underline py-2 px-1">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Tags className="w-4 h-4 text-primary" />
                  Categorias O.S
                </span>
              </AccordionTrigger>
              <AccordionContent className="p-1">
                <ServiceTypeManager />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="technicians" className="border-none">
              <AccordionTrigger className="hover:no-underline py-2 px-1">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Users className="w-4 h-4 text-primary" />
                  Técnicos
                </span>
              </AccordionTrigger>
              <AccordionContent className="p-1">
                <TechnicianManager />
              </AccordionContent>
            </AccordionItem>
          </>
        )}
      </Accordion>
      {currentSchedule && mode === 'edit' && <PreviewModal />}
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside
            className={cn(
              "border-r border-border/50 bg-card/30 space-y-4 overflow-y-auto transition-all duration-300 ease-in-out relative shrink-0",
              isSidebarOpen ? "w-80 p-4 opacity-100" : "w-0 p-0 opacity-0 border-none overflow-hidden"
            )}
          >
            <div className={cn("transition-all duration-300", isSidebarOpen ? "opacity-100 delay-150" : "opacity-0 invisible")}>
              {sidebarContent}
            </div>
          </aside>
        )}

        {/* Mobile Drawer Sidebar */}
        {isMobile && (
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetContent side="left" className="w-[88vw] max-w-sm p-4 overflow-y-auto bg-card border-border/60">
              <SheetHeader className="mb-3 text-left">
                <SheetTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Painel Lateral
                </SheetTitle>
              </SheetHeader>
              {sidebarContent}
            </SheetContent>
          </Sheet>
        )}

        {/* Toggle Button */}
        <div className={cn(
          "fixed md:absolute z-20 transition-all duration-300 ease-in-out",
          isMobile
            ? "bottom-5 left-4"
            : cn("top-1/2 -translate-y-1/2", isSidebarOpen ? "left-[19rem]" : "left-4")
        )}>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label={isSidebarOpen ? 'Recolher menu lateral' : 'Abrir menu lateral'}
            title={isSidebarOpen ? 'Recolher menu' : 'Abrir menu'}
            className="h-9 w-9 md:h-8 md:w-8 rounded-full bg-background/95 backdrop-blur border-border shadow-md hover:bg-accent hover:text-accent-foreground"
          >
            {isMobile ? (
              <PanelLeft className="h-4 w-4" />
            ) : isSidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
          {mode === 'edit' ? <ScheduleEditor /> : <ScheduleViewer />}
        </main>
      </div>
      <footer className="w-full py-1.5 text-center text-xs text-muted-foreground/50 border-t border-border/10">
        Desenvolvido por: ODAIR-JDEV
      </footer>
    </div>
  );
};

export default Index;
