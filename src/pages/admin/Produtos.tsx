import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { formatCurrency } from '@/lib/format';
import { Plus, Pencil, Trash2, RefreshCw, Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  active: boolean;
  category: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
  containsAlcohol: boolean;
}

export default function Produtos() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', categoryId: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/api/admin/products'),
        api.get('/api/admin/categories'),
      ]);
      setProducts(productsRes.data.products);
      setCategories(categoriesRes.data.categories);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        stock: product.stock.toString(),
        categoryId: product.category.id,
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: '', stock: '', categoryId: '' });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        categoryId: formData.categoryId,
      };

      if (editingProduct) {
        await api.put(`/api/admin/products/${editingProduct.id}`, data);
      } else {
        await api.post('/api/admin/products', data);
      }

      setDialogOpen(false);
      loadData();
    } catch (err) {
      console.error('Error saving product:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (product: Product) => {
    try {
      await api.patch(`/api/admin/products/${product.id}/toggle`);
      loadData();
    } catch (err) {
      console.error('Error toggling product:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este produto?')) return;
    
    try {
      await api.delete(`/api/admin/products/${id}`);
      loadData();
    } catch (err) {
      console.error('Error deleting product:', err);
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
          <h1 className="text-3xl font-medium text-ink">Produtos</h1>
          <p className="text-muted mt-1">Gerencie os produtos à venda</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-ink hover:bg-ink/90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <div className="rounded-lg border border-hairline overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-soft">
              <TableHead className="text-ink">Nome</TableHead>
              <TableHead className="text-ink">Categoria</TableHead>
              <TableHead className="text-ink">Preço</TableHead>
              <TableHead className="text-ink">Estoque</TableHead>
              <TableHead className="text-ink">Status</TableHead>
              <TableHead className="text-ink text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium text-ink">{product.name}</TableCell>
                <TableCell className="text-muted">{product.category.name}</TableCell>
                <TableCell className="text-ink">{formatCurrency(product.price)}</TableCell>
                <TableCell className="text-muted">{product.stock}</TableCell>
                <TableCell>
                  <Switch
                    checked={product.active}
                    onCheckedChange={() => handleToggle(product)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(product)}>
                      <Pencil className="w-4 h-4 text-muted" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
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
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Cerveja Original 600ml"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name} {cat.containsAlcohol && '(Contém álcool)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="12.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Estoque</Label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="50"
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