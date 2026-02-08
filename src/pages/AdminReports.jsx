import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertTriangle, Clock, CheckCircle, XCircle, Eye, Ban, 
  MessageCircle, User, Image, Flag
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const typeIcons = {
  profile: User,
  message: MessageCircle,
  photo: Image,
  spam: AlertTriangle,
  fake: Flag,
  harassment: AlertTriangle,
  inappropriate: AlertTriangle,
  other: Flag,
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  reviewing: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  dismissed: 'bg-gray-100 text-gray-700',
};

export default function AdminReports() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [actionDialog, setActionDialog] = useState({ open: false, report: null, actionType: null });
  const [actionDetails, setActionDetails] = useState({ reason: '', details: '', suspensionDays: 7 });
  const [currentUser, setCurrentUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => base44.entities.Report.list('-created_date', 100),
  });

  const { data: moderationActions = [] } = useQuery({
    queryKey: ['moderation-actions'],
    queryFn: () => base44.entities.ModerationAction.list('-created_date', 200),
  });

  const updateReportMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Report.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
  });

  const createModerationActionMutation = useMutation({
    mutationFn: (data) => base44.entities.ModerationAction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-actions'] });
      toast.success('Action de modération enregistrée');
    },
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userEmail, statusData }) => {
      const existing = await base44.entities.UserStatus.filter({ user_email: userEmail });
      if (existing.length > 0) {
        return base44.entities.UserStatus.update(existing[0].id, statusData);
      } else {
        return base44.entities.UserStatus.create({ user_email: userEmail, ...statusData });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Statut utilisateur mis à jour');
    },
  });

  const filteredReports = reports.filter(report => {
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const urgentCount = reports.filter(r => r.priority === 'urgent' && r.status === 'pending').length;

  const handleStatusChange = (reportId, newStatus, action = 'none') => {
    updateReportMutation.mutate({ 
      id: reportId, 
      data: { status: newStatus, action_taken: action }
    });
  };

  const openActionDialog = (report, actionType) => {
    setActionDialog({ open: true, report, actionType });
    setActionDetails({ reason: report.reason || '', details: '', suspensionDays: 7 });
  };

  const handleModerationAction = async () => {
    const { report, actionType } = actionDialog;
    if (!report || !currentUser) return;

    try {
      // Compter les actions précédentes sur cet utilisateur
      const previousActions = moderationActions.filter(
        a => a.target_user_email === report.reported_user_email
      );

      // Créer l'action de modération
      const actionData = {
        moderator_email: currentUser.email,
        moderator_name: currentUser.full_name || currentUser.email,
        target_user_email: report.reported_user_email,
        target_profile_id: report.reported_profile_id,
        action_type: actionType,
        reason: actionDetails.reason,
        details: actionDetails.details,
        related_report_id: report.id,
        previous_action_count: previousActions.length,
      };

      if (actionType === 'temporary_suspension') {
        const suspensionEnd = new Date();
        suspensionEnd.setDate(suspensionEnd.getDate() + parseInt(actionDetails.suspensionDays));
        actionData.suspension_end_date = suspensionEnd.toISOString();
      }

      await createModerationActionMutation.mutateAsync(actionData);

      // Mettre à jour le statut de l'utilisateur
      const statusUpdate = {};
      if (actionType === 'warning') {
        statusUpdate.status = 'warned';
        statusUpdate.warning_count = previousActions.filter(a => a.action_type === 'warning').length + 1;
        statusUpdate.last_warning_date = new Date().toISOString();
      } else if (actionType === 'temporary_suspension') {
        statusUpdate.status = 'suspended';
        statusUpdate.suspension_count = previousActions.filter(a => a.action_type === 'temporary_suspension').length + 1;
        const suspensionEnd = new Date();
        suspensionEnd.setDate(suspensionEnd.getDate() + parseInt(actionDetails.suspensionDays));
        statusUpdate.suspension_end_date = suspensionEnd.toISOString();
      } else if (actionType === 'permanent_ban') {
        statusUpdate.status = 'banned';
        statusUpdate.ban_reason = actionDetails.reason;
        statusUpdate.banned_at = new Date().toISOString();
      }

      await updateUserStatusMutation.mutateAsync({
        userEmail: report.reported_user_email,
        statusData: statusUpdate,
      });

      // Mettre à jour le signalement
      updateReportMutation.mutate({
        id: report.id,
        data: { status: 'resolved', action_taken: actionType },
      });

      setActionDialog({ open: false, report: null, actionType: null });
      setActionDetails({ reason: '', details: '', suspensionDays: 7 });
    } catch (error) {
      toast.error('Erreur lors de l\'action de modération');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar currentPage="AdminReports" />
      
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Signalements</h1>
          <p className="text-gray-500 mt-1">Gérez les signalements des utilisateurs</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-gray-500">En attente</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{urgentCount}</p>
                <p className="text-sm text-gray-500">Urgents</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reports.filter(r => r.status === 'resolved').length}</p>
                <p className="text-sm text-gray-500">Résolus</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-full">
                <Flag className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reports.length}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="reviewing">En cours</SelectItem>
              <SelectItem value="resolved">Résolu</SelectItem>
              <SelectItem value="dismissed">Rejeté</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les priorités</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">Haute</SelectItem>
              <SelectItem value="medium">Moyenne</SelectItem>
              <SelectItem value="low">Basse</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                Aucun signalement trouvé
              </CardContent>
            </Card>
          ) : (
            filteredReports.map((report) => {
              const TypeIcon = typeIcons[report.type] || Flag;
              return (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${priorityColors[report.priority]}`}>
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{report.reason}</h3>
                            <Badge className={statusColors[report.status]}>
                              {report.status === 'pending' && 'En attente'}
                              {report.status === 'reviewing' && 'En cours'}
                              {report.status === 'resolved' && 'Résolu'}
                              {report.status === 'dismissed' && 'Rejeté'}
                            </Badge>
                            <Badge className={priorityColors[report.priority]}>
                              {report.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Type: {report.type}</span>
                            <span>Signalé par: {report.reporter_email}</span>
                            <span>
                              {report.created_date && format(new Date(report.created_date), 'dd MMM yyyy HH:mm', { locale: fr })}
                            </span>
                          </div>
                        </div>
                      </div>
                      {report.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(report.id, 'reviewing')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Examiner
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-600 border-orange-600"
                            onClick={() => openActionDialog(report, 'warning')}
                          >
                            Avertir
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-amber-600 border-amber-600"
                            onClick={() => openActionDialog(report, 'temporary_suspension')}
                          >
                            Suspendre
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600"
                            onClick={() => openActionDialog(report, 'permanent_ban')}
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            Bannir
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStatusChange(report.id, 'dismissed')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rejeter
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Action Dialog */}
        <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {actionDialog.actionType === 'warning' && 'Avertir l\'utilisateur'}
                {actionDialog.actionType === 'temporary_suspension' && 'Suspendre temporairement'}
                {actionDialog.actionType === 'permanent_ban' && 'Bannir définitivement'}
              </DialogTitle>
              <DialogDescription>
                Action contre: {actionDialog.report?.reported_user_email}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Raison</label>
                <Input
                  value={actionDetails.reason}
                  onChange={(e) => setActionDetails({ ...actionDetails, reason: e.target.value })}
                  placeholder="Raison principale..."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Détails supplémentaires</label>
                <Textarea
                  value={actionDetails.details}
                  onChange={(e) => setActionDetails({ ...actionDetails, details: e.target.value })}
                  placeholder="Détails de l'action..."
                  rows={4}
                />
              </div>

              {actionDialog.actionType === 'temporary_suspension' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Durée de suspension (jours)</label>
                  <Input
                    type="number"
                    value={actionDetails.suspensionDays}
                    onChange={(e) => setActionDetails({ ...actionDetails, suspensionDays: e.target.value })}
                    min="1"
                    max="365"
                  />
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Attention:</strong> Cette action sera enregistrée dans le journal de modération et notifiera l'utilisateur.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setActionDialog({ open: false, report: null, actionType: null })}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleModerationAction}
                  className={
                    actionDialog.actionType === 'permanent_ban' ? 'bg-red-600 hover:bg-red-700' :
                    actionDialog.actionType === 'temporary_suspension' ? 'bg-amber-600 hover:bg-amber-700' :
                    'bg-orange-600 hover:bg-orange-700'
                  }
                >
                  Confirmer l'action
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}