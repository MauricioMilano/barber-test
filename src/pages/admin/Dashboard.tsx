import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { formatCurrency, formatTime } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  RefreshCw,
  Clock,
  CheckCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DashboardData {
  kpis: {
    ordersToday: number;
    revenueToday: number;
    newClientsThisWeek: number;
    avgTicket: number;
  };
  lastOrders: any[];
  last7Days: { date: string; count: number }[];
  todayAppointments: any[];
  lastTrinksSync: any;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setData(response.data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-muted">
        Erro ao carregar dashboard
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Comandas Hoje',
      value: data.kpis.ordersToday,
      icon: ShoppingCart,
      variant: 'coral' as const,
    },
    {
      title: 'Faturamento',
      value: formatCurrency(data.kpis.revenueToday),
      icon: DollarSign,
      variant: 'forest' as const,
    },
    {
      title: 'Clientes Novos',
      value: data.kpis.newClientsThisWeek,
      icon: Users,
      variant: 'dark' as const,
    },
    {
      title: 'Ticket Médio',
      value: formatCurrency(data.kpis.avgTicket),
      icon: TrendingUp,
      variant: 'cream' as const,
    },
  ];

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'coral':
        return 'bg-signature-coral text-white';
      case 'forest':
        return 'bg-signature-forest text-white';
      case 'dark':
        return 'bg-surface-dark text-white';
      case 'cream':
        return 'bg-signature-cream text-ink';
      default:
        return 'bg-surface-soft text-ink';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-medium text-ink">Dashboard</h1>
        <p className="text-muted mt-1">Visão geral da barbearia</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className={`border-0 ${getVariantStyles(kpi.variant)}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">{kpi.title}</p>
                    <p className="text-3xl font-medium mt-1">{kpi.value}</p>
                  </div>
                  <Icon className="w-8 h-8 opacity-60" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts and Tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <Card className="border-hairline">
          <CardHeader>
            <CardTitle className="text-lg text-ink">Pedidos - Últimos 7 dias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.last7Days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dddddd" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('pt-BR', { weekday: 'short' });
                    }}
                    stroke="#41454d"
                  />
                  <YAxis stroke="#41454d" />
                  <Tooltip
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('pt-BR');
                    }}
                  />
                  <Bar dataKey="count" fill="#aa2d00" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card className="border-hairline">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-ink">Agendamentos de Hoje</CardTitle>
              <Badge variant="secondary">{data.todayAppointments.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-auto">
              {data.todayAppointments.length === 0 ? (
                <p className="text-sm text-muted text-center py-4">
                  Nenhum agendamento hoje
                </p>
              ) : (
                data.todayAppointments.map((apt: any) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-soft"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center text-sm font-medium">
                        {apt.client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-ink">{apt.client.name}</p>
                        <p className="text-sm text-muted">{apt.service.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-ink">{formatTime(apt.scheduledAt)}</p>
                      <p className="text-sm text-muted">{apt.barber.user.name}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Orders */}
      <Card className="border-hairline">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-ink">Últimas Comandas</CardTitle>
            <Link to="/admin/relatorios">
              <Button variant="ghost" size="sm" className="text-muted">
                Ver todos
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Cliente</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Serviço</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Barbeiro</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Hora</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.lastOrders.map((order: any) => (
                  <tr key={order.id} className="border-b border-hairline last:border-0">
                    <td className="py-3 px-4 text-ink">{order.client.name}</td>
                    <td className="py-3 px-4 text-muted">
                      {order.items[0]?.name || '-'}
                    </td>
                    <td className="py-3 px-4 text-muted">
                      {order.barber?.user.name || '-'}
                    </td>
                    <td className="py-3 px-4 text-muted">
                      {formatTime(order.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-ink font-medium">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={order.status === 'finished' ? 'default' : 'secondary'}
                        className={
                          order.status === 'finished'
                            ? 'bg-success text-white'
                            : ''
                        }
                      >
                        {order.status === 'finished' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {order.status === 'open' ? 'Aberta' :
                         order.status === 'in_service' ? 'Em atendimento' :
                         order.status === 'finished' ? 'Finalizada' : order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Trinks Sync Status */}
      {data.lastTrinksSync && (
        <div className="flex items-center justify-between p-4 rounded-lg bg-surface-soft border border-hairline">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-muted" />
            <div>
              <p className="text-sm font-medium text-ink">
                Última sincronização Trinks
              </p>
              <p className="text-xs text-muted">
                {new Date(data.lastTrinksSync.syncedAt).toLocaleString('pt-BR')} - {data.lastTrinksSync.count} agendamentos
              </p>
            </div>
          </div>
          <Badge variant={data.lastTrinksSync.status === 'success' ? 'default' : 'destructive'}>
            {data.lastTrinksSync.status === 'success' ? 'Sucesso' : 'Erro'}
          </Badge>
        </div>
      )}
    </div>
  );
}