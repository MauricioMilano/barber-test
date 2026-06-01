import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTotemFlow } from '@/lib/totem-flow-store';
import { api } from '@/lib/api';
import { formatTime } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle } from 'lucide-react';

export default function Agendamentos() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const navigate = useNavigate();
  const { cpf, clientData, selectAppointment } = useTotemFlow();

  React.useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await api.get(`/totem/cliente/${cpf}`);
      if (response.data.client) {
        setAppointments(response.data.client.appointments || []);
      }
    } catch (err) {
      console.error('Error loading appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAppointment = (appointment: any) => {
      // Store the service info directly
      selectAppointment(appointment as any);
      navigate('/totem/idade');
    };

  const handleContinueWithoutAppointment = () => {
    const mockAppointment = {
      id: 'mock',
      service: { id: '1', name: 'Corte Masculino', price: 45, duration: 30 },
    };
    selectAppointment(mockAppointment);
    navigate('/totem/idade');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-signature-coral mb-4" />
        <p className="text-muted">Buscando seus agendamentos...</p>
      </div>
    );
  }

  const clientName = clientData?.name?.split(' ')[0] || 'Cliente';

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-medium text-ink mb-2">
          Olá, {clientName}!
        </h1>
        <p className="text-muted">Selecione seu agendamento</p>
      </div>

      {appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map((apt: any) => (
            <button
              key={apt.id}
              onClick={() => handleSelectAppointment(apt)}
              className="w-full p-6 bg-canvas border border-hairline rounded-xl hover:border-signature-coral hover:bg-signature-coral/5 transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-ink">{apt.service.name}</h3>
                  <p className="text-sm text-muted mt-1">
                    com {apt.barber.user.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-medium text-ink">
                    {formatTime(apt.scheduledAt)}
                  </p>
                  <p className="text-sm text-muted">Horário</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-surface-soft flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-muted" />
          </div>
          <h3 className="text-lg font-medium text-ink mb-2">
            Você não tem agendamentos hoje
          </h3>
          <p className="text-muted mb-6">
            Chame um barbeiro para ser atendido
          </p>
          <Button
            variant="outline"
            onClick={handleContinueWithoutAppointment}
            className="border-hairline"
          >
            Continuar mesmo assim
          </Button>
        </div>
      )}

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