import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ShieldCheck, Clock, CheckCircle2, XCircle, Search, Eye, User } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminVerification() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');

  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['verificationRequests'],
    queryFn: () => base44.entities.VerificationRequest.list('-created_date'),
  });

  const approveMutation = useMutation({
    mutationFn: async (requestId) => {
      const admin = await base44.auth.me();
      const request = requests.find(r => r.id === requestId);
      
      // Update verification request
      await base44.entities.VerificationRequest.update(requestId, {
        status: 'approved',
        reviewed_by: admin.email,
        reviewed_at: new Date().toISOString(),
      });
      
      // Update profile to verified
      await base44.entities.Profile.update(request.profile_id, {
        is_verified: true,
      });

      // Send notification
      await base44.entities.Notification.create({
        user_email: request.user_email,
        type: 'match',
        title: 'Profil vérifié !',
        message: 'Félicitations ! Votre profil a été vérifié avec succès.',
        is_read: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verificationRequests'] });
      toast.success('Profil vérifié avec succès');
      setShowReviewDialog(false);
      setSelectedRequest(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, reason }) => {
      const admin = await base44.auth.me();
      const request = requests.find(r => r.id === requestId);
      
      await base44.entities.VerificationRequest.update(requestId, {
        status: 'rejected',
        rejection_reason: reason,
        reviewed_by: admin.email,
        reviewed_at: new Date().toISOString(),
      });

      // Send notification
      await base44.entities.Notification.create({
        user_email: request.user_email,
        type: 'match',
        title: 'Demande de vérification rejetée',
        message: `Votre demande a été rejetée. Raison: ${reason}`,
        is_read: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verificationRequests'] });
      toast.success('Demande rejetée');
      setShowReviewDialog(false);
      setSelectedRequest(null);
      setRejectionReason('');
    },
  });

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentPage="AdminVerification" />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vérification des profils</h1>
            <p className="text-gray-600">Examinez et approuvez les demandes de vérification</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">En attente</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pending}</p>
                </div>
                <Clock className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Approuvées</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.approved}</p>
                </div>
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Rejetées</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.rejected}</p>
                </div>
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                  size="sm"
                >
                  Tous
                </Button>
                <Button
                  variant={filterStatus === 'pending' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('pending')}
                  size="sm"
                >
                  En attente
                </Button>
                <Button
                  variant={filterStatus === 'approved' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('approved')}
                  size="sm"
                >
                  Approuvées
                </Button>
                <Button
                  variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('rejected')}
                  size="sm"
                >
                  Rejetées
                </Button>
              </div>
            </div>
          </div>

          {/* Requests list */}
          {isLoading ? (
            <div className="text-center py-12">Chargement...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <ShieldCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande</h3>
              <p className="text-gray-600">Aucune demande de vérification trouvée</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* User photo */}
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        {request.user_photo ? (
                          <img src={request.user_photo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-16 h-16 text-gray-400 p-3" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{request.user_name}</h3>
                          <Badge variant={
                            request.status === 'pending' ? 'default' :
                            request.status === 'approved' ? 'default' : 'secondary'
                          } className={
                            request.status === 'pending' ? 'bg-blue-500' :
                            request.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                          }>
                            {request.status === 'pending' && 'En attente'}
                            {request.status === 'approved' && 'Approuvé'}
                            {request.status === 'rejected' && 'Rejeté'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{request.user_email}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Type: {
                            request.verification_type === 'photo_selfie' ? 'Photo selfie' :
                            request.verification_type === 'id_document' ? 'Document d\'identité' :
                            'Vidéo'
                          }</span>
                          <span>•</span>
                          <span>{new Date(request.created_date).toLocaleDateString('fr-FR')}</span>
                        </div>

                        {request.status === 'rejected' && request.rejection_reason && (
                          <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                            <strong>Raison:</strong> {request.rejection_reason}
                          </div>
                        )}

                        {request.reviewed_by && (
                          <div className="mt-2 text-xs text-gray-500">
                            Traité par {request.reviewed_by} le {new Date(request.reviewed_at).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowReviewDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Examiner
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Review Dialog */}
          <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Examen de la demande de vérification</DialogTitle>
              </DialogHeader>
              
              {selectedRequest && (
                <div className="space-y-6 mt-4">
                  {/* User info */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                      {selectedRequest.user_photo ? (
                        <img src={selectedRequest.user_photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-16 h-16 text-gray-400 p-3" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{selectedRequest.user_name}</h3>
                      <p className="text-sm text-gray-600">{selectedRequest.user_email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Demande soumise le {new Date(selectedRequest.created_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {/* Photos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedRequest.selfie_photo && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Photo selfie</h4>
                        <img 
                          src={selectedRequest.selfie_photo} 
                          alt="Selfie" 
                          className="w-full rounded-lg border-2 border-gray-200"
                        />
                      </div>
                    )}
                    
                    {selectedRequest.id_document_photo && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Document d'identité</h4>
                        <img 
                          src={selectedRequest.id_document_photo} 
                          alt="Document" 
                          className="w-full rounded-lg border-2 border-gray-200"
                        />
                      </div>
                    )}
                  </div>

                  {/* Rejection reason input */}
                  {selectedRequest.status === 'pending' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Raison du rejet (si applicable)
                      </label>
                      <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Expliquez pourquoi la demande est rejetée..."
                        className="h-24"
                      />
                    </div>
                  )}

                  {/* Actions */}
                  {selectedRequest.status === 'pending' && (
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (!rejectionReason.trim()) {
                            toast.error('Veuillez indiquer une raison de rejet');
                            return;
                          }
                          rejectMutation.mutate({
                            requestId: selectedRequest.id,
                            reason: rejectionReason,
                          });
                        }}
                        disabled={rejectMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rejeter
                      </Button>
                      <Button
                        onClick={() => approveMutation.mutate(selectedRequest.id)}
                        disabled={approveMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approuver
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}