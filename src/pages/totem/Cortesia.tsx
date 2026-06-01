import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTotemFlow } from '@/lib/totem-flow-store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Gift, Loader2, SkipForward } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
}

interface CortesiaRule {
  id: string;
  quantity: number;
  category: {
    id: string;
    name: string;
    containsAlcohol: boolean;
    products: Product[];
  };
}

export default function Cortesia() {
  const [loading, setLoading] = useState(true);
  const [cortesias, setCortesias] = useState<CortesiaRule[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const navigate = useNavigate();
  const { selectedAppointment, wantsAlcohol, setCortesiaItems } = useTotemFlow();

  useEffect(() => {
    loadCortesias();
  }, []);

  const loadCortesias = async () => {
    if (!selectedAppointment?.service?.id) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/totem/cortesia/${selectedAppointment.service.id}`);
      const rules = response.data.cortesias || [];
      
      const filteredRules = wantsAlcohol 
        ? rules 
        : rules.filter((r: CortesiaRule) => !r.category.containsAlcohol);

      setCortesias(filteredRules);
    } catch (err) {
      console.error('Error loading cortesias:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleConfirm = () => {
    if (selectedProduct) {
      setCortesiaItems([{ productId: selectedProduct.id, name: selectedProduct.name, quantity: 1 }]);
    }
    navigate('/totem/comanda');
  };

  const handleSkip = () => {
    setCortesiaItems([]);
    navigate('/totem/comanda');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-signature-coral mb-4" />
        <p className="text-muted">Carregando opções...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-signature-cream flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-signature-coral" />
        </div>
        <h1 className="text-2xl font-medium text-ink mb-2">
          Escolha sua cortesia
        </h1>
        <p className="text-muted">
          Seu serviço: {selectedAppointment?.service?.name || 'Serviço'}
        </p>
      </div>

      {cortesias.length > 0 ? (
        <div className="space-y-6">
          {cortesias.map((cortesia) => (
            <div key={cortesia.id}>
              <h3 className="text-sm font-medium text-muted mb-3">
                {cortesia.category.name} (até {cortesia.quantity})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {cortesia.category.products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className={`
                      p-4 rounded-xl border-2 transition-all text-left
                      ${selectedProduct?.id === product.id
                        ? 'border-signature-coral bg-signature-coral/5'
                        : 'border-hairline hover:border-signature-coral/50'
                      }
                    `}
                  >
                    <p className="font-medium text-ink">{product.name}</p>
                    <p className="text-sm text-muted">Cortesia</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted mb-4">
            Nenhuma cortesia disponível para este serviço
          </p>
        </div>
      )}

      <div className="flex gap-3 mt-8">
        <Button
          variant="outline"
          onClick={handleSkip}
          className="flex-1 border-hairline"
        >
          <SkipForward className="w-4 h-4 mr-2" />
          Pular
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!selectedProduct && cortesias.length > 0}
          className="flex-1 bg-ink hover:bg-ink/90"
        >
          Confirmar
        </Button>
      </div>

      <Button
        variant="ghost"
        onClick={() => navigate('/totem/alcool')}
        className="w-full mt-4 text-muted"
      >
        Voltar
      </Button>
    </div>
  );
}