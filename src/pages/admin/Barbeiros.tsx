import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, RefreshCw, Loader2, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Barber {
  id: string;
  photoUrl: string | null;
  active: boolean;
  todayAppointments: number;
  user: { id: string; email: string; name: string; role: string };
}

export default function Barbeiros() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBarbers();
  }, []);

  const loadBarbers = async () => {
    try {
      const response = await api.get('/api/admin/barbeiros');
      setBarbers(response.data.barbeiros);
    } catch (err) {
      console.error('Error loading barbers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (barber?: Barber) => {
    if (barber) {
      setEditingBarber(barber);
      setFormData({ name: barber.user.name, email: barber.user.email, password: '' });
    } else {
      setEditingBarber(null);
      setFormData({ name: '', email: '', password: '' });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingBarber) {
        await api.put(`/api/admin/barbeiros/${editingBarber.id}`, { name: formData.name });
      } else {
        await api.post('/api/admin/barbeiros', {
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });
      }

      setDialogOpen(false);
      loadBarbers();
    } catch (err) {
      console.error('Error saving barber:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja desativar este barbeiro?')) return;
    
    try {
      await api.delete(`/api/admin/barbeiros/${id}`);
      loadBarbers();
    } catch (err) {
      console.error('Error deleting barber:', err);
    }
  };

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
          <h1 className="text-3xl font-medium text-ink">Barbeiros</h1>
          <p className="text-muted mt-1">Gerencie a equipe da barbearia</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-ink hover:bg-ink/90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Barbeiro
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {barbers.map((barber) => (
          <div
            key={barber.id}
            className={cn(
              'rounded-xl border border-hairline p-6',
              barber.active ? 'bg-canvas' : 'bg-surface-soft opacity-60'
            )}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-ink text-white flex items-center justify-center text-xl font-medium">
                {barber.user.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-ink">{barber.user.name}</h3>
                <p className="text-sm text-muted">{barber.user.email}</p>
              </div>
              <Badge variant={barber.active ? 'default' : 'secondary'}>
                {barber.active ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-hairline">
              <div className="text-sm">
                <span className="text-muted">Atendimentos hoje:</span>
                <span className="ml-1 font-medium text-ink">{barber.todayAppointments}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(barber)}>
                  <Pencil className="w-4 h-4 text-muted" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(barber.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-ink">
              {editingBarber ? 'Editar Barbeiro' : 'Novo Barbeiro'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="João Silva"
              />
            </div>
            {!editingBarber && (
              <>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="joao@barbearia.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Senha</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleSave}
              disabled={saving || (!editingBarber && (!formData.name || !formData.email || !formData.password))}
              className="bg-ink hover:bg-ink/90"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}