import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTotemFlow } from '@/lib/totem-flow-store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Smartphone, Banknote, QrCode } from 'lucide-react';

type PaymentMethod = 'credit' | 'debit' | 'pix' | 'cash';

interface PaymentStep {
  method: PaymentMethod;
  icon: React.ReactNode;
  label: string;
  description: string;
}

const paymentSteps: PaymentStep[] = [
  { method: 'credit', icon: <CreditCard className="w-8 h-8" />, label: 'Crédito', description: 'Parcele em até 3x' },
  { method: 'debit', icon: <CreditCard className="w-8 h-8" />, label: 'Débito', description: 'Aproxime ou insira o cartão' },
  { method: 'pix', icon: <QrCode className="w-8 h-8" />, label: 'PIX', description: 'Escaneie o QR Code' },
  { method: 'cash', icon: <Banknote className="w-8 h-8" />, label: 'Dinheiro', description: 'Dirija-se ao caixa' },
];

export default function Pagamento() {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const { selectedAppointment, cortesiaItems, total, clientData, setOrderId, setPayment } = useTotemFlow();

  const processPayment = async (method: PaymentMethod) => {
    setProcessing(true);

    try {
      const orderResponse = await api.post('/totem/comanda', {
        clientId: clientData?.id,
        appointmentId: selectedAppointment?.id !== 'mock' ? selectedAppointment?.id : undefined,
        serviceId: selectedAppointment?.service?.id,
        cortesiaItems: cortesiaItems,
      });

      const orderId = orderResponse.data.order.id;
      setOrderId(orderId);

      const paymentResponse = await api.post('/totem/pagamento', {
        orderId,
        method,
      });

      if (paymentResponse.data.success) {
        setPayment(method, 'paid');
        navigate('/totem/sucesso');
      } else {
        alert('Pagamento não aprovado. Tente novamente.');
        setSelectedMethod(null);
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('Erro ao processar pagamento. Tente novamente.');
      setSelectedMethod(null);
    } finally {
      setProcessing(false);
    }
  };

  const handleBack = () => {
    navigate('/totem/comanda');
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-medium text-ink text-center mb-8">
        Escolha a forma de pagamento
      </h1>

      {processing ? (
        <div className="text-center py-12">
          <Loader2 className="w-16 h-16 animate-spin text-signature-coral mx-auto mb-6" />
          <h2 className="text-xl font-medium text-ink mb-2">
            Processando pagamento...
          </h2>
          <p className="text-muted">
            {selectedMethod === 'credit' || selectedMethod === 'debit'
              ? 'Aguarde a aprovação no terminal...'
              : selectedMethod === 'pix'
              ? 'Aguardando confirmação do PIX...'
              : 'Aguarde no caixa...'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {paymentSteps.map((step) => (
            <button
              key={step.method}
              onClick={() => {
                setSelectedMethod(step.method);
                processPayment(step.method);
              }}
              className="p-6 bg-canvas border-2 border-hairline rounded-xl hover:border-signature-coral transition-all text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-surface-soft flex items-center justify-center mx-auto mb-4">
                {step.icon}
              </div>
              <h3 className="text-lg font-medium text-ink">{step.label}</h3>
              <p className="text-sm text-muted mt-1">{step.description}</p>
            </button>
          ))}
        </div>
      )}

      {!processing && (
        <Button
          variant="ghost"
          onClick={handleBack}
          className="w-full mt-6 text-muted"
        >
          Voltar
        </Button>
      )}
    </div>
  );
}