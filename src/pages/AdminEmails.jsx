import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Mail, Users, User, Send, Search, ChevronDown, CheckCircle,
  AlertCircle, Loader2, X, Plus
} from 'lucide-react';
import { toast } from 'sonner';

const TEMPLATES = [
  { id: 'welcome', label: 'Bienvenue', subject: 'Bienvenue sur Meetyyou !', body: 'Bonjour {name},\n\nNous sommes ravis de vous accueillir sur Meetyyou. Votre profil est maintenant actif et vous pouvez commencer à explorer les profils qui correspondent à vos critères.\n\nBonne rencontre !\n\nL\'équipe Meetyyou' },
  { id: 'promo', label: 'Promotion', subject: 'Offre spéciale - Passez Premium !', body: 'Bonjour {name},\n\nProfitez de notre offre exclusive : -30% sur l\'abonnement Premium cette semaine seulement !\n\nDécouvrez toutes les fonctionnalités premium et boostez vos rencontres.\n\nL\'équipe Meetyyou' },
  { id: 'reminder', label: 'Rappel d\'activité', subject: 'Des profils vous attendent sur Meetyyou', body: 'Bonjour {name},\n\nVous avez de nouveaux profils qui correspondent à vos critères. Connectez-vous pour les découvrir !\n\nL\'équipe Meetyyou' },
  { id: 'verify', label: 'Vérification', subject: 'Vérifiez votre profil Meetyyou', body: 'Bonjour {name},\n\nNous vous invitons à vérifier votre profil pour augmenter votre visibilité et inspirer confiance aux autres membres.\n\nL\'équipe Meetyyou' },
];

export default function AdminEmails() {
  const [mode, setMode] = useState('all'); // 'all' | 'individual'
  const [recipientSearch, setRecipientSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [sending, setSending] = useState(false);
  const [sentLog, setSentLog] = useState([]);

  const { data: users = [] } = useQuery({
    queryKey: ['all-users-email'],
    queryFn: () => base44.entities.User.list(),
  });

  const filteredUsers = users.filter(u =>
    (u.email || '').toLowerCase().includes(recipientSearch.toLowerCase()) ||
    (u.full_name || '').toLowerCase().includes(recipientSearch.toLowerCase())
  );

  const applyTemplate = (templateId) => {
    const tpl = TEMPLATES.find(t => t.id === templateId);
    if (tpl) {
      setSubject(tpl.subject);
      setBody(tpl.body);
      setSelectedTemplate(templateId);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Veuillez remplir le sujet et le message');
      return;
    }
    if (mode === 'individual' && !selectedUser) {
      toast.error('Veuillez sélectionner un destinataire');
      return;
    }

    setSending(true);
    try {
      if (mode === 'individual') {
        await base44.integrations.Core.SendEmail({
          to: selectedUser.email,
          subject,
          body: body.replace('{name}', selectedUser.full_name || selectedUser.email),
        });
        setSentLog(prev => [{
          id: Date.now(),
          to: selectedUser.email,
          name: selectedUser.full_name || selectedUser.email,
          subject,
          mode: 'individual',
          date: new Date().toLocaleString('fr-FR'),
          status: 'sent',
        }, ...prev]);
        toast.success(`Email envoyé à ${selectedUser.email}`);
      } else {
        // Send to all users
        let successCount = 0;
        for (const user of users) {
          if (!user.email) continue;
          await base44.integrations.Core.SendEmail({
            to: user.email,
            subject,
            body: body.replace('{name}', user.full_name || user.email),
          });
          successCount++;
        }
        setSentLog(prev => [{
          id: Date.now(),
          to: `${successCount} utilisateurs`,
          name: 'Tous les utilisateurs',
          subject,
          mode: 'all',
          date: new Date().toLocaleString('fr-FR'),
          status: 'sent',
        }, ...prev]);
        toast.success(`Email envoyé à ${successCount} utilisateurs`);
      }
      // Reset form
      setSubject('');
      setBody('');
      setSelectedTemplate('');
      setSelectedUser(null);
      setRecipientSearch('');
    } catch (e) {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar currentPage="AdminEmails" />

      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Emails</h1>
          <p className="text-gray-500 mt-1">Envoyez des emails individuels ou à tous les utilisateurs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Compose Panel */}
          <div className="lg:col-span-2 space-y-5">

            {/* Mode Selector */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => { setMode('all'); setSelectedUser(null); setRecipientSearch(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                      mode === 'all' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Tous les utilisateurs
                    <Badge className="bg-gray-200 text-gray-600 text-xs">{users.length}</Badge>
                  </button>
                  <button
                    onClick={() => setMode('individual')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                      mode === 'individual' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Individuel
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Recipient (individual mode) */}
            {mode === 'individual' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Destinataire</CardTitle>
                </CardHeader>
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
                            <button
                              key={u.id}
                              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left"
                              onClick={() => { setSelectedUser(u); setShowUserDropdown(false); setRecipientSearch(''); }}
                            >
                              <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {(u.full_name || u.email || '?')[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{u.full_name || 'Sans nom'}</p>
                                <p className="text-xs text-gray-500">{u.email}</p>
                              </div>
                            </button>
                          ))}
                          {filteredUsers.length === 0 && (
                            <p className="px-4 py-3 text-sm text-gray-500">Aucun résultat</p>
                          )}
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
                  <Mail className="w-4 h-4 text-amber-600" />
                  Composer l'email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Sujet</label>
                  <Input
                    placeholder="Objet de l'email..."
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Message
                    <span className="text-gray-400 font-normal ml-2 text-xs">Utilisez {'{name}'} pour personnaliser</span>
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
                    {mode === 'all'
                      ? `Envoi à ${users.length} utilisateur(s)`
                      : selectedUser ? `Envoi à ${selectedUser.email}` : 'Aucun destinataire'}
                  </p>
                  <Button
                    onClick={handleSend}
                    disabled={sending || !subject || !body || (mode === 'individual' && !selectedUser)}
                    className="bg-amber-500 hover:bg-amber-600 gap-2"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {sending ? 'Envoi en cours...' : 'Envoyer'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel */}
          <div className="space-y-5">
            {/* Templates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Modèles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => applyTemplate(tpl.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                      selectedTemplate === tpl.id
                        ? 'border-amber-400 bg-amber-50 text-amber-800'
                        : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 text-gray-700'
                    }`}
                  >
                    <p className="font-medium">{tpl.label}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{tpl.subject}</p>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Sent Log */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Historique d'envoi</CardTitle>
              </CardHeader>
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
      </div>
    </div>
  );
}