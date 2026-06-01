import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { formatCurrency, formatTime } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, CheckCircle, Clock, ArrowLeft } from 'lucide-react';

interface Order {
  id: string;
  client: { name: string };
  items: { name: string; price: number; isCourtesy: boolean; quantity: number }[];
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  appointment?: {
    service: { name: string; duration: number };
    barber: { user: { name: string } };
    scheduledAt: string;
  };
}

export default function Atendimento() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  useEffect(() => {
    if (order && order.status === 'in_service') {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [order?.status]);

  const loadOrder = async () => {
    try {
      const response = await api.get(`/totem/comanda/${orderId}`);
      setOrder(response.data.order);

      // Calculate elapsed time
      if (response.data.order.createdAt) {
        const start = new Date(response.data.order.createdAt).getTime();
        const now = Date.now();
        setElapsed(Math.floor((now - start) / 1000));
      }
    } catch (err) {
      console.error('Error loading order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    try {
      await api.patch(`/totem/comanda/${orderId}`, {
        status: 'finished',
      });
      navigate('/barbeiro/fila');
    } catch (err) {
      console.error('Error finishing:', err);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-6 h-6 border-2 border-ink border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">Comanda não encontrada</p>
        <Button onClick={() => navigate('/barbeiro/fila')} className="mt-4">
          Voltar para fila
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/barbeiro/fila')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Client Info */}
      <Card className="border-hairline">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-ink text-white flex items-center justify-center text-xl font-medium">
                {order.client.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-medium text-ink">{order.client.name}</h2>
                <p className="text-muted">
                  {order.appointment?.service.name || 'Serviço'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-mono text-signature-coral">
                {formatTimer(elapsed)}
              </div>
              <p className="text-sm text-muted">Tempo de atendimento</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className="border-hairline">
        <CardHeader>
          <CardTitle className="text-lg text-ink">Resumo da Comanda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-hairline last:border-0"
              >
                <div className="flex items-center gap-2">
                  {item.isCourtesy && (
                    <Gift className="w-4 h-4 text-signature-yellow" />
                  )}
                  <span className={item.isCourtesy ? 'text-muted' : 'text-ink'}>
                    {item.name}
                  </span>
                  {item.isCourtesy && (
                    <Badge variant="secondary" className="text-xs">Cortesia</Badge>
                  )}
                </div>
                <div className="text-right">
                  {item.isCourtesy ? (
                    <span className="text-muted">Grátis</span>
                  ) : (
                    <span className="text-ink font-medium">{formatCurrency(item.price)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t-2 border-ink">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-ink">Total</span>
              <span className="text-2xl font-medium text-ink">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card className="border-hairline">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="text-ink">Pagamento confirmado</span>
          </div>
          <Badge className="bg-success/10 text-success border-success capitalize">
            {order.paymentMethod === 'pix' ? 'PIX' : 
             order.paymentMethod === 'credit' ? 'Crédito' :
             order.paymentMethod === 'debit' ? 'Débito' : 'Dinheiro'}
          </Badge>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          onClick={handleFinish}
          className="flex-1 bg-success hover:bg-success/90 text-white"
          size="lg"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Finalizar Atendimento
        </Button>
      </div>
    </div>
  );
}