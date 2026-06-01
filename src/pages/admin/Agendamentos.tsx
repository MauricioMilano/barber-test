import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar, daysOfWeek, shortMonths } from '@/lib/format';
import { formatTime } from '@/lib/format';
import { Plus, RefreshCw, Loader2, ArrowLeft, ArrowRight, CalendarDays, RefreshCwIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Appointment {
  id: string;
  scheduledAt: string;
  status: string;
  source: string;
  client: { id: string; name: string; cpf: string };
  service: { id: string; name: string; price: number };
  barber: { id: string; user: { name: string } };
}

interface Barber { id: string; user: { name: string } }
interface Service { id: string; name: string; price: number }
interface Client { id: string; name: string; cpf: string }

export default function Agendamentos() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '', barberId: '', serviceId: '',
    date: '', time: ''
  });

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    try {
      const [apptRes, barbersRes, servicesRes, clientsRes] = await Promise.all([
        api.get('/admin/agendamentos', { params: { date: currentDate.toISOString() } }),
        api.get('/admin/barbeiros'),
        api.get('/admin/services'),
        api.get('/admin/clientes'),
      ]);
      setAppointments(apptRes.data.agendamentos);
      setBarbers(barbersRes.data.barbeiros);
      setServices(servicesRes.data.services);
      setClients(clientsRes.data.clientes);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncTrinks = async () => {
    setSyncing(true);
    try {
      await api.post('/admin/trinks/sync');
      loadData();
    } catch (err) {
      console.error('Error syncing:', err);
    } finally {
      setSyncing(false);
    }
  };

  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      return day;
    });
  };

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter((a) => {
      const aDate = new Date(a.scheduledAt);
      return aDate.toDateString() === day.toDateString();
    });
  };

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleOpenDialog = () => {
    setFormData({ clientId: '', barberId: '', serviceId: '', date: '', time: '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const scheduledAt = new Date(`${formData.date}T${formData.time}`);
      await api.post('/admin/agendamentos', {
        clientId: formData.clientId,
        barberId: formData.barberId,
        serviceId: formData.serviceId,
        scheduledAt: scheduledAt.toISOString(),
      });
      setDialogOpen(false);
      loadData();
    } catch (err) {
      console.error('Error saving appointment:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      scheduled: 'bg-info/10 text-info border-info',
      in_service: 'bg-signature-coral/10 text-signature-coral border-signature-coral',
      completed: 'bg-success/10 text-success border-success',
      cancelled: 'bg-destructive/10 text-destructive border-destructive',
    };
    return variants[status] || 'bg-surface-soft text-muted';
  };

  const weekDays = getWeekDays();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium text-ink">Agendamentos</h1>
          <p className="text-muted mt-1">Gerencie a agenda da barbearia</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSyncTrinks} disabled={syncing}>
            {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCwIcon className="w-4 h-4 mr-2" />}
            Sincronizar Trinks
          </Button>
          <Button onClick={handleOpenDialog} className="bg-ink hover:bg-ink/90">
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-surface-soft border border-hairline">
        <Button variant="outline" onClick={handlePrevWeek}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>
        <div className="text-lg font-medium text-ink">
          {shortMonths[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        <Button variant="outline" onClick={handleNextWeek}>
          Próxima
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dayAppointments = getAppointmentsForDay(day);
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <div key={day.toISOString()} className="min-h-[200px]">
              <div className={`
                p-2 rounded-t-lg text-center font-medium
                ${isToday ? 'bg-ink text-white' : 'bg-surface-soft text-ink'}
              `}>
                <div className="text-xs">{daysOfWeek[day.getDay()]}</div>
                <div className="text-lg">{day.getDate()}</div>
              </div>
              <div className="p-2 border border-hairline border-t-0 rounded-b-lg min-h-[160px] space-y-1">
                {dayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className={`
                      p-2 rounded text-xs cursor-pointer hover:bg-surface-soft
                      ${apt.status === 'in_service' ? 'bg-signature-coral/10 border-l-2 border-signature-coral' : 'bg-surface-soft'}
                    `}
                  >
                    <div className="font-medium truncate">{apt.client.name}</div>
                    <div className="text-muted truncate">{apt.service.name}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-muted">{formatTime(apt.scheduledAt)}</span>
                      <Badge variant="outline" className={`text-[10px] ${getStatusBadge(apt.status)}`}>
                        {apt.source === 'trinks' ? 'T' : 'M'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-ink">Novo Agendamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente</label>
              <Select value={formData.clientId} onValueChange={(v) => setFormData({ ...formData, clientId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Serviço</label>
              <Select value={formData.serviceId} onValueChange={(v) => setFormData({ ...formData, serviceId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {services.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Barbeiro</label>
              <Select value={formData.barberId} onValueChange={(v) => setFormData({ ...formData, barberId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {barbers.map((b) => <SelectItem key={b.id} value={b.id}>{b.user.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Data</label>
                            <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Horário</label>
                            <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                          </div>
                        </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!formData.clientId || !formData.serviceId || !formData.barberId} className="bg-ink hover:bg-ink/90">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}