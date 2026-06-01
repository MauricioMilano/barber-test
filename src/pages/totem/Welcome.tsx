import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Hand } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/totem/cpf');
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <button
        onClick={handleStart}
        className="w-full bg-signature-coral rounded-2xl p-12 text-white hover:scale-[1.02] transition-transform cursor-pointer"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center mb-8">
            <Hand className="w-12 h-12" />
          </div>
          
          <h1 className="text-4xl font-medium mb-4">Bem-vindo!</h1>
          <p className="text-xl opacity-90 max-w-md">
            Toque para começar o seu check-in
          </p>
        </div>
      </button>
    </div>
  );
}