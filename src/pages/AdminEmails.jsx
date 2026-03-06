import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Mail, Users, User, Send, Search, CheckCircle,
  Loader2, X, Plus, Pencil, Trash2, BookOpen, ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORY_LABELS = {
  inscription: { label: 'Inscription', color: 'bg-blue-100 text-blue-700' },
  premium: { label: 'Membres Premium', color: 'bg-amber-100 text-amber-700' },
  vip: { label: 'Membres VIP', color: 'bg-purple-100 text-purple-700' },
  moderation: { label: 'Modération', color: 'bg-red-100 text-red-700' },
  promotion: { label: 'Promotion', color: 'bg-green-100 text-green-700' },
  reactivation: { label: 'Réactivation', color: 'bg-orange-100 text-orange-700' },
  autre: { label: 'Autre', color: 'bg-gray-100 text-gray-700' },
};

const DEFAULT_TEMPLATES = [
  { label: 'Bienvenue', category: 'inscription', subject: 'Bienvenue sur Meetyyou !', body: 'Bonjour {name},\n\nNous sommes ravis de vous accueillir sur Meetyyou. Votre profil est maintenant actif et vous pouvez commencer à explorer les profils qui correspondent à vos critères.\n\nBonne rencontre !\n\nL\'équipe Meetyyou', is_active: true },
  { label: 'Promotion Premium', category: 'promotion', subject: 'Offre spéciale - Passez Premium !', body: 'Bonjour {name},\n\nProfitez de notre offre exclusive : -30% sur l\'abonnement Premium cette semaine seulement !\n\nDécouvrez toutes les fonctionnalités premium et boostez vos rencontres.\n\nL\'équipe Meetyyou', is_active: true },
  { label: 'Rappel d\'activité', category: 'reactivation', subject: 'Des profils vous attendent sur Meetyyou', body: 'Bonjour {name},\n\nVous avez de nouveaux profils qui correspondent à vos critères. Connectez-vous pour les découvrir !\n\nL\'équipe Meetyyou', is_active: true },
  { label: 'Vérification de profil', category: 'moderation', subject: 'Vérifiez votre profil Meetyyou', body: 'Bonjour {name},\n\nNous vous invitons à vérifier votre profil pour augmenter votre visibilité et inspirer confiance aux autres membres.\n\nL\'équipe Meetyyou', is_active: true },
];

function TemplateForm({ template, onSave, onCancel }) {
  const [form, setForm] = useState(template || { label: '', category: 'inscription', subject: '', body: '', is_active: true });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Nom du modèle</label>
          <Input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Ex: Email de bienvenue" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Catégorie</label>
          <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
                <SelectItem key={key} value={key}>{val.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Sujet</label>
        <Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Objet de l'email..." />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Corps de l'email
          <span className="text-gray-400 font-normal ml-2 text-xs">Utilisez {'{name}'} pour personnaliser</span>
        </label>
        <textarea
          className="w-full min-h-[180px] p-3 border border-gray-200 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-amber-300"
          value={form.body}
          onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
          placeholder="Rédigez le contenu de l'email..."
        />
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t">
        <Button variant="outline" onClick={onCancel}>Annuler</Button>
        <Button
          className="bg-amber-500 hover:bg-amber-600"
          onClick={() => onSave(form)}
          disabled={!form.label || !form.subject || !form.body}
        >
          Enregistrer
        </Button>
      </div>
    </div>
  );
}

export default function AdminEmails() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('send'); // 'send' | 'templates'
  const [mode, setMode] = useState('all');
  const [recipientSearch, setRecipientSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [sending, setSending] = useState(false);
  const [sentLog, setSentLog] = useState([]);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');

  const { data: users = [] } = useQuery({
    queryKey: ['all-users-email'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: () => base44.entities.EmailTemplate.list('-created_date', 100),
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data) => base44.entities.EmailTemplate.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['email-templates'] }); toast.success('Modèle créé'); setShowTemplateForm(false); setEditingTemplate(null); },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EmailTemplate.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['email-templates'] }); toast.success('Modèle mis à jour'); setShowTemplateForm(false); setEditingTemplate(null); },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => base44.entities.EmailTemplate.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['email-templates'] }); toast.success('Modèle supprimé'); },
  });

  const handleSeedTemplates = async () => {
    for (const tpl of DEFAULT_TEMPLATES) {
      await base44.entities.EmailTemplate.create(tpl);
    }
    queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    toast.success('Modèles par défaut ajoutés');
  };

  const filteredUsers = users.filter(u =>
    (u.email || '').toLowerCase().includes(recipientSearch.toLowerCase()) ||
    (u.full_name || '').toLowerCase().includes(recipientSearch.toLowerCase())
  );

  const applyTemplate = (tpl) => {
    setSubject(tpl.subject);
    setBody(tpl.body);
    setSelectedTemplateId(tpl.id);
    setTab('send');
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) { toast.error('Veuillez remplir le sujet et le message'); return; }
    if (mode === 'individual' && !selectedUser) { toast.error('Veuillez sélectionner un destinataire'); return; }

    setSending(true);
    try {
      if (mode === 'individual') {
        await base44.integrations.Core.SendEmail({
          to: selectedUser.email,
          subject,
          body: body.replace('{name}', selectedUser.full_name || selectedUser.email),
        });
        setSentLog(prev => [{ id: Date.now(), name: selectedUser.full_name || selectedUser.email, subject, mode: 'individual', date: new Date().toLocaleString('fr-FR') }, ...prev]);
        toast.success(`Email envoyé à ${selectedUser.email}`);
      } else {
        let count = 0;
        for (const user of users) {
          if (!user.email) continue;
          await base44.integrations.Core.SendEmail({ to: user.email, subject, body: body.replace('{name}', user.full_name || user.email) });
          count++;
        }
        setSentLog(prev => [{ id: Date.now(), name: 'Tous les utilisateurs', subject, mode: 'all', date: new Date().toLocaleString('fr-FR') }, ...prev]);
        toast.success(`Email envoyé à ${count} utilisateurs`);
      }
      setSubject(''); setBody(''); setSelectedTemplateId(''); setSelectedUser(null); setRecipientSearch('');
    } catch (e) {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  const handleSaveTemplate = (form) => {
    if (editingTemplate?.id) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, data: form });
    } else {
      createTemplateMutation.mutate(form);
    }
  };

  const filteredTemplates = filterCategory === 'all' ? templates : templates.filter(t => t.category === filterCategory);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar currentPage="AdminEmails" />

      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Emails</h1>
          <p className="text-gray-500 mt-1">Gérez vos modèles d'emails et envoyez des campagnes</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('send')}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${tab === 'send' ? 'bg-amber-500 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
          >
            <Mail className="w-4 h-4 inline mr-2" />Envoyer un email
          </button>
          <button
            onClick={() => setTab('templates')}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${tab === 'templates' ? 'bg-amber-500 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />Modèles d'emails
            <Badge className="ml-2 bg-gray-200 text-gray-600 text-xs">{templates.length}</Badge>
          </button>
        </div>

        {/* TAB: Send */}
        {tab === 'send' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              {/* Mode */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setMode('all'); setSelectedUser(null); setRecipientSearch(''); }}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium text-sm transition-all ${mode === 'all' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                      <Users className="w-4 h-4" />Tous les utilisateurs
                      <Badge className="bg-gray-200 text-gray-600 text-xs">{users.length}</Badge>
                    </button>
                    <button
                      onClick={() => setMode('individual')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium text-sm transition-all ${mode === 'individual' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                      <User className="w-4 h-4" />Individuel
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Recipient */}
              {mode === 'individual' && (
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-base">Destinataire</CardTitle></CardHeader>
                  <CardContent>
                    {selectedUser ? (
                      <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">
                          {(selectedUser.full_name || selectedUser.email || '?')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{selectedUser.full_name || 'Sans nom'}</p>
                          <p className="text-xs text-gray-500">{selectedUser.email}</p>
                        </div>
                        <button onClick={() => { setSelectedUser(null); setRecipientSearch(''); }} className="text-gray-400 hover:text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Rechercher un utilisateur..."
                          value={recipientSearch}
                          onChange={e => { setRecipientSearch(e.target.value); setShowUserDropdown(true); }}
                          onFocus={() => setShowUserDropdown(true)}
                          className="pl-9"
                        />
                        {showUserDropdown && recipientSearch && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredUsers.slice(0, 10).map(u => (
                              <button key={u.id} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left"
                                onClick={() => { setSelectedUser(u); setShowUserDropdown(false); setRecipientSearch(''); }}>
                                <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                  {(u.full_name || u.email || '?')[0].toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{u.full_name || 'Sans nom'}</p>
                                  <p className="text-xs text-gray-500">{u.email}</p>
                                </div>
                              </button>
                            ))}
                            {filteredUsers.length === 0 && <p className="px-4 py-3 text-sm text-gray-500">Aucun résultat</p>}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Compose */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-600" />Composer l'email
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Sujet</label>
                    <Input placeholder="Objet de l'email..." value={subject} onChange={e => setSubject(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Message <span className="text-gray-400 font-normal text-xs ml-1">Utilisez {'{name}'} pour personnaliser</span>
                    </label>
                    <textarea
                      className="w-full min-h-[200px] p-3 border border-gray-200 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-amber-300"
                      placeholder="Rédigez votre message ici..."
                      value={body}
                      onChange={e => setBody(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <p className="text-xs text-gray-400">
                      {mode === 'all' ? `Envoi à ${users.length} utilisateur(s)` : selectedUser ? `Envoi à ${selectedUser.email}` : 'Aucun destinataire'}
                    </p>
                    <Button onClick={handleSend} disabled={sending || !subject || !body || (mode === 'individual' && !selectedUser)} className="bg-amber-500 hover:bg-amber-600 gap-2">
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {sending ? 'Envoi...' : 'Envoyer'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel */}
            <div className="space-y-5">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Modèles enregistrés</CardTitle>
                    <Button size="sm" variant="outline" onClick={() => setTab('templates')} className="text-xs gap-1">
                      <BookOpen className="w-3 h-3" />Gérer
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {templates.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-400 mb-3">Aucun modèle enregistré</p>
                      <Button size="sm" variant="outline" onClick={handleSeedTemplates} className="text-xs">Ajouter les modèles par défaut</Button>
                    </div>
                  )}
                  {templates.map(tpl => (
                    <button key={tpl.id} onClick={() => applyTemplate(tpl)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${selectedTemplateId === tpl.id ? 'border-amber-400 bg-amber-50 text-amber-800' : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 text-gray-700'}`}>
                      <div className="flex items-center gap-2">
                        <p className="font-medium flex-1 truncate">{tpl.label}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ${CATEGORY_LABELS[tpl.category]?.color}`}>
                          {CATEGORY_LABELS[tpl.category]?.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{tpl.subject}</p>
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Historique d'envoi</CardTitle></CardHeader>
                <CardContent>
                  {sentLog.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Aucun email envoyé</p>
                  ) : (
                    <div className="space-y-3">
                      {sentLog.map(log => (
                        <div key={log.id} className="p-3 bg-green-50 border border-green-100 rounded-lg">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{log.subject}</p>
                              <p className="text-xs text-gray-500 truncate">→ {log.name}</p>
                              <p className="text-xs text-gray-400 mt-1">{log.date}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB: Templates */}
        {tab === 'templates' && (
          <div className="space-y-5">
            {showTemplateForm ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <button onClick={() => { setShowTemplateForm(false); setEditingTemplate(null); }} className="text-gray-400 hover:text-gray-600">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    {editingTemplate ? 'Modifier le modèle' : 'Nouveau modèle'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TemplateForm
                    template={editingTemplate}
                    onSave={handleSaveTemplate}
                    onCancel={() => { setShowTemplateForm(false); setEditingTemplate(null); }}
                  />
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-48 bg-white">
                        <SelectValue placeholder="Toutes catégories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les catégories</SelectItem>
                        {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
                          <SelectItem key={key} value={key}>{val.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    {templates.length === 0 && (
                      <Button variant="outline" onClick={handleSeedTemplates} className="gap-2">
                        Ajouter les modèles par défaut
                      </Button>
                    )}
                    <Button className="bg-amber-500 hover:bg-amber-600 gap-2" onClick={() => { setEditingTemplate(null); setShowTemplateForm(true); }}>
                      <Plus className="w-4 h-4" />Nouveau modèle
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredTemplates.map(tpl => (
                    <Card key={tpl.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 truncate">{tpl.label}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${CATEGORY_LABELS[tpl.category]?.color}`}>
                            {CATEGORY_LABELS[tpl.category]?.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate mb-1">Sujet: {tpl.subject}</p>
                        <p className="text-xs text-gray-400 line-clamp-2 mb-4">{tpl.body}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs" onClick={() => applyTemplate(tpl)}>
                            <Send className="w-3 h-3" />Utiliser
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => { setEditingTemplate(tpl); setShowTemplateForm(true); }}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1 text-xs text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteTemplateMutation.mutate(tpl.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredTemplates.length === 0 && (
                    <div className="col-span-3 text-center py-12 text-gray-400">
                      <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>Aucun modèle dans cette catégorie</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}