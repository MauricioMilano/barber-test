import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTotemFlow } from '@/lib/totem-flow-store';
import { CheckCircle, MessageSquare } from 'lucide-react';

export default function Sucesso() {
  const navigate = useNavigate();
  const { reset } = useTotemFlow();

  useEffect(() => {
    // Auto reset after 15 seconds
    const timer = setTimeout(() => {
      reset();
      navigate('/totem');
    }, 15000);

    return () => clearTimeout(timer);
  }, [reset, navigate]);

  const handleFinish = () => {
    reset();
    navigate('/totem');
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="bg-signature-forest rounded-2xl p-12 text-white text-center">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-medium mb-4">
          Pagamento Confirmado!
        </h1>

        <div className="space-y-2 mb-8">
          <p className="text-lg">
            Sua comanda está aberta
          </p>
          <p className="text-white/80">
            Chame seu barbeiro e aguarde ser chamado
          </p>
        </div>

        <div className="bg-white/10 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-2 justify-center">
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm">
              Enviaremos uma pesquisa de satisfação
            </span>
          </div>
        </div>

        <button
          onClick={handleFinish}
          className="w-full bg-white text-signature-forest rounded-xl py-4 font-medium hover:bg-white/90 transition-colors"
        >
          Finalizar
        </button>
      </div>

      <p className="text-center text-sm text-muted mt-4">
        Esta tela será resetada automaticamente em 15 segundos
      </p>
    </div>
  );
}