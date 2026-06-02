import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MessageSquare, RefreshCw, Loader2, CheckCircle } from 'lucide-react';
import { formatDateTime } from '@/lib/format';

interface Survey {
  id: string;
  token: string;
  rating: number | null;
  comment: string | null;
  sentAt: string;
  sentVia: string;
  respondedAt: string | null;
  order: {
    id: string;
    client: { name: string };
    items: { name: string }[];
  };
}

export default function Pesquisas() {
  const [pesquisas, setPesquisas] = useState<Survey[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      const [pesqRes, statsRes] = await Promise.all([
        api.get('/api/admin/pesquisas', filter ? { params: { status: filter } } : {}),
        api.get('/api/admin/pesquisas/stats'),
      ]);
      setPesquisas(pesqRes.data.pesquisas);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error loading surveys:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-signature-yellow text-signature-yellow' : 'text-hairline'}`}
          />
        ))}
      </div>
    );
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
      <div>
        <h1 className="text-3xl font-medium text-ink">Pesquisas de Satisfação</h1>
        <p className="text-muted mt-1">Visualize o feedback dos clientes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-hairline">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-medium text-ink">{stats?.total || 0}</p>
            <p className="text-sm text-muted">Total Enviadas</p>
          </CardContent>
        </Card>
        <Card className="border-hairline">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-medium text-ink">{stats?.responded || 0}</p>
            <p className="text-sm text-muted">Respondidas</p>
          </CardContent>
        </Card>
        <Card className="border-hairline">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-medium text-ink">{stats?.pending || 0}</p>
            <p className="text-sm text-muted">Pendentes</p>
          </CardContent>
        </Card>
        <Card className="border-hairline">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-medium text-signature-yellow">
              {stats?.avgRating ? stats.avgRating.toFixed(1) : '-'}
            </p>
            <p className="text-sm text-muted">Nota Média</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('')}
          className={`px-3 py-1 rounded-full text-sm ${!filter ? 'bg-ink text-white' : 'bg-surface-soft text-muted'}`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('responded')}
          className={`px-3 py-1 rounded-full text-sm ${filter === 'responded' ? 'bg-ink text-white' : 'bg-surface-soft text-muted'}`}
        >
          Respondidas
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1 rounded-full text-sm ${filter === 'pending' ? 'bg-ink text-white' : 'bg-surface-soft text-muted'}`}
        >
          Pendentes
        </button>
        <button onClick={loadData} className="ml-auto p-2 rounded-md border border-hairline hover:bg-surface-soft">
                  <RefreshCw className="w-4 h-4" />
                </button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-hairline overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-soft">
              <TableHead className="text-ink">Cliente</TableHead>
              <TableHead className="text-ink">Serviço</TableHead>
              <TableHead className="text-ink">Avaliação</TableHead>
              <TableHead className="text-ink">Comentário</TableHead>
              <TableHead className="text-ink">Enviada em</TableHead>
              <TableHead className="text-ink">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pesquisas.map((pesquisa) => (
              <TableRow key={pesquisa.id}>
                <TableCell className="font-medium text-ink">{pesquisa.order.client.name}</TableCell>
                <TableCell className="text-muted">
                  {pesquisa.order.items[0]?.name || '-'}
                </TableCell>
                <TableCell>
                  {pesquisa.rating ? renderStars(pesquisa.rating) : '-'}
                </TableCell>
                <TableCell className="text-muted max-w-[200px] truncate">
                  {pesquisa.comment || '-'}
                </TableCell>
                <TableCell className="text-muted text-sm">
                  {formatDateTime(pesquisa.sentAt)}
                </TableCell>
                <TableCell>
                  {pesquisa.respondedAt ? (
                    <Badge className="bg-success/10 text-success border-success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Respondida
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {pesquisa.sentVia === 'whatsapp' ? 'WhatsApp' : 'Email'}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {pesquisas.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted">
                  Nenhuma pesquisa encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}