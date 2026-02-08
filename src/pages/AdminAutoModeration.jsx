import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, Plus, Edit, Trash2, AlertTriangle, Clock, Ban, Flag } from 'lucide-react';

export default function AdminAutoModeration() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'report_count',
    report_types: [],
    threshold_count: 3,
    time_window_days: 7,
    action_type: 'flag_user',
    suspension_days: 7,
    is_active: true,
    priority: 1
  });

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['auto-moderation-rules'],
    queryFn: () => base44.entities.AutoModerationRule.list('-priority'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AutoModerationRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-moderation-rules'] });
      toast.success('Règle créée avec succès');
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AutoModerationRule.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-moderation-rules'] });
      toast.success('Règle mise à jour');
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AutoModerationRule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-moderation-rules'] });
      toast.success('Règle supprimée');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      trigger_type: 'report_count',
      report_types: [],
      threshold_count: 3,
      time_window_days: 7,
      action_type: 'flag_user',
      suspension_days: 7,
      is_active: true,
      priority: 1
    });
    setEditingRule(null);
    setIsCreateOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRule) {
      updateMutation.mutate({ id: editingRule.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      trigger_type: rule.trigger_type,
      report_types: rule.report_types || [],
      threshold_count: rule.threshold_count || 3,
      time_window_days: rule.time_window_days || 7,
      action_type: rule.action_type,
      suspension_days: rule.suspension_days || 7,
      is_active: rule.is_active,
      priority: rule.priority || 1
    });
    setIsCreateOpen(true);
  };

  const toggleReportType = (type) => {
    setFormData(prev => ({
      ...prev,
      report_types: prev.report_types.includes(type)
        ? prev.report_types.filter(t => t !== type)
        : [...prev.report_types, type]
    }));
  };

  const actionIcons = {
    flag_user: Flag,
    warning: AlertTriangle,
    temporary_suspension: Clock,
    permanent_ban: Ban
  };

  const actionColors = {
    flag_user: 'bg-blue-100 text-blue-700',
    warning: 'bg-orange-100 text-orange-700',
    temporary_suspension: 'bg-amber-100 text-amber-700',
    permanent_ban: 'bg-red-100 text-red-700'
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentPage="AdminAutoModeration" />
      
      <div className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Modération automatique</h1>
            <p className="text-gray-500 mt-1">Configurez des règles de modération automatique</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle règle
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rules.length}</p>
                  <p className="text-sm text-gray-500">Règles totales</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rules.filter(r => r.is_active).length}</p>
                  <p className="text-sm text-gray-500">Règles actives</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-full">
                  <Shield className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rules.filter(r => !r.is_active).length}</p>
                  <p className="text-sm text-gray-500">Règles inactives</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rules List */}
        <div className="space-y-4">
          {rules.map((rule) => {
            const ActionIcon = actionIcons[rule.action_type] || Shield;
            return (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-full ${actionColors[rule.action_type]}`}>
                        <ActionIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{rule.name}</h3>
                          <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                            {rule.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">Priorité: {rule.priority}</Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{rule.description}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            Type: {rule.trigger_type === 'report_count' ? 'Nombre total' : 
                                   rule.trigger_type === 'report_type_count' ? 'Par type' : 
                                   'Violation spécifique'}
                          </span>
                          {rule.threshold_count && (
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              Seuil: {rule.threshold_count} signalement(s)
                            </span>
                          )}
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            Période: {rule.time_window_days} jour(s)
                          </span>
                          <span className={`px-2 py-1 rounded ${actionColors[rule.action_type]}`}>
                            Action: {rule.action_type === 'flag_user' ? 'Marquer' :
                                    rule.action_type === 'warning' ? 'Avertir' :
                                    rule.action_type === 'temporary_suspension' ? 'Suspendre' :
                                    'Bannir'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(rule)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600"
                        onClick={() => {
                          if (confirm('Supprimer cette règle ?')) {
                            deleteMutation.mutate(rule.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRule ? 'Modifier la règle' : 'Nouvelle règle'}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nom de la règle</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Type de déclencheur</label>
                  <Select value={formData.trigger_type} onValueChange={(v) => setFormData({...formData, trigger_type: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="report_count">Nombre total de signalements</SelectItem>
                      <SelectItem value="report_type_count">Nombre par type</SelectItem>
                      <SelectItem value="specific_violation">Violation spécifique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Action</label>
                  <Select value={formData.action_type} onValueChange={(v) => setFormData({...formData, action_type: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flag_user">Marquer l'utilisateur</SelectItem>
                      <SelectItem value="warning">Avertissement</SelectItem>
                      <SelectItem value="temporary_suspension">Suspension temporaire</SelectItem>
                      <SelectItem value="permanent_ban">Bannissement permanent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.trigger_type === 'report_type_count' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Types de signalements</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['spam', 'fake', 'harassment', 'inappropriate', 'profile', 'message', 'photo', 'other'].map(type => (
                      <label key={type} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.report_types.includes(type)}
                          onChange={() => toggleReportType(type)}
                        />
                        <span className="text-sm capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Seuil</label>
                  <Input
                    type="number"
                    value={formData.threshold_count}
                    onChange={(e) => setFormData({...formData, threshold_count: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Période (jours)</label>
                  <Input
                    type="number"
                    value={formData.time_window_days}
                    onChange={(e) => setFormData({...formData, time_window_days: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Priorité</label>
                  <Input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              {formData.action_type === 'temporary_suspension' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Durée suspension (jours)</label>
                  <Input
                    type="number"
                    value={formData.suspension_days}
                    onChange={(e) => setFormData({...formData, suspension_days: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
              )}

              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <label className="text-sm font-medium">Règle active</label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingRule ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}