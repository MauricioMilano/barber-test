import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCPF, formatPhone } from '@/lib/format';
import { Plus, Search, RefreshCw, Loader2, User, Phone, Mail } from 'lucide-react';

interface Client {
  id: string;
  cpf: string;
  name: string;
  phone: string | null;
  email: string | null;
  _count: { appointments: number; orders: number };
}

export default function Clientes() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ cpf: '', name: '', phone: '', email: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadClients();
  }, [search]);

  const loadClients = async () => {
    try {
      const params = search ? { search } : {};
      const response = await api.get('/api/admin/clientes', { params });
      setClients(response.data.clientes);
    } catch (err) {
      console.error('Error loading clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({ cpf: '', name: '', phone: '', email: '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/api/admin/clientes', {
        cpf: formData.cpf.replace(/\D/g, ''),
        name: formData.name,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
      });

      setDialogOpen(false);
      loadClients();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao salvar cliente');
    } finally {
      setSaving(false);
    }
  };

  const formatCPFInput = (value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 11);
    if (clean.length > 9) {
      return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
    } else if (clean.length > 6) {
      return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
    } else if (clean.length > 3) {
      return `${clean.slice(0, 3)}.${clean.slice(3)}`;
    }
    return clean;
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
          <h1 className="text-3xl font-medium text-ink">Clientes</h1>
          <p className="text-muted mt-1">Base de clientes da barbearia</p>
        </div>
        <Button onClick={handleOpenDialog} className="bg-ink hover:bg-ink/90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, CPF ou telefone..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={loadClients}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="rounded-lg border border-hairline overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-soft">
              <TableHead className="text-ink">Nome</TableHead>
              <TableHead className="text-ink">CPF</TableHead>
              <TableHead className="text-ink">Telefone</TableHead>
              <TableHead className="text-ink">Email</TableHead>
              <TableHead className="text-ink">Agendamentos</TableHead>
              <TableHead className="text-ink">Comandas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium text-ink">{client.name}</TableCell>
                <TableCell className="text-muted font-mono text-sm">{formatCPF(client.cpf)}</TableCell>
                <TableCell className="text-muted">{client.phone ? formatPhone(client.phone) : '-'}</TableCell>
                <TableCell className="text-muted">{client.email || '-'}</TableCell>
                <TableCell className="text-ink">{client._count.appointments}</TableCell>
                <TableCell className="text-ink">{client._count.orders}</TableCell>
              </TableRow>
            ))}
            {clients.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted">
                  Nenhum cliente encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-ink">Novo Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: formatCPFInput(e.target.value) })}
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formData.cpf || !formData.name}
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