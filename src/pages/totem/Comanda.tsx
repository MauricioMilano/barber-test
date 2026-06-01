import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTotemFlow } from '@/lib/totem-flow-store';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Gift, Plus, CreditCard } from 'lucide-react';

export default function Comanda() {
  const navigate = useNavigate();
  const { orderItems, cortesiaItems, total } = useTotemFlow();

  const handleAddMore = () => {
    navigate('/totem/cortesia');
  };

  const handleProceedToPayment = () => {
    navigate('/totem/pagamento');
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="bg-surface-dark rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart className="w-6 h-6" />
          <h1 className="text-2xl font-medium">Sua Comanda</h1>
        </div>

        <div className="space-y-4 mb-6">
          {orderItems.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-3 border-b border-white/20">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-white/60">Serviço</p>
              </div>
              <p className="font-medium">{formatCurrency(item.price)}</p>
            </div>
          ))}

          {cortesiaItems.length > 0 && cortesiaItems.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-3 border-b border-white/20">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-signature-yellow" />
                <p className="font-medium">{item.name}</p>
              </div>
              <p className="text-white/60">Cortesia</p>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-white/20">
          <div className="flex justify-between items-center">
            <p className="text-lg">Total a pagar</p>
            <p className="text-3xl font-medium">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button
          variant="outline"
          onClick={handleAddMore}
          className="flex-1 border-hairline"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar mais
        </Button>
        <Button
          onClick={handleProceedToPayment}
          className="flex-1 bg-ink hover:bg-ink/90"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Ir para pagamento
        </Button>
      </div>

      <Button
        variant="ghost"
        onClick={() => navigate('/totem/cortesia')}
        className="w-full mt-4 text-muted"
      >
        Voltar
      </Button>
    </div>
  );
}