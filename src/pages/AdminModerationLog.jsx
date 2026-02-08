import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, AlertTriangle, Ban, Clock, CheckCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const actionTypeLabels = {
  warning: 'Avertissement',
  temporary_suspension: 'Suspension temporaire',
  permanent_ban: 'Bannissement définitif',
  content_removal: 'Suppression de contenu',
  profile_verification: 'Vérification de profil',
  account_restoration: 'Restauration de compte',
};

const actionTypeColors = {
  warning: 'bg-orange-100 text-orange-700',
  temporary_suspension: 'bg-amber-100 text-amber-700',
  permanent_ban: 'bg-red-100 text-red-700',
  content_removal: 'bg-purple-100 text-purple-700',
  profile_verification: 'bg-green-100 text-green-700',
  account_restoration: 'bg-blue-100 text-blue-700',
};

const actionTypeIcons = {
  warning: AlertTriangle,
  temporary_suspension: Clock,
  permanent_ban: Ban,
  content_removal: FileText,
  profile_verification: CheckCircle,
  account_restoration: Shield,
};

export default function AdminModerationLog() {
  const [search, setSearch] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState('all');
  const [moderatorFilter, setModeratorFilter] = useState('all');

  const { data: actions = [], isLoading } = useQuery({
    queryKey: ['moderation-actions'],
    queryFn: () => base44.entities.ModerationAction.list('-created_date', 500),
  });

  const uniqueModerators = [...new Set(actions.map(a => a.moderator_email))];

  const filteredActions = actions.filter(action => {
    const matchesSearch = !search || 
      action.target_user_email?.toLowerCase().includes(search.toLowerCase()) ||
      action.reason?.toLowerCase().includes(search.toLowerCase()) ||
      action.moderator_email?.toLowerCase().includes(search.toLowerCase());
    
    const matchesActionType = actionTypeFilter === 'all' || action.action_type === actionTypeFilter;
    const matchesModerator = moderatorFilter === 'all' || action.moderator_email === moderatorFilter;
    
    return matchesSearch && matchesActionType && matchesModerator;
  });

  const stats = {
    total: actions.length,
    warnings: actions.filter(a => a.action_type === 'warning').length,
    suspensions: actions.filter(a => a.action_type === 'temporary_suspension').length,
    bans: actions.filter(a => a.action_type === 'permanent_ban').length,
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar currentPage="AdminAuditLog" />
      
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Journal de modération</h1>
          <p className="text-gray-500 mt-1">Historique complet des actions de modération</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-500">Actions totales</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.warnings}</p>
                <p className="text-sm text-gray-500">Avertissements</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.suspensions}</p>
                <p className="text-sm text-gray-500">Suspensions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Ban className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.bans}</p>
                <p className="text-sm text-gray-500">Bannissements</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-4">
          <Input
            placeholder="Rechercher par email, raison..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Type d'action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="warning">Avertissements</SelectItem>
              <SelectItem value="temporary_suspension">Suspensions</SelectItem>
              <SelectItem value="permanent_ban">Bannissements</SelectItem>
              <SelectItem value="content_removal">Suppressions</SelectItem>
              <SelectItem value="profile_verification">Vérifications</SelectItem>
              <SelectItem value="account_restoration">Restaurations</SelectItem>
            </SelectContent>
          </Select>
          <Select value={moderatorFilter} onValueChange={setModeratorFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Modérateur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les modérateurs</SelectItem>
              {uniqueModerators.map(mod => (
                <SelectItem key={mod} value={mod}>{mod}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Actions List */}
        <div className="space-y-3">
          {filteredActions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                Aucune action de modération trouvée
              </CardContent>
            </Card>
          ) : (
            filteredActions.map((action) => {
              const Icon = actionTypeIcons[action.action_type] || Shield;
              return (
                <Card key={action.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${actionTypeColors[action.action_type]}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={actionTypeColors[action.action_type]}>
                            {actionTypeLabels[action.action_type]}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {action.created_date && format(new Date(action.created_date), 'dd MMM yyyy HH:mm', { locale: fr })}
                          </span>
                        </div>
                        <p className="font-medium text-gray-900 mb-1">
                          {action.reason}
                        </p>
                        {action.details && (
                          <p className="text-sm text-gray-600 mb-2">{action.details}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <span>Utilisateur ciblé: <strong>{action.target_user_email}</strong></span>
                          <span>Modérateur: <strong>{action.moderator_name || action.moderator_email}</strong></span>
                          {action.previous_action_count > 0 && (
                            <span>Actions précédentes: <strong>{action.previous_action_count}</strong></span>
                          )}
                          {action.suspension_end_date && (
                            <span>Fin de suspension: <strong>{format(new Date(action.suspension_end_date), 'dd MMM yyyy', { locale: fr })}</strong></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}