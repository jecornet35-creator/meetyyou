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
  Settings, Bell, Shield, Eye, EyeOff,
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

// ─── Tab: Compte ───────────────────────────────────────────────────────────

function TabCompte({ currentUser }) {
  const links = [
    { to: 'AccountEmail', icon: Mail, iconBg: 'bg-amber-500', title: 'Adresse Email', description: 'Modifier ou vérifier votre adresse email' },
    { to: 'AccountPassword', icon: Lock, iconBg: 'bg-gray-700', title: 'Mot de passe', description: 'Changer votre mot de passe' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <SectionTitle>Paramètres du compte</SectionTitle>
        {links.map(({ to, icon: Icon, iconBg, title, description }) => (
          <Link key={to} to={createPageUrl(to)}>
            <div className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-xl px-2 -mx-2 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${iconBg}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </div>
          </Link>
        ))}
      </div>

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
    allow_messages_from: 'everyone',
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

  const msgOptions = [
    { value: 'everyone', label: 'Tout le monde', desc: "N'importe quel membre peut vous écrire" },
    { value: 'matches', label: 'Mes correspondances uniquement', desc: 'Seulement vos correspondances' },
    { value: 'none', label: 'Personne', desc: 'Désactiver les messages entrants' },
  ];

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
        <SettingRow icon={Eye} iconBg="bg-teal-500" title="Afficher mon âge" description="Rendre votre âge visible sur votre profil">
          <Switch checked={privacy.show_age} onCheckedChange={() => toggle('show_age')} />
        </SettingRow>
        <SettingRow icon={Eye} iconBg="bg-cyan-500" title="Afficher ma localisation" description="Rendre votre ville visible">
          <Switch checked={privacy.show_location} onCheckedChange={() => toggle('show_location')} />
        </SettingRow>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <SectionTitle>Messages</SectionTitle>
        <p className="text-xs text-gray-500 mb-3">Qui peut vous envoyer des messages ?</p>
        {msgOptions.map(({ value, label, desc }) => (
          <button
            key={value}
            onClick={() => setPrivacy(p => ({ ...p, allow_messages_from: value }))}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl mb-2 border transition-all ${privacy.allow_messages_from === value ? 'border-amber-400 bg-amber-50' : 'border-gray-100 hover:border-gray-200'}`}
          >
            <div className="text-left">
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
            {privacy.allow_messages_from === value && <ChevronRight className="w-4 h-4 text-amber-500" />}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Notifications ────────────────────────────────────────────────────

function TabNotifications() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <SectionTitle>Préférences de notification</SectionTitle>
      <p className="text-sm text-gray-500 mb-4">Gérez vos alertes depuis la page dédiée.</p>
      <Link to={createPageUrl('NotificationSettings')}>
        <Button className="bg-amber-500 hover:bg-amber-600 gap-2">
          <Bell className="w-4 h-4" /> Gérer les notifications
          <ChevronRight className="w-4 h-4" />
        </Button>
      </Link>
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