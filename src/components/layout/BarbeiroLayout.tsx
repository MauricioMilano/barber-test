import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { LogoSmall } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';

export function BarbeiroLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Top Nav */}
      <header className="h-16 border-b border-hairline bg-canvas flex items-center justify-between px-6">
        <LogoSmall />

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted">
            {user?.name}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="border-hairline text-muted hover:text-ink"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}