import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Eye, Check, X, AlertCircle, MessageCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminFlaggedMessages() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: flaggedConversations = [], isLoading } = useQuery({
    queryKey: ['flaggedConversations'],
    queryFn: () => base44.entities.FlaggedConversation.list('-created_date', 500),
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations-data'],
    queryFn: () => base44.entities.Conversation.list('-created_date', 500),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages-data', selectedFlag?.conversation_id],
    queryFn: () => {
      if (!selectedFlag?.conversation_id) return [];
      return base44.entities.Message.filter(
        { conversation_id: selectedFlag.conversation_id },
        'created_date',
        100
      );
    },
    enabled: !!selectedFlag?.conversation_id,
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ flagId, status, notes, action }) => {
      await base44.entities.FlaggedConversation.update(flagId, {
        status,
        reviewed_by: currentUser?.email,
        reviewed_at: new Date().toISOString(),
        admin_notes: notes,
        action_taken: action,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flaggedConversations'] });
      toast.success('Signalement traité');
      setShowReviewDialog(false);
      setSelectedFlag(null);
      setAdminNotes('');
      setActionTaken('');
    },
  });

  const handleOpenReview = (flag) => {
    setSelectedFlag(flag);
    setShowReviewDialog(true);
    setAdminNotes(flag.admin_notes || '');
    setActionTaken(flag.action_taken || '');
  };

  const filteredFlags = flaggedConversations
    .filter(flag => {
      const matchesStatus = statusFilter === 'all' || flag.status === statusFilter;
      const matchesSearch = !searchTerm || 
        flag.reporter_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flag.reported_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flag.reporter_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flag.reported_email?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });

  const stats = {
    pending: flaggedConversations.filter(f => f.status === 'pending').length,
    reviewed: flaggedConversations.filter(f => f.status === 'reviewed').length,
    actionTaken: flaggedConversations.filter(f => f.status === 'action_taken').length,
    dismissed: flaggedConversations.filter(f => f.status === 'dismissed').length,
  };

  const translateReason = (reason) => {
    const translations = {
      harassment: 'Harcèlement',
      inappropriate_content: 'Contenu inapproprié',
      spam: 'Spam',
      scam: 'Arnaque',
      fake_profile: 'Faux profil',
      other: 'Autre'
    };
    return translations[reason] || reason;
  };

  const translateStatus = (status) => {
    const translations = {
      pending: 'En attente',
      reviewed: 'Examiné',
      action_taken: 'Action prise',
      dismissed: 'Rejeté'
    };
    return translations[status] || status;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Conversations Signalées</h1>
            <p className="text-gray-600">Gérez les signalements de conversations</p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">En attente</p>
                  <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
                </div>
                <AlertCircle className="w-12 h-12 text-yellow-500" />
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Examinés</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">{stats.reviewed}</p>
                </div>
                <Eye className="w-12 h-12 text-blue-500" />
              </div>
            </div>
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Action prise</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">{stats.actionTaken}</p>
                </div>
                <Check className="w-12 h-12 text-green-500" />
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Rejetés</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.dismissed}</p>
                </div>
                <X className="w-12 h-12 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="reviewed">Examinés</SelectItem>
                  <SelectItem value="action_taken">Action prise</SelectItem>
                  <SelectItem value="dismissed">Rejetés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Liste des signalements */}
          {isLoading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : filteredFlags.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucun signalement trouvé</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFlags.map((flag) => (
                <div
                  key={flag.id}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={
                          flag.status === 'pending' ? 'bg-yellow-500' :
                          flag.status === 'reviewed' ? 'bg-blue-500' :
                          flag.status === 'action_taken' ? 'bg-green-500' :
                          'bg-gray-500'
                        }>
                          {translateStatus(flag.status)}
                        </Badge>
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          {translateReason(flag.reason)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Signalé par:</span>
                          <p className="font-medium">{flag.reporter_name}</p>
                          <p className="text-gray-500 text-xs">{flag.reporter_email}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Utilisateur signalé:</span>
                          <p className="font-medium">{flag.reported_name}</p>
                          <p className="text-gray-500 text-xs">{flag.reported_email}</p>
                        </div>
                      </div>
                      {flag.description && (
                        <div className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                          <strong>Description:</strong> {flag.description}
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => handleOpenReview(flag)}
                      size="sm"
                      className="ml-4"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Examiner
                    </Button>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                    <span>Signalé le {format(new Date(flag.created_date), 'dd MMMM yyyy à HH:mm', { locale: fr })}</span>
                    {flag.reviewed_at && (
                      <span>Traité le {format(new Date(flag.reviewed_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialog examen */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Examiner le signalement</DialogTitle>
            <DialogDescription>
              Conversation entre {selectedFlag?.reporter_name} et {selectedFlag?.reported_name}
            </DialogDescription>
          </DialogHeader>

          {selectedFlag && (
            <div className="space-y-4">
              {/* Info signalement */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">Raison:</span>
                    <p className="font-medium text-red-800">{translateReason(selectedFlag.reason)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <p className="font-medium">{format(new Date(selectedFlag.created_date), 'dd MMMM yyyy à HH:mm', { locale: fr })}</p>
                  </div>
                </div>
                {selectedFlag.description && (
                  <div>
                    <span className="text-gray-600 text-sm">Description:</span>
                    <p className="mt-1 text-gray-800">{selectedFlag.description}</p>
                  </div>
                )}
              </div>

              {/* Messages de la conversation */}
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto bg-gray-50">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Historique de la conversation
                </h3>
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucun message</p>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg ${
                          message.sender_email === selectedFlag.reporter_email
                            ? 'bg-blue-100 ml-8'
                            : 'bg-white mr-8'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {message.sender_email === selectedFlag.reporter_email
                              ? selectedFlag.reporter_name
                              : selectedFlag.reported_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(message.created_date), 'dd/MM à HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800">{message.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes admin */}
              <div>
                <label className="text-sm font-medium mb-2 block">Notes de l'administrateur</label>
                <Textarea
                  placeholder="Ajoutez vos notes..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Action prise */}
              <div>
                <label className="text-sm font-medium mb-2 block">Action prise</label>
                <Textarea
                  placeholder="Décrivez l'action prise (avertissement, ban, etc.)..."
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Boutons actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => reviewMutation.mutate({
                    flagId: selectedFlag.id,
                    status: 'dismissed',
                    notes: adminNotes,
                    action: actionTaken
                  })}
                  variant="outline"
                  className="flex-1"
                  disabled={reviewMutation.isPending}
                >
                  Rejeter le signalement
                </Button>
                <Button
                  onClick={() => reviewMutation.mutate({
                    flagId: selectedFlag.id,
                    status: 'reviewed',
                    notes: adminNotes,
                    action: actionTaken
                  })}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={reviewMutation.isPending}
                >
                  Marquer comme examiné
                </Button>
                <Button
                  onClick={() => reviewMutation.mutate({
                    flagId: selectedFlag.id,
                    status: 'action_taken',
                    notes: adminNotes,
                    action: actionTaken
                  })}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={reviewMutation.isPending}
                >
                  Action prise
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}