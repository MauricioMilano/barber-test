import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTotemFlow } from '@/lib/totem-flow-store';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function Idade() {
  const [validating, setValidating] = useState(true);
  const [isAdult, setIsAdult] = useState(false);
  const navigate = useNavigate();
  const { clientAge, selectedAppointment } = useTotemFlow();

  useEffect(() => {
    const timer = setTimeout(() => {
      setValidating(false);
      setIsAdult(clientAge >= 18);
    }, 2000);

    return () => clearTimeout(timer);
  }, [clientAge]);

  useEffect(() => {
    if (!validating) {
      const nextStep = isAdult ? '/totem/alcool' : '/totem/cortesia';
      setTimeout(() => navigate(nextStep), 500);
    }
  }, [validating, isAdult, navigate]);

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="bg-canvas rounded-2xl border border-hairline p-12 text-center">
        {validating ? (
          <>
            <Loader2 className="w-16 h-16 animate-spin text-signature-coral mx-auto mb-6" />
            <h1 className="text-2xl font-medium text-ink mb-2">
              Validando maioridade
            </h1>
            <p className="text-muted">Aguarde um momento...</p>
          </>
        ) : (
          <>
            <div className={`
              w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center
              ${isAdult ? 'bg-success/10' : 'bg-destructive/10'}
            `}>
              {isAdult ? (
                <ShieldCheck className="w-8 h-8 text-success" />
              ) : (
                <span className="text-2xl">🔒</span>
              )}
            </div>
            <h1 className="text-2xl font-medium text-ink mb-2">
              {isAdult ? 'Maior de 18 anos ✓' : 'Menor de 18 anos'}
            </h1>
            <p className="text-muted">
              {isAdult
                ? 'Você tem acesso a todas as opções.'
                : 'Algumas opções não estão disponíveis.'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}