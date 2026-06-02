import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Loader2, Wine } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  containsAlcohol: boolean;
  _count?: { products: number };
}

export default function Categorias() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', containsAlcohol: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await api.get('/api/admin/categories');
      setCategories(response.data.categories);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, containsAlcohol: category.containsAlcohol });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', containsAlcohol: false });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = { name: formData.name, containsAlcohol: formData.containsAlcohol };

      if (editingCategory) {
        await api.put(`/api/admin/categories/${editingCategory.id}`, data);
      } else {
        await api.post('/api/admin/categories', data);
      }

      setDialogOpen(false);
      loadCategories();
    } catch (err) {
      console.error('Error saving category:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta categoria?')) return;
    
    try {
      await api.delete(`/api/admin/categories/${id}`);
      loadCategories();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao excluir categoria');
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
          <h1 className="text-3xl font-medium text-ink">Categorias</h1>
          <p className="text-muted mt-1">Gerencie categorias de produtos</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-ink hover:bg-ink/90">
          <Plus className="w-4 h-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      <div className="rounded-lg border border-hairline overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-soft">
              <TableHead className="text-ink">Nome</TableHead>
              <TableHead className="text-ink">Contém Álcool</TableHead>
              <TableHead className="text-ink">Produtos</TableHead>
              <TableHead className="text-ink text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium text-ink">{category.name}</TableCell>
                <TableCell>
                  {category.containsAlcohol && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-signature-coral/10 text-signature-coral text-xs">
                      <Wine className="w-3 h-3" />
                      Sim
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-muted">{category._count?.products || 0}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(category)}>
                      <Pencil className="w-4 h-4 text-muted" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
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
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Bebidas Alcoólicas"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="alcohol"
                checked={formData.containsAlcohol}
                onCheckedChange={(checked) => setFormData({ ...formData, containsAlcohol: checked })}
              />
              <Label htmlFor="alcohol">Contém bebida alcoólica</Label>
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