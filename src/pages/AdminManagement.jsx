import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Shield, UserPlus, Trash2, Edit2, Check, X, Crown, Eye,
  Users, Lock, MessageCircle, AlertTriangle, Settings, Search
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const ROLES = {
  admin: {
    label: 'Administrateur',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: Crown,
    description: 'Accès complet à toutes les fonctionnalités',
    permissions: [
      'Gérer les utilisateurs (bannir, suspendre, supprimer)',
      'Gérer les abonnements et paiements',
      'Accéder aux statistiques complètes',
      'Gérer les admins et modérateurs',
      'Configurer le site',
      'Accès aux logs de sécurité',
      'Modérer les contenus',
      'Gérer les tickets support',
    ],
  },
  moderator: {
    label: 'Modérateur',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Shield,
    description: 'Accès limité à la modération de contenu',
    permissions: [
      'Voir la liste des utilisateurs',
      'Traiter les signalements',
      'Modérer les photos',
      'Répondre aux tickets support',
      'Vérifier les profils',
    ],
    restricted: [
      'Gestion des abonnements/paiements',
      'Gestion des admins',
      'Configuration du site',
      'Logs de sécurité',
      'Suppression de comptes',
    ],
  },
};

function RolePermissionsCard({ role }) {
  const config = ROLES[role];
  const Icon = config.icon;
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${role === 'admin' ? 'bg-red-100' : 'bg-blue-100'}`}>
            <Icon className={`w-5 h-5 ${role === 'admin' ? 'text-red-600' : 'text-blue-600'}`} />
          </div>
          <div>
            <CardTitle className="text-base">{config.label}</CardTitle>
            <p className="text-xs text-gray-500">{config.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-green-700 mb-2 uppercase tracking-wide">✓ Autorisations</p>
          <ul className="space-y-1">
            {config.permissions.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                <Check className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        {config.restricted && (
          <div>
            <p className="text-xs font-semibold text-red-700 mb-2 uppercase tracking-wide">✗ Restreint</p>
            <ul className="space-y-1">
              {config.restricted.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                  <X className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminManagement() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('moderator');
  const [newRole, setNewRole] = useState('moderator');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: () => base44.entities.User.list(),
  });

  const adminsAndMods = users.filter(u => u.role === 'admin' || u.role === 'moderator');
  const filtered = adminsAndMods.filter(u =>
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => base44.entities.User.update(userId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      toast.success('Rôle mis à jour avec succès');
      setShowEditDialog(false);
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: (userId) => base44.entities.User.update(userId, { role: 'user' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      toast.success('Accès admin/modérateur retiré');
    },
  });

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    try {
      await base44.users.inviteUser(inviteEmail.trim(), inviteRole);
      toast.success(`Invitation envoyée à ${inviteEmail} en tant que ${ROLES[inviteRole].label}`);
      setShowInviteDialog(false);
      setInviteEmail('');
      setInviteRole('moderator');
    } catch (e) {
      toast.error("Erreur lors de l'invitation");
    } finally {
      setIsInviting(false);
    }
  };

  const handleEditOpen = (user) => {
    setEditTarget(user);
    setNewRole(user.role);
    setShowEditDialog(true);
  };

  const handleSaveRole = () => {
    if (!editTarget) return;
    updateRoleMutation.mutate({ userId: editTarget.id, role: newRole });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar currentPage="AdminManagement" />

      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Admins & Modérateurs</h1>
          <p className="text-gray-500 mt-1">Gérez les accès et permissions de votre équipe</p>
        </div>

        {/* Permissions Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <RolePermissionsCard role="admin" />
          <RolePermissionsCard role="moderator" />
        </div>

        {/* Team Management */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                Équipe ({filtered.length})
              </CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9 w-56"
                  />
                </div>
                <Button
                  onClick={() => setShowInviteDialog(true)}
                  className="bg-amber-500 hover:bg-amber-600 gap-2 shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  Inviter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">Chargement...</div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center">
                <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aucun administrateur ou modérateur trouvé</p>
                <p className="text-gray-400 text-sm mt-1">Invitez des membres pour commencer</p>
              </div>
            ) : (
              <div className="divide-y">
                {filtered.map((user) => {
                  const roleConfig = ROLES[user.role];
                  const RoleIcon = roleConfig?.icon || Shield;
                  const isMe = user.email === currentUser?.email;
                  return (
                    <div key={user.id} className="flex items-center gap-4 py-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {(user.full_name || user.email || '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 truncate">{user.full_name || 'Sans nom'}</p>
                          {isMe && <Badge variant="outline" className="text-xs">Vous</Badge>}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Badge className={`${roleConfig?.color} border shrink-0 gap-1`}>
                        <RoleIcon className="w-3 h-3" />
                        {roleConfig?.label || user.role}
                      </Badge>
                      {!isMe && (
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditOpen(user)}
                            className="gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            Modifier
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeRoleMutation.mutate(user.id)}
                            disabled={removeRoleMutation.isPending}
                            className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                            Retirer
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-600" />
              Inviter un membre
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Adresse email</label>
              <Input
                placeholder="email@exemple.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                type="email"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Rôle</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(ROLES).map(([roleKey, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={roleKey}
                      onClick={() => setInviteRole(roleKey)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        inviteRole === roleKey
                          ? roleKey === 'admin' ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${roleKey === 'admin' ? 'text-red-600' : 'text-blue-600'}`} />
                        <span className="font-semibold text-sm">{config.label}</span>
                      </div>
                      <p className="text-xs text-gray-500">{config.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>Annuler</Button>
            <Button
              onClick={handleInvite}
              disabled={!inviteEmail.trim() || isInviting}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {isInviting ? 'Envoi...' : 'Envoyer l\'invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-amber-600" />
              Modifier le rôle
            </DialogTitle>
          </DialogHeader>
          {editTarget && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold">
                  {(editTarget.full_name || editTarget.email || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{editTarget.full_name || 'Sans nom'}</p>
                  <p className="text-sm text-gray-500">{editTarget.email}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Nouveau rôle</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(ROLES).map(([roleKey, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={roleKey}
                        onClick={() => setNewRole(roleKey)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          newRole === roleKey
                            ? roleKey === 'admin' ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-4 h-4 ${roleKey === 'admin' ? 'text-red-600' : 'text-blue-600'}`} />
                          <span className="font-semibold text-sm">{config.label}</span>
                        </div>
                        <p className="text-xs text-gray-500">{config.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Annuler</Button>
            <Button
              onClick={handleSaveRole}
              disabled={updateRoleMutation.isPending || newRole === editTarget?.role}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {updateRoleMutation.isPending ? 'Sauvegarde...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}