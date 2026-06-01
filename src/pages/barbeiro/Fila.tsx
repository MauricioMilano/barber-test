import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatTime } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';

interface QueueOrder {
  id: string;
  appointmentId?: string;
  client: { id?: string; name: string };
  items: { name: string; isCourtesy: boolean }[];
  total: number;
  status: 'open' | 'in_service' | 'finished';
  createdAt: string;
}

interface TodayStats {
  waiting: number;
  inService: number;
  finished: number;
}

export default function Fila() {
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<QueueOrder[]>([]);
  const [todayStats, setTodayStats] = useState<TodayStats>({ waiting: 0, inService: 0, finished: 0 });
  const [calling, setCalling] = useState<string | null>(null);

  const loadQueue = async () => {
    try {
      const response = await api.get('/admin/agendamentos/today');
      // Transform appointments into queue items
      const queueItems = response.data.agendamentos
        .filter((apt: any) => apt.status !== 'completed' && apt.status !== 'cancelled')
        .map((apt: any) => ({
          id: apt.order?.id || apt.id,
          appointmentId: apt.id,
          client: apt.client,
          items: [{ name: apt.service.name, isCourtesy: false }],
          total: apt.service.price,
          status: apt.status === 'in_service' ? 'in_service' : 'open',
          createdAt: apt.scheduledAt,
        }));

      setQueue(queueItems);

      // Calculate stats
      setTodayStats({
        waiting: queueItems.filter((q: QueueOrder) => q.status === 'open').length,
        inService: queueItems.filter((q: QueueOrder) => q.status === 'in_service').length,
        finished: 0,
      });
    } catch (err) {
      console.error('Error loading queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleCallNext = async (item: QueueOrder) => {
    setCalling(item.id);
    try {
      if (item.appointmentId) {
        await api.patch(`/admin/agendamentos/${item.appointmentId}`, {
          status: 'in_service',
        });
      }
      loadQueue();
    } catch (err) {
      console.error('Error calling next:', err);
    } finally {
      setCalling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  const waitingQueue = queue.filter((q) => q.status === 'open');
  const inServiceQueue = queue.filter((q) => q.status === 'in_service');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium text-ink">Fila de Atendimento</h1>
          <p className="text-muted mt-1">Gerencie sua fila de clientes</p>
        </div>
        <Button variant="outline" onClick={loadQueue}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-hairline">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-medium text-ink">{todayStats.waiting}</p>
            <p className="text-sm text-muted">Aguardando</p>
          </CardContent>
        </Card>
        <Card className="border-hairline bg-signature-coral/5">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-medium text-signature-coral">{todayStats.inService}</p>
            <p className="text-sm text-muted">Em atendimento</p>
          </CardContent>
        </Card>
        <Card className="border-hairline">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-medium text-ink">{todayStats.finished}</p>
            <p className="text-sm text-muted">Finalizados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Waiting */}
        <Card className="border-hairline">
          <CardHeader className="bg-surface-soft border-b border-hairline">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-ink flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Aguardando
              </CardTitle>
              <Badge>{waitingQueue.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {waitingQueue.length === 0 ? (
                <p className="text-center text-muted py-8">Nenhum cliente aguardando</p>
              ) : (
                waitingQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-surface-soft rounded-xl border border-hairline"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center text-sm font-medium">
                          {item.client.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-ink">{item.client.name}</p>
                          <p className="text-sm text-muted">{item.items[0]?.name}</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleCallNext(item)}
                      disabled={calling === item.id}
                      className="w-full bg-ink hover:bg-ink/90"
                    >
                      {calling === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Phone className="w-4 h-4 mr-2" />
                      )}
                      Chamar próximo
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* In Service */}
        <Card className="border-hairline">
          <CardHeader className="bg-signature-coral/5 border-b border-hairline">
            <CardTitle className="text-lg text-ink flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Em Atendimento
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {inServiceQueue.length === 0 ? (
                <p className="text-center text-muted py-8">Nenhum cliente em atendimento</p>
              ) : (
                inServiceQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-signature-coral/5 rounded-xl border border-signature-coral"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-signature-coral text-white flex items-center justify-center text-sm font-medium">
                          {item.client.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-ink">{item.client.name}</p>
                          <p className="text-sm text-muted">{item.items[0]?.name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-center py-2">
                      <Badge className="bg-signature-coral text-white">Em Atendimento</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}