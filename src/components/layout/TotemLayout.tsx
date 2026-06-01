import React, { useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { useTotemFlow } from '@/lib/totem-flow-store';
import { useIdleReset } from '@/hooks/useIdleReset';
import { Button } from '@/components/ui/button';
import { Home, Clock } from 'lucide-react';

export function TotemLayout() {
  const { reset } = useTotemFlow();

  const handleReset = useCallback(() => {
    window.location.href = '/totem';
  }, []);

  useIdleReset(handleReset);

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-hairline bg-canvas flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-ink">
          <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 3v18M18 3v18M6 3h12M6 21h12M12 3v18" />
            </svg>
          </div>
          <span className="font-medium">Barbearia STYLE</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-muted">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-mono" id="clock">
              {new Date().toLocaleTimeString('pt-BR')}
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { reset(); handleReset(); }}
            className="text-muted hover:text-ink"
          >
            <Home className="w-4 h-4 mr-1" />
            Início
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="h-12 border-t border-hairline bg-surface-soft flex items-center justify-center">
        <p className="text-sm text-muted">
          Precisa de ajuda? Chame um barbeiro
        </p>
      </footer>

      {/* Clock updater */}
      <ClockUpdater />
    </div>
  );
}

function ClockUpdater() {
  useEffect(() => {
    const interval = setInterval(() => {
      const clock = document.getElementById('clock');
      if (clock) {
        clock.textContent = new Date().toLocaleTimeString('pt-BR');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
}