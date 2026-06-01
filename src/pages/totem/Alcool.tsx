import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTotemFlow } from '@/lib/totem-flow-store';
import { Button } from '@/components/ui/button';
import { Wine, GlassWater } from 'lucide-react';

export default function Alcool() {
  const navigate = useNavigate();
  const { setAlcohol } = useTotemFlow();

  const handleChoice = (wants: boolean) => {
    setAlcohol(wants);
    navigate('/totem/cortesia');
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-medium text-ink mb-2">
          Deseja incluir bebida alcoólica?
        </h1>
        <p className="text-muted">
          Você pode selecionar uma cortesia com ou sem álcool
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleChoice(true)}
          className="p-8 bg-signature-coral rounded-2xl text-white hover:scale-[1.02] transition-transform"
        >
          <div className="flex flex-col items-center">
            <Wine className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-medium">Sim</h3>
            <p className="text-sm opacity-80 mt-1">Quero ver opções com álcool</p>
          </div>
        </button>

        <button
          onClick={() => handleChoice(false)}
          className="p-8 bg-signature-forest rounded-2xl text-white hover:scale-[1.02] transition-transform"
        >
          <div className="flex flex-col items-center">
            <GlassWater className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-medium">Não</h3>
            <p className="text-sm opacity-80 mt-1">Prefiro opções sem álcool</p>
          </div>
        </button>
      </div>

      <Button
        variant="ghost"
        onClick={() => navigate('/totem/cpf')}
        className="w-full mt-6 text-muted"
      >
        Voltar
      </Button>
    </div>
  );
}