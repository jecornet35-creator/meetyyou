import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2, Percent, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

export default function AdminPromoCodes() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    valid_from: '',
    valid_until: '',
    max_uses: '',
    min_purchase_amount: '',
    applicable_plans: [],
    is_active: true,
  });

  const { data: promoCodes = [] } = useQuery({
    queryKey: ['promo-codes'],
    queryFn: () => base44.entities.PromoCode.list('-created_date', 200),
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => base44.entities.SubscriptionPlan.list('-created_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PromoCode.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('Code promo créé');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PromoCode.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('Code promo mis à jour');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PromoCode.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      toast.success('Code promo supprimé');
    },
  });

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      valid_from: '',
      valid_until: '',
      max_uses: '',
      min_purchase_amount: '',
      applicable_plans: [],
      is_active: true,
    });
    setEditingCode(null);
  };

  const handleEdit = (code) => {
    setEditingCode(code);
    setFormData({
      code: code.code || '',
      description: code.description || '',
      discount_type: code.discount_type || 'percentage',
      discount_value: code.discount_value || '',
      valid_from: code.valid_from ? code.valid_from.split('T')[0] : '',
      valid_until: code.valid_until ? code.valid_until.split('T')[0] : '',
      max_uses: code.max_uses || '',
      min_purchase_amount: code.min_purchase_amount || '',
      applicable_plans: code.applicable_plans || [],
      is_active: code.is_active !== false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const data = {
      ...formData,
      discount_value: Number(formData.discount_value),
      max_uses: formData.max_uses ? Number(formData.max_uses) : undefined,
      min_purchase_amount: formData.min_purchase_amount ? Number(formData.min_purchase_amount) : undefined,
      valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : undefined,
      valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : undefined,
    };

    if (editingCode) {
      updateMutation.mutate({ id: editingCode.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isExpired = (code) => {
    if (!code.valid_until) return false;
    return new Date(code.valid_until) < new Date();
  };

  const isMaxedOut = (code) => {
    return code.max_uses && code.current_uses >= code.max_uses;
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar currentPage="AdminPromoCodes" />
      
      <div className="flex-1 p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Codes promotionnels</h1>
            <p className="text-gray-500 mt-1">Gérez les offres et codes promo</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700" onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau code
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingCode ? 'Modifier le code' : 'Créer un code promo'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Code *</label>
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="PROMO2026"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type de réduction *</label>
                    <Select value={formData.discount_type} onValueChange={(v) => setFormData({ ...formData, discount_type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Pourcentage</SelectItem>
                        <SelectItem value="fixed">Montant fixe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description du code promo"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      Valeur * {formData.discount_type === 'percentage' ? '(%)' : '(€)'}
                    </label>
                    <Input
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                      placeholder={formData.discount_type === 'percentage' ? '20' : '10'}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Montant minimum d'achat (€)</label>
                    <Input
                      type="number"
                      value={formData.min_purchase_amount}
                      onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })}
                      placeholder="Optionnel"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Date de début</label>
                    <Input
                      type="date"
                      value={formData.valid_from}
                      onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date de fin</label>
                    <Input
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Nombre max d'utilisations</label>
                  <Input
                    type="number"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                    placeholder="Illimité"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Code actif</label>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingCode ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Réduction</TableHead>
                <TableHead>Utilisations</TableHead>
                <TableHead>Validité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoCodes.map((code) => (
                <TableRow key={code.id}>
                  <TableCell className="font-medium">{code.code}</TableCell>
                  <TableCell className="text-sm">{code.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {code.discount_type === 'percentage' ? (
                        <>
                          <Percent className="w-4 h-4" />
                          <span>{code.discount_value}%</span>
                        </>
                      ) : (
                        <span>{code.discount_value}€</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {code.current_uses || 0}
                    {code.max_uses && ` / ${code.max_uses}`}
                  </TableCell>
                  <TableCell className="text-sm">
                    {code.valid_until ? (
                      <span className={isExpired(code) ? 'text-red-600' : ''}>
                        {format(new Date(code.valid_until), 'dd/MM/yyyy', { locale: fr })}
                      </span>
                    ) : (
                      'Illimitée'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      !code.is_active ? 'bg-gray-100 text-gray-700' :
                      isExpired(code) || isMaxedOut(code) ? 'bg-red-100 text-red-700' :
                      'bg-green-100 text-green-700'
                    }>
                      {!code.is_active ? 'Inactif' :
                       isExpired(code) ? 'Expiré' :
                       isMaxedOut(code) ? 'Épuisé' :
                       'Actif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(code)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => {
                          if (confirm('Supprimer ce code ?')) {
                            deleteMutation.mutate(code.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}