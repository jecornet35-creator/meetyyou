import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSubscriptionPlans() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    duration_days: '30',
    features: '',
    max_messages_per_day: '',
    max_likes_per_day: '',
    can_see_who_liked: false,
    can_use_advanced_filters: false,
    priority_support: false,
    is_active: true,
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => base44.entities.SubscriptionPlan.list('-created_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SubscriptionPlan.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('Plan créé avec succès');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SubscriptionPlan.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('Plan mis à jour');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SubscriptionPlan.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success('Plan supprimé');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: '',
      duration_days: '30',
      features: '',
      max_messages_per_day: '',
      max_likes_per_day: '',
      can_see_who_liked: false,
      can_use_advanced_filters: false,
      priority_support: false,
      is_active: true,
    });
    setEditingPlan(null);
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name || '',
      slug: plan.slug || '',
      description: plan.description || '',
      price: plan.price || '',
      duration_days: plan.duration_days || '30',
      features: (plan.features || []).join('\n'),
      max_messages_per_day: plan.max_messages_per_day || '',
      max_likes_per_day: plan.max_likes_per_day || '',
      can_see_who_liked: plan.can_see_who_liked || false,
      can_use_advanced_filters: plan.can_use_advanced_filters || false,
      priority_support: plan.priority_support || false,
      is_active: plan.is_active !== false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const data = {
      ...formData,
      price: Number(formData.price),
      duration_days: Number(formData.duration_days),
      max_messages_per_day: formData.max_messages_per_day ? Number(formData.max_messages_per_day) : undefined,
      max_likes_per_day: formData.max_likes_per_day ? Number(formData.max_likes_per_day) : undefined,
      features: formData.features.split('\n').filter(f => f.trim()),
    };

    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar currentPage="AdminSubscriptionPlans" />
      
      <div className="flex-1 p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Plans d'abonnement</h1>
            <p className="text-gray-500 mt-1">Gérez les différents niveaux d'abonnement</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700" onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPlan ? 'Modifier le plan' : 'Créer un nouveau plan'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nom du plan *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Premium"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Slug *</label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="premium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description du plan"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Prix (€) *</label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="19.99"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Durée (jours)</label>
                    <Input
                      type="number"
                      value={formData.duration_days}
                      onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Fonctionnalités (une par ligne)</label>
                  <Textarea
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder="Messages illimités&#10;Filtres avancés&#10;Badge vérifié"
                    rows={5}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Messages/jour</label>
                    <Input
                      type="number"
                      value={formData.max_messages_per_day}
                      onChange={(e) => setFormData({ ...formData, max_messages_per_day: e.target.value })}
                      placeholder="Illimité"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Likes/jour</label>
                    <Input
                      type="number"
                      value={formData.max_likes_per_day}
                      onChange={(e) => setFormData({ ...formData, max_likes_per_day: e.target.value })}
                      placeholder="Illimité"
                    />
                  </div>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Voir qui a liké</label>
                    <Switch
                      checked={formData.can_see_who_liked}
                      onCheckedChange={(checked) => setFormData({ ...formData, can_see_who_liked: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Filtres avancés</label>
                    <Switch
                      checked={formData.can_use_advanced_filters}
                      onCheckedChange={(checked) => setFormData({ ...formData, can_use_advanced_filters: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Support prioritaire</label>
                    <Switch
                      checked={formData.priority_support}
                      onCheckedChange={(checked) => setFormData({ ...formData, priority_support: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Plan actif</label>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingPlan ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className={!plan.is_active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <p className="text-3xl font-bold mt-2">{plan.price}€<span className="text-sm text-gray-500">/mois</span></p>
                  </div>
                  <Badge className={plan.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                    {plan.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                
                <div className="space-y-2 mb-4">
                  {plan.features?.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 text-xs text-gray-500 mb-4">
                  {plan.max_messages_per_day && (
                    <div>Messages: {plan.max_messages_per_day}/jour</div>
                  )}
                  {plan.max_likes_per_day && (
                    <div>Likes: {plan.max_likes_per_day}/jour</div>
                  )}
                  {plan.can_see_who_liked && <div>✓ Voir qui a liké</div>}
                  {plan.can_use_advanced_filters && <div>✓ Filtres avancés</div>}
                  {plan.priority_support && <div>✓ Support prioritaire</div>}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(plan)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      if (confirm('Supprimer ce plan ?')) {
                        deleteMutation.mutate(plan.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}