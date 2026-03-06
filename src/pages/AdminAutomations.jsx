import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Zap, Plus, Trash2, Mail, Users, Crown, Clock, CheckCircle, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';

const TRIGGERS = [
  { id: 'new_registration', label: 'Nouvelle inscription', description: 'Envoyé dès qu\'un utilisateur crée son compte', icon: Users, color: 'bg-blue-100 text-blue-700', category: 'Inscription' },
  { id: 'premium_subscription', label: 'Abonnement Premium', description: 'Envoyé quand un utilisateur passe Premium', icon: Crown, color: 'bg-amber-100 text-amber-700', category: 'Abonnement' },
  { id: 'vip_subscription', label: 'Abonnement VIP', description: 'Envoyé quand un utilisateur passe VIP', icon: Crown, color: 'bg-purple-100 text-purple-700', category: 'Abonnement' },
  { id: 'subscription_expired', label: 'Abonnement expiré', description: 'Envoyé quand un abonnement arrive à expiration', icon: Clock, color: 'bg-red-100 text-red-700', category: 'Abonnement' },
  { id: 'profile_verified', label: 'Profil vérifié', description: 'Envoyé quand un profil est validé par un admin', icon: CheckCircle, color: 'bg-green-100 text-green-700', category: 'Profil' },
  { id: 'inactive_7days', label: 'Inactif 7 jours', description: 'Envoyé si l\'utilisateur n\'est pas connecté depuis 7 jours', icon: RefreshCw, color: 'bg-orange-100 text-orange-700', category: 'Réactivation' },
  { id: 'inactive_30days', label: 'Inactif 30 jours', description: 'Envoyé si l\'utilisateur n\'est pas connecté depuis 30 jours', icon: RefreshCw, color: 'bg-red-100 text-red-700', category: 'Réactivation' },
];

function AddAutomationModal({ onClose, templates, existingTriggers }) {
  const queryClient = useQueryClient();
  const [selectedTrigger, setSelectedTrigger] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [delayHours, setDelayHours] = useState(0);

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.EmailAutomation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-automations'] });
      toast.success('Automatisation créée');
      onClose();
    },
  });

  const availableTriggers = TRIGGERS.filter(t => !existingTriggers.includes(t.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Nouvelle automatisation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Déclencheur</label>
            <Select value={selectedTrigger} onValueChange={setSelectedTrigger}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un déclencheur..." />
              </SelectTrigger>
              <SelectContent>
                {availableTriggers.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.category} — {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTrigger && (
              <p className="text-xs text-gray-400 mt-1">
                {TRIGGERS.find(t => t.id === selectedTrigger)?.description}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Modèle d'email</label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un modèle..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.label} — {t.subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Délai avant envoi (heures)</label>
            <Input
              type="number"
              min="0"
              value={delayHours}
              onChange={e => setDelayHours(parseInt(e.target.value) || 0)}
              placeholder="0 = immédiat"
            />
            <p className="text-xs text-gray-400 mt-1">0 = envoi immédiat après le déclenchement</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button
            className="bg-amber-500 hover:bg-amber-600"
            disabled={!selectedTrigger || !selectedTemplate || mutation.isPending}
            onClick={() => {
              const tpl = templates.find(t => t.id === selectedTemplate);
              mutation.mutate({
                trigger: selectedTrigger,
                template_id: selectedTemplate,
                template_label: tpl?.label || '',
                is_active: true,
                delay_hours: delayHours,
                emails_sent: 0,
              });
            }}
          >
            Créer
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminAutomations() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { data: automations = [], isLoading } = useQuery({
    queryKey: ['email-automations'],
    queryFn: () => base44.entities.EmailAutomation.list('-created_date', 100),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['email-templates'],
    queryFn: () => base44.entities.EmailTemplate.list('-created_date', 100),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.EmailAutomation.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['email-automations'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EmailAutomation.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['email-automations'] }); toast.success('Automatisation supprimée'); },
  });

  const existingTriggers = automations.map(a => a.trigger);

  // Group automations by category
  const grouped = TRIGGERS.reduce((acc, trigger) => {
    const auto = automations.find(a => a.trigger === trigger.id);
    if (!acc[trigger.category]) acc[trigger.category] = [];
    acc[trigger.category].push({ trigger, automation: auto || null });
    return acc;
  }, {});

  const activeCount = automations.filter(a => a.is_active).length;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar currentPage="AdminAutomations" />

      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Zap className="w-8 h-8 text-amber-500" />
              Automatisations Email
            </h1>
            <p className="text-gray-500 mt-1">Configurez les emails envoyés automatiquement selon les actions des utilisateurs</p>
          </div>
          <Button className="bg-amber-500 hover:bg-amber-600 gap-2" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" />Nouvelle automatisation
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{automations.length}</p>
                <p className="text-xs text-gray-500">Automatisations configurées</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
                <p className="text-xs text-gray-500">Actives</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{automations.reduce((s, a) => s + (a.emails_sent || 0), 0)}</p>
                <p className="text-xs text-gray-500">Emails envoyés au total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grouped by category */}
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {items.map(({ trigger, automation }) => {
                  const Icon = trigger.icon;
                  return (
                    <Card key={trigger.id} className={`transition-all ${automation?.is_active ? 'border-green-200 shadow-sm' : 'opacity-70'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`p-1.5 rounded-lg ${trigger.color}`}>
                              <Icon className="w-4 h-4" />
                            </span>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{trigger.label}</p>
                            </div>
                          </div>
                          {automation && (
                            <Switch
                              checked={automation.is_active}
                              onCheckedChange={(v) => toggleMutation.mutate({ id: automation.id, is_active: v })}
                            />
                          )}
                        </div>

                        <p className="text-xs text-gray-400 mb-3">{trigger.description}</p>

                        {automation ? (
                          <>
                            <div className="bg-gray-50 rounded-lg p-2.5 mb-3">
                              <p className="text-xs text-gray-500 mb-0.5">Modèle utilisé</p>
                              <p className="text-sm font-medium text-gray-700 truncate">{automation.template_label || automation.template_id}</p>
                              {automation.delay_hours > 0 && (
                                <p className="text-xs text-gray-400 mt-1">⏱ Délai: {automation.delay_hours}h après déclenchement</p>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">
                                <Mail className="w-3 h-3 inline mr-1" />{automation.emails_sent || 0} envoyés
                              </span>
                              <div className="flex items-center gap-1">
                                <Badge className={automation.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                                  {automation.is_active ? 'Actif' : 'Inactif'}
                                </Badge>
                                <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600 hover:bg-red-50 h-7 w-7 p-0"
                                  onClick={() => deleteMutation.mutate(automation.id)}>
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full gap-2 text-xs border-dashed"
                            onClick={() => setShowModal(true)}
                          >
                            <Plus className="w-3 h-3" />Configurer
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Info box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm font-medium text-blue-800 mb-1">💡 Comment ça fonctionne ?</p>
          <p className="text-sm text-blue-600">
            Ces automatisations s'activent via la fonction backend <code className="bg-blue-100 px-1 rounded">triggerEmailAutomation</code>. 
            Appelez-la avec le bon déclencheur depuis votre code (ex: après une inscription, après un paiement) et l'email sera envoyé automatiquement au bon utilisateur.
          </p>
          <p className="text-xs text-blue-400 mt-2">Ex: <code className="bg-blue-100 px-1 rounded">{'{ trigger: "new_registration", user_email: "...", user_name: "..." }'}</code></p>
        </div>
      </div>

      {showModal && (
        <AddAutomationModal
          onClose={() => setShowModal(false)}
          templates={templates}
          existingTriggers={existingTriggers}
        />
      )}
    </div>
  );
}