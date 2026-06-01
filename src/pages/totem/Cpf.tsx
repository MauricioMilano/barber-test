import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTotemFlow } from '@/lib/totem-flow-store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { formatCPF } from '@/lib/format';
import { Delete } from 'lucide-react';

export default function Cpf() {
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setCPF, setClientData } = useTotemFlow();

  const handleDigit = (digit: string) => {
    if (cpf.replace(/\D/g, '').length < 11) {
      const newCpf = cpf + digit;
      setCpf(newCpf);
      setError('');
    }
  };

  const handleDelete = () => {
    setCpf(cpf.slice(0, -1));
    setError('');
  };

  const handleConfirm = async () => {
    const cleanCpf = cpf.replace(/\D/g, '');
    
    if (cleanCpf.length !== 11) {
      setError('Digite os 11 números do CPF');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/totem/cliente/${cleanCpf}`);
      setCPF(cleanCpf);
      setClientData(response.data);
      navigate('/totem/agendamentos');
    } catch (err: any) {
      setError(err.response?.data?.error || 'CPF não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/totem');
  };

  const formatCpfDisplay = (value: string) => {
    const clean = value.replace(/\D/g, '');
    if (clean.length > 9) {
      return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
    } else if (clean.length > 6) {
      return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
    } else if (clean.length > 3) {
      return `${clean.slice(0, 3)}.${clean.slice(3)}`;
    }
    return clean;
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="bg-canvas rounded-2xl border border-hairline p-8">
        <h1 className="text-2xl font-medium text-ink text-center mb-8">
          Digite seu CPF
        </h1>

        <div className="bg-surface-soft rounded-xl p-4 mb-6 text-center">
          <span className="text-3xl font-mono tracking-wider text-ink">
            {formatCpfDisplay(cpf) || '000.000.000-00'}
          </span>
        </div>

        {error && (
          <div className="text-destructive text-sm text-center mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'].map((key, index) => (
            <button
              key={index}
              onClick={() => {
                if (key === 'del') handleDelete();
                else if (key !== '') handleDigit(String(key));
              }}
              disabled={key === ''}
              className={`
                h-16 rounded-xl text-xl font-medium transition-colors
                ${key === 'del' 
                  ? 'bg-surface-soft text-muted hover:bg-surface-strong' 
                  : key === ''
                    ? 'bg-transparent'
                    : 'bg-surface-soft text-ink hover:bg-surface-strong active:bg-hairline'
                }
                disabled:opacity-0
              `}
            >
              {key === 'del' ? <Delete className="w-6 h-6 mx-auto" /> : key}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1 h-12 border-hairline text-muted"
          >
            Voltar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || cpf.replace(/\D/g, '').length < 11}
            className="flex-1 h-12 bg-ink hover:bg-ink/90"
          >
            {loading ? 'Buscando...' : 'Confirmar'}
          </Button>
        </div>
      </div>
    </div>
  );
}