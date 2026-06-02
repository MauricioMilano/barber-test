import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/format';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { RefreshCw, Loader2, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';

const COLORS = ['#aa2d00', '#0a2e0e', '#f5e9d4', '#fcab79'];

export default function Relatorios() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    try {
      const response = await api.get('/api/admin/relatorios', { params: dateRange });
      setStats(response.data);
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium text-ink">Relatórios</h1>
          <p className="text-muted mt-1">Análise de desempenho da barbearia</p>
        </div>
        <div className="flex items-center gap-4">
          <Input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="w-40"
          />
          <span className="text-muted">até</span>
          <Input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="w-40"
          />
          <Button variant="outline" onClick={loadReports}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-hairline">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-signature-coral/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-signature-coral" />
            </div>
            <div>
              <p className="text-sm text-muted">Faturamento Total</p>
              <p className="text-2xl font-medium text-ink">{formatCurrency(stats?.totals?.totalRevenue || 0)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-hairline">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-signature-forest/10 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-signature-forest" />
            </div>
            <div>
              <p className="text-sm text-muted">Total de Comandas</p>
              <p className="text-2xl font-medium text-ink">{stats?.totals?.totalOrders || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-hairline">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-surface-dark/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-surface-dark" />
            </div>
            <div>
              <p className="text-sm text-muted">Ticket Médio</p>
              <p className="text-2xl font-medium text-ink">{formatCurrency(stats?.totals?.avgOrder || 0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Services */}
        <Card className="border-hairline">
          <CardHeader>
            <CardTitle className="text-lg text-ink">Serviços Mais Contratados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.topServices?.map((service: any, index: number) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-soft flex items-center justify-center text-sm font-medium text-ink">
                      {index + 1}
                    </div>
                    <span className="text-ink">{service.name}</span>
                  </div>
                  <Badge>{service._count}x</Badge>
                </div>
              ))}
              {!stats?.topServices?.length && (
                <p className="text-sm text-muted text-center py-4">Nenhum dado disponível</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="border-hairline">
          <CardHeader>
            <CardTitle className="text-lg text-ink">Formas de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.paymentMethods?.length ? (
              <div className="flex items-center gap-8">
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.paymentMethods}
                        dataKey="_count"
                        nameKey="paymentMethod"
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                      >
                        {stats.paymentMethods.map((_: any, index: number) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {stats.paymentMethods.map((method: any, index: number) => (
                    <div key={method.paymentMethod} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-sm text-muted capitalize">{method.paymentMethod}</span>
                      <span className="text-sm font-medium text-ink">{method._count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted text-center py-4">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}