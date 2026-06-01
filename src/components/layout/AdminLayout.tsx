import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Scissors,
  Package,
  Tags,
  Gift,
  Users,
  UserCircle,
  Calendar,
  BarChart3,
  MessageSquare,
  LogOut,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/servicos', label: 'Serviços', icon: Scissors },
  { href: '/admin/produtos', label: 'Produtos', icon: Package },
  { href: '/admin/categorias', label: 'Categorias', icon: Tags },
  { href: '/admin/cortesias', label: 'Cortesias', icon: Gift },
  { href: '/admin/barbeiros', label: 'Barbeiros', icon: Users },
  { href: '/admin/clientes', label: 'Clientes', icon: UserCircle },
  { href: '/admin/agendamentos', label: 'Agendamentos', icon: Calendar },
  { href: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/admin/pesquisas', label: 'Pesquisas', icon: MessageSquare },
];

function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-hairline">
        <Logo />
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onItemClick}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-surface-soft text-ink'
                  : 'text-muted hover:bg-surface-soft hover:text-ink'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-hairline">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted hover:bg-surface-soft hover:text-ink transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </Link>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col border-r border-hairline bg-canvas">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="m-4">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-60 p-0">
          <SidebarContent onItemClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Nav */}
        <header className="h-16 border-b border-hairline bg-canvas flex items-center justify-between px-6">
          <div className="lg:hidden">
            <Logo size="sm" />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-muted hidden sm:block">
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
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}