import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/format';
import { Plus, Pencil, Trash2, RefreshCw, Loader2 } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  active: boolean;
}

export default function Servicos() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({ name: '', category: '', price: '', duration: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await api.get('/admin/services');
      setServices(response.data.services);
    } catch (err) {
      console.error('Error loading services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        category: service.category,
        price: service.price.toString(),
        duration: service.duration.toString(),
      });
    } else {
      setEditingService(null);
      setFormData({ name: '', category: '', price: '', duration: '' });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
      };

      if (editingService) {
        await api.put(`/admin/services/${editingService.id}`, data);
      } else {
        await api.post('/admin/services', data);
      }

      setDialogOpen(false);
      loadServices();
    } catch (err) {
      console.error('Error saving service:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (service: Service) => {
    try {
      await api.patch(`/admin/services/${service.id}/toggle`);
      loadServices();
    } catch (err) {
      console.error('Error toggling service:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este serviço?')) return;
    
    try {
      await api.delete(`/admin/services/${id}`);
      loadServices();
    } catch (err) {
      console.error('Error deleting service:', err);
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
          <h1 className="text-3xl font-medium text-ink">Serviços</h1>
          <p className="text-muted mt-1">Gerencie os serviços da barbearia</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-ink hover:bg-ink/90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      <div className="rounded-lg border border-hairline overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-soft">
              <TableHead className="text-ink">Nome</TableHead>
              <TableHead className="text-ink">Categoria</TableHead>
              <TableHead className="text-ink">Preço</TableHead>
              <TableHead className="text-ink">Duração</TableHead>
              <TableHead className="text-ink">Status</TableHead>
              <TableHead className="text-ink text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium text-ink">{service.name}</TableCell>
                <TableCell className="text-muted">{service.category}</TableCell>
                <TableCell className="text-ink">{formatCurrency(service.price)}</TableCell>
                <TableCell className="text-muted">{service.duration} min</TableCell>
                <TableCell>
                  <Switch
                    checked={service.active}
                    onCheckedChange={() => handleToggle(service)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(service)}
                    >
                      <Pencil className="w-4 h-4 text-muted" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(service.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-ink">
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Corte Masculino"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Cabelo"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="45.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Duração (min)</Label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="30"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-ink hover:bg-ink/90">
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}