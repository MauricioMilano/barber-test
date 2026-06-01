import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Loader2, Gift } from 'lucide-react';

interface CortesiaRule {
  id: string;
  quantity: number;
  service: { id: string; name: string };
  category: { id: string; name: string; containsAlcohol: boolean };
}

interface Service {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  containsAlcohol: boolean;
}

export default function Cortesias() {
  const [cortesias, setCortesias] = useState<CortesiaRule[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ serviceId: '', categoryId: '', quantity: '1' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cortesiasRes, servicesRes, categoriesRes] = await Promise.all([
        api.get('/admin/cortesias'),
        api.get('/admin/services'),
        api.get('/admin/categories'),
      ]);
      setCortesias(cortesiasRes.data.cortesias);
      setServices(servicesRes.data.services);
      setCategories(categoriesRes.data.categories);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({ serviceId: '', categoryId: '', quantity: '1' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/admin/cortesias', {
        serviceId: formData.serviceId,
        categoryId: formData.categoryId,
        quantity: parseInt(formData.quantity),
      });

      setDialogOpen(false);
      loadData();
    } catch (err) {
      console.error('Error saving cortesia:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta regra?')) return;
    
    try {
      await api.delete(`/admin/cortesias/${id}`);
      loadData();
    } catch (err) {
      console.error('Error deleting cortesia:', err);
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
          <h1 className="text-3xl font-medium text-ink">Cortesias</h1>
          <p className="text-muted mt-1">Regras de cortesia por serviço</p>
        </div>
        <Button onClick={handleOpenDialog} className="bg-ink hover:bg-ink/90">
          <Plus className="w-4 h-4 mr-2" />
          Nova Regra
        </Button>
      </div>

      <div className="rounded-lg border border-hairline overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-soft">
              <TableHead className="text-ink">Serviço</TableHead>
              <TableHead className="text-ink">Categoria</TableHead>
              <TableHead className="text-ink">Quantidade</TableHead>
              <TableHead className="text-ink text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cortesias.map((cortesia) => (
              <TableRow key={cortesia.id}>
                <TableCell className="font-medium text-ink">{cortesia.service.name}</TableCell>
                <TableCell className="text-muted">{cortesia.category.name}</TableCell>
                <TableCell className="text-ink">{cortesia.quantity} item(s)</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(cortesia.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {cortesias.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted">
                  Nenhuma regra de cortesia cadastrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-ink">Nova Regra de Cortesia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Serviço</Label>
              <Select value={formData.serviceId} onValueChange={(v) => setFormData({ ...formData, serviceId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoria de Cortesia</Label>
              <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !formData.serviceId || !formData.categoryId} className="bg-ink hover:bg-ink/90">
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}