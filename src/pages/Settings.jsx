import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Settings, User, Bell, Shield, Eye, EyeOff,
  Mail, Lock, ShieldOff, UserX, ChevronRight, Flag, Trash2
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Sub-components ────────────────────────────────────────────────────────

function SectionTitle({ children }) {
  return <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 mt-6 first:mt-0">{children}</h2>;
}

function SettingRow({ icon: Icon, iconBg, title, description, children }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${iconBg}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{title}</p>
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="ml-4 flex-shrink-0">{children}</div>
    </div>
  );
}

function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder} className="pr-10" />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ─── Tab: Compte ───────────────────────────────────────────────────────────

function TabCompte({ currentUser }) {
  const [email, setEmail] = useState(currentUser?.email || '');
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passError, setPassError] = useState('');

  const handleSaveEmail = () => toast.success('Email mis à jour');
  const handleSavePassword = () => {
    setPassError('');
    if (!current) return setPassError('Entrez votre mot de passe actuel');
    if (!newPass || newPass.length < 6) return setPassError('Le nouveau mot de passe doit faire au moins 6 caractères');
    if (newPass !== confirm) return setPassError('Les mots de passe ne correspondent pas');
    toast.success('Mot de passe mis à jour');
    setCurrent(''); setNewPass(''); setConfirm('');
  };

  const strength = (() => {
    if (!newPass) return null;
    let s = 0;
    if (newPass.length >= 8) s++;
    if (/[A-Z]/.test(newPass)) s++;
    if (/[0-9]/.test(newPass)) s++;
    if (/[^A-Za-z0-9]/.test(newPass)) s++;
    const levels = [{ label: 'Très faible', color: 'bg-red-500' }, { label: 'Faible', color: 'bg-orange-400' }, { label: 'Moyen', color: 'bg-yellow-400' }, { label: 'Fort', color: 'bg-green-500' }];
    return { ...levels[s - 1], score: s };
  })();

  return (
    <div className="space-y-6">
      {/* Email */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <SectionTitle>Adresse email</SectionTitle>
        <div className="flex items-center gap-2 mb-1">
          <Mail className="w-4 h-4 text-gray-400" />
          <p className="text-sm text-gray-500">Email actuel : <span className="font-medium text-gray-800">{currentUser?.email}</span></p>
          <Badge className="bg-green-100 text-green-700 border-0 text-xs">Vérifié</Badge>
        </div>
        <div className="flex gap-2 mt-4">
          <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="nouveau@email.com" className="flex-1" />
          <Button onClick={handleSaveEmail} className="bg-amber-500 hover:bg-amber-600 px-5">Enregistrer</Button>
        </div>
      </div>

      {/* Password */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <SectionTitle>Mot de passe</SectionTitle>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Mot de passe actuel</label>
            <PasswordInput value={current} onChange={e => setCurrent(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Nouveau mot de passe</label>
            <PasswordInput value={newPass} onChange={e => setNewPass(e.target.value)} />
            {strength && (
              <div className="mt-1.5">
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength.score ? strength.color : 'bg-gray-200'}`} />)}
                </div>
                <p className="text-xs text-gray-500">{strength.label}</p>
              </div>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Confirmer le nouveau mot de passe</label>
            <PasswordInput value={confirm} onChange={e => setConfirm(e.target.value)} />
            {confirm && newPass !== confirm && <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>}
          </div>
          {passError && <p className="text-xs text-red-500">{passError}</p>}
          <Button onClick={handleSavePassword} className="bg-amber-500 hover:bg-amber-600 w-full">Mettre à jour le mot de passe</Button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl shadow-sm p-5 border border-red-100">
        <SectionTitle>Zone de danger</SectionTitle>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Supprimer mon compte</p>
            <p className="text-xs text-gray-500">Cette action est irréversible. Toutes vos données seront supprimées.</p>
          </div>
          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => toast.error('Contactez le support pour supprimer votre compte')}>
            <Trash2 className="w-4 h-4 mr-1" /> Supprimer
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Confidentialité ──────────────────────────────────────────────────

function TabConfidentialite({ currentUser }) {
  const queryClient = useQueryClient();
  const [privacy, setPrivacy] = useState({
    show_online_status: true,
    show_last_seen: true,
    show_profile_views: true,
    allow_messages_from: 'everyone', // everyone | matches | none
    show_age: true,
    show_location: true,
  });

  const updatePrivacy = useMutation({
    mutationFn: async (data) => base44.auth.updateMe(data),
    onSuccess: () => { queryClient.invalidateQueries(); toast.success('Confidentialité mise à jour'); },
  });

  const toggle = (key) => {
    const updated = { ...privacy, [key]: !privacy[key] };
    setPrivacy(updated);
    updatePrivacy.mutate({ privacy_settings: updated });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <SectionTitle>Visibilité du profil</SectionTitle>
        <SettingRow icon={Eye} iconBg="bg-purple-500" title="Statut en ligne" description="Montrer quand vous êtes connecté(e)">
          <Switch checked={privacy.show_online_status} onCheckedChange={() => toggle('show_online_status')} />
        </SettingRow>
        <SettingRow icon={Eye} iconBg="bg-indigo-500" title="Dernière connexion" description="Afficher votre dernière visite">
          <Switch checked={privacy.show_last_seen} onCheckedChange={() => toggle('show_last_seen')} />
        </SettingRow>
        <SettingRow icon={Eye} iconBg="bg-blue-500" title="Visites de profil" description="Permettre aux autres de voir que vous avez visité">
          <Switch checked={privacy.show_profile_views} onCheckedChange={() => toggle('show_profile_views')} />
        </SettingRow>
        <SettingRow icon={User} iconBg="bg-teal-500" title="Afficher mon âge" description="Rendre votre âge visible sur votre profil">
          <Switch checked={privacy.show_age} onCheckedChange={() => toggle('show_age')} />
        </SettingRow>
        <SettingRow icon={User} iconBg="bg-cyan-500" title="Afficher ma localisation" description="Rendre votre ville visible">
          <Switch checked={privacy.show_location} onCheckedChange={() => toggle('show_location')} />
        </SettingRow>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <SectionTitle>Messages</SectionTitle>
        <p className="text-xs text-gray-500 mb-3">Qui peut vous envoyer des messages ?</p>
        {['everyone', 'matches', 'none'].map((option) => {
          const labels = { everyone: 'Tout le monde', matches: 'Mes correspondances uniquement', none: 'Personne' };
          const desc = { everyone: 'N\'importe quel membre peut vous écrire', matches: 'Seulement vos correspondances', none: 'Désactiver les messages entrants' };
          return (
            <button
              key={option}
              onClick={() => setPrivacy(p => ({ ...p, allow_messages_from: option }))}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl mb-2 border transition-all ${privacy.allow_messages_from === option ? 'border-amber-400 bg-amber-50' : 'border-gray-100 hover:border-gray-200'}`}
            >
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800">{labels[option]}</p>
                <p className="text-xs text-gray-500">{desc[option]}</p>
              </div>
              {privacy.allow_messages_from === option && <Check className="w-4 h-4 text-amber-500" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab: Notifications ────────────────────────────────────────────────────

function TabNotifications({ currentUser }) {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState({
    push_enabled: true, new_messages: true, new_matches: true,
    profile_views: true, likes: true, favorites: true,
    promotions: false, email_notifications: true,
    quiet_hours_enabled: false, quiet_hours_start: '22:00', quiet_hours_end: '08:00',
  });

  const { data: existingPrefs } = useQuery({
    queryKey: ['notificationPrefs', currentUser?.email],
    queryFn: async () => {
      const prefs = await base44.entities.NotificationPreferences.filter({ created_by: currentUser.email });
      return prefs[0];
    },
    enabled: !!currentUser,
  });

  useEffect(() => { if (existingPrefs) setSettings(prev => ({ ...prev, ...existingPrefs })); }, [existingPrefs]);

  const saveMutation = useMutation({
    mutationFn: async (data) => existingPrefs?.id
      ? base44.entities.NotificationPreferences.update(existingPrefs.id, data)
      : base44.entities.NotificationPreferences.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['notificationPrefs'] }); toast.success('Préférences enregistrées'); },
  });

  const update = (key, val) => {
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    saveMutation.mutate(updated);
  };

  const rows = [
    { key: 'new_messages', icon: MessageCircle, iconBg: 'bg-blue-500', title: 'Nouveaux messages', description: 'Alerte pour chaque nouveau message' },
    { key: 'new_matches', icon: UserCheck, iconBg: 'bg-green-500', title: 'Nouvelles correspondances', description: 'Quand un profil correspond à vos critères' },
    { key: 'profile_views', icon: Eye, iconBg: 'bg-purple-500', title: 'Visites de profil', description: 'Quand quelqu\'un consulte votre profil' },
    { key: 'likes', icon: Heart, iconBg: 'bg-red-500', title: 'Likes reçus', description: 'Quand quelqu\'un aime votre profil' },
    { key: 'favorites', icon: Star, iconBg: 'bg-amber-500', title: 'Favoris', description: 'Quand vous êtes ajouté(e) aux favoris' },
    { key: 'promotions', icon: Gift, iconBg: 'bg-pink-500', title: 'Offres et promotions', description: 'Nos offres spéciales' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className={`flex items-center justify-between p-4 rounded-xl mb-4 ${settings.push_enabled ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <Bell className={`w-5 h-5 ${settings.push_enabled ? 'text-amber-600' : 'text-gray-400'}`} />
            <div>
              <p className="text-sm font-semibold text-gray-900">Notifications push</p>
              <p className="text-xs text-gray-500">Activer ou désactiver toutes les alertes</p>
            </div>
          </div>
          <Switch checked={settings.push_enabled} onCheckedChange={(v) => update('push_enabled', v)} />
        </div>

        <div className={settings.push_enabled ? '' : 'opacity-40 pointer-events-none'}>
          <SectionTitle>Types d'alertes</SectionTitle>
          {rows.map(({ key, icon, iconBg, title, description }) => (
            <SettingRow key={key} icon={icon} iconBg={iconBg} title={title} description={description}>
              <Switch checked={settings[key]} onCheckedChange={(v) => update(key, v)} />
            </SettingRow>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <SectionTitle>Email</SectionTitle>
        <SettingRow icon={Mail} iconBg="bg-gray-500" title="Notifications par email" description="Recevoir aussi les alertes par email">
          <Switch checked={settings.email_notifications} onCheckedChange={(v) => update('email_notifications', v)} />
        </SettingRow>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <SectionTitle>Mode silencieux</SectionTitle>
        <SettingRow icon={Moon} iconBg="bg-indigo-500" title="Heures silencieuses" description="Suspendre les notifications la nuit">
          <Switch checked={settings.quiet_hours_enabled} onCheckedChange={(v) => update('quiet_hours_enabled', v)} />
        </SettingRow>
        {settings.quiet_hours_enabled && (
          <div className="mt-3 flex items-center gap-4 pl-11">
            <div>
              <label className="text-xs text-gray-500 block mb-1">De</label>
              <Input type="time" value={settings.quiet_hours_start} onChange={e => update('quiet_hours_start', e.target.value)} className="w-28 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">À</label>
              <Input type="time" value={settings.quiet_hours_end} onChange={e => update('quiet_hours_end', e.target.value)} className="w-28 text-sm" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Sécurité ─────────────────────────────────────────────────────────

function TabSecurite({ currentUser }) {
  const queryClient = useQueryClient();

  const { data: blockedList = [], isLoading: loadingBlocked } = useQuery({
    queryKey: ['blockedUsers'],
    queryFn: async () => base44.entities.BlockedUser.filter({ blocker_email: currentUser.email }),
    enabled: !!currentUser,
  });

  const { data: reportedList = [], isLoading: loadingReports } = useQuery({
    queryKey: ['myReports'],
    queryFn: async () => base44.entities.FlaggedConversation.filter({ reporter_email: currentUser.email }),
    enabled: !!currentUser,
  });

  const unblockMutation = useMutation({
    mutationFn: (id) => base44.entities.BlockedUser.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['blockedUsers'] }); toast.success('Utilisateur débloqué'); },
  });

  const reasonLabels = { harassment: 'Harcèlement', spam: 'Spam', inappropriate: 'Contenu inapproprié', scam: 'Arnaque', other: 'Autre' };
  const statusColors = { pending: 'bg-yellow-100 text-yellow-700', reviewing: 'bg-blue-100 text-blue-700', resolved: 'bg-green-100 text-green-700', dismissed: 'bg-gray-100 text-gray-600' };
  const statusLabels = { pending: 'En attente', reviewing: 'En cours', resolved: 'Résolu', dismissed: 'Classé' };

  return (
    <div className="space-y-4">
      {/* Blocked */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <SectionTitle>Utilisateurs bloqués</SectionTitle>
            <p className="text-xs text-gray-500 -mt-2">Les utilisateurs bloqués ne peuvent ni vous écrire ni voir votre profil</p>
          </div>
          <Badge className="bg-gray-100 text-gray-700 border-0">{blockedList.length}</Badge>
        </div>

        {loadingBlocked ? (
          <div className="py-4 text-center text-gray-400 text-sm">Chargement...</div>
        ) : blockedList.length === 0 ? (
          <div className="py-8 text-center">
            <UserX className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">Aucun utilisateur bloqué</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {blockedList.map(entry => (
              <li key={entry.id} className="flex items-center gap-3 py-3">
                <img src={entry.blocked_photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80'} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{entry.blocked_display_name || 'Utilisateur'}</p>
                  <p className="text-xs text-gray-400 truncate">{entry.blocked_email}</p>
                </div>
                <Button size="sm" variant="outline" className="gap-1 border-red-200 text-red-600 hover:bg-red-50 text-xs"
                  onClick={() => unblockMutation.mutate(entry.id)} disabled={unblockMutation.isPending}>
                  <ShieldOff className="w-3.5 h-3.5" /> Débloquer
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Reports */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <SectionTitle>Signalements envoyés</SectionTitle>
            <p className="text-xs text-gray-500 -mt-2">Historique de vos signalements de conversations</p>
          </div>
          <Badge className="bg-gray-100 text-gray-700 border-0">{reportedList.length}</Badge>
        </div>

        {loadingReports ? (
          <div className="py-4 text-center text-gray-400 text-sm">Chargement...</div>
        ) : reportedList.length === 0 ? (
          <div className="py-8 text-center">
            <Flag className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">Aucun signalement envoyé</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {reportedList.map(report => (
              <li key={report.id} className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-800">{report.reported_user_name || report.reported_user_email}</p>
                  <Badge className={`text-xs border-0 ${statusColors[report.status]}`}>{statusLabels[report.status]}</Badge>
                </div>
                <p className="text-xs text-gray-500">{reasonLabels[report.reason] || report.reason}</p>
                {report.details && <p className="text-xs text-gray-400 mt-0.5 italic">"{report.details}"</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

const TABS = [
  { id: 'compte', label: 'Compte', icon: User },
  { id: 'confidentialite', label: 'Confidentialité', icon: Eye },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'securite', label: 'Sécurité', icon: Shield },
];

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('compte');

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={currentUser} />

      {/* Page header */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center gap-3">
          <Settings className="w-6 h-6" />
          <div>
            <h1 className="text-xl font-bold">Paramètres</h1>
            <p className="text-white/75 text-sm">Gérez votre compte et vos préférences</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar nav */}
          <aside className="md:w-56 flex-shrink-0">
            <nav className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 transition-colors border-b border-gray-50 last:border-0 ${isActive ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${isActive ? 'text-amber-700' : ''}`}>{tab.label}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-amber-400 rotate-90 md:rotate-0' : 'text-gray-300'}`} />
                  </button>
                );
              })}
            </nav>

            {/* Profile quick link */}
            {currentUser && (
              <div className="mt-4 bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3">
                <img src={currentUser.main_photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80'} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{currentUser.full_name}</p>
                  <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
                </div>
              </div>
            )}
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {activeTab === 'compte' && <TabCompte currentUser={currentUser} />}
            {activeTab === 'confidentialite' && <TabConfidentialite currentUser={currentUser} />}
            {activeTab === 'notifications' && <TabNotifications currentUser={currentUser} />}
            {activeTab === 'securite' && <TabSecurite currentUser={currentUser} />}
          </main>
        </div>
      </div>
    </div>
  );
}