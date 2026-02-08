import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Check, X, AlertCircle, Image as ImageIcon } from 'lucide-react';
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

export default function AdminPhotos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [fraudRiskLevel, setFraudRiskLevel] = useState('low');
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  // Récupérer tous les profils avec photos
  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles-with-photos'],
    queryFn: () => base44.entities.Profile.list('-created_date', 500),
  });

  // Récupérer les modérations de photos
  const { data: photoModerations = [] } = useQuery({
    queryKey: ['photoModerations'],
    queryFn: () => base44.entities.PhotoModeration.list('-created_date', 1000),
  });

  // Créer les enregistrements de modération pour les nouvelles photos
  useEffect(() => {
    if (profiles.length > 0 && photoModerations.length >= 0) {
      profiles.forEach(profile => {
        // Photos du profil
        const allPhotos = [];
        if (profile.main_photo) {
          allPhotos.push({ url: profile.main_photo, isMain: true });
        }
        if (profile.photos && profile.photos.length > 0) {
          profile.photos.forEach(photo => {
            allPhotos.push({ url: photo, isMain: false });
          });
        }

        allPhotos.forEach(photo => {
          const existing = photoModerations.find(
            pm => pm.photo_url === photo.url && pm.profile_id === profile.id
          );
          if (!existing) {
            base44.entities.PhotoModeration.create({
              photo_url: photo.url,
              profile_id: profile.id,
              user_email: profile.created_by,
              user_name: profile.display_name,
              is_main_photo: photo.isMain,
              status: 'pending',
            }).then(() => {
              queryClient.invalidateQueries({ queryKey: ['photoModerations'] });
            });
          }
        });
      });
    }
  }, [profiles, photoModerations]);

  const approveMutation = useMutation({
    mutationFn: async (moderation) => {
      await base44.entities.PhotoModeration.update(moderation.id, {
        status: 'approved',
        reviewed_by: currentUser?.email,
        reviewed_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photoModerations'] });
      toast.success('Photo approuvée');
      setSelectedPhoto(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ moderation, reason, riskLevel }) => {
      // Marquer comme rejetée
      await base44.entities.PhotoModeration.update(moderation.id, {
        status: 'rejected',
        reviewed_by: currentUser?.email,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason,
      });

      // Créer un signalement de fraude potentiel
      const fraudReport = await base44.entities.Report.create({
        reporter_email: currentUser?.email || 'system@admin',
        reported_user_email: moderation.user_email,
        reported_profile_id: moderation.profile_id,
        type: 'photo',
        reason: riskLevel === 'high' ? 'Photo volée / trouvée sur internet' : 'Photo non conforme aux règles',
        description: `Photo supprimée par ${currentUser?.email}. Raison: ${reason}. Niveau de risque: ${riskLevel === 'high' ? 'ÉLEVÉ - Surveillance requise' : 'Faible'}`,
        evidence_urls: [moderation.photo_url],
        status: 'pending',
        priority: riskLevel === 'high' ? 'high' : 'medium'
      });

      // Si risque élevé, créer une action de modération automatique
      if (riskLevel === 'high') {
        await base44.entities.ModerationAction.create({
          moderator_email: currentUser?.email || 'system@admin',
          moderator_name: currentUser?.full_name || currentUser?.email || 'Administrateur',
          target_user_email: moderation.user_email,
          target_profile_id: moderation.profile_id,
          action_type: 'content_removal',
          reason: 'Photo volée ou trouvée sur internet - Risque élevé',
          details: `Photo supprimée et utilisateur mis sous surveillance. ${reason}`,
          related_report_id: fraudReport.id
        });

        // Marquer l'utilisateur pour surveillance
        const existingStatus = await base44.entities.UserStatus.filter({ user_email: moderation.user_email });
        if (existingStatus.length > 0) {
          await base44.entities.UserStatus.update(existingStatus[0].id, {
            notes: `⚠️ SURVEILLANCE: Photo volée détectée. ${existingStatus[0].notes || ''}`
          });
        } else {
          await base44.entities.UserStatus.create({
            user_email: moderation.user_email,
            status: 'active',
            notes: '⚠️ SURVEILLANCE: Photo volée détectée'
          });
        }
      }

      // Supprimer la photo du profil
      const profile = profiles.find(p => p.id === moderation.profile_id);
      if (profile) {
        const updatedPhotos = (profile.photos || []).filter(p => p !== moderation.photo_url);
        const updatedMainPhoto = profile.main_photo === moderation.photo_url ? null : profile.main_photo;
        
        await base44.entities.Profile.update(profile.id, {
          photos: updatedPhotos,
          ...(updatedMainPhoto !== profile.main_photo && { main_photo: updatedMainPhoto }),
        });
      }

      // Créer une notification
      await base44.entities.Notification.create({
        user_email: moderation.user_email,
        type: 'profile_view',
        title: 'Photo supprimée',
        message: `Une de vos photos a été supprimée. Raison: ${reason}`,
        is_read: false,
      });

      // Vérifier s'il existe un template email
      const emailTemplates = await base44.entities.EmailTemplate.filter({ type: 'profile_rejected' });
      if (emailTemplates.length > 0) {
        const template = emailTemplates[0];
        let emailContent = template.content
          .replace('{{user_name}}', moderation.user_name)
          .replace('{{reason}}', reason);
        
        await base44.integrations.Core.SendEmail({
          to: moderation.user_email,
          subject: template.subject,
          body: emailContent,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photoModerations'] });
      queryClient.invalidateQueries({ queryKey: ['profiles-with-photos'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      toast.success('Photo supprimée, utilisateur notifié et signalement créé');
      setShowRejectDialog(false);
      setSelectedPhoto(null);
      setRejectionReason('');
      setFraudRiskLevel('low');
    },
  });

  const filteredModerations = photoModerations
    .filter(mod => {
      const matchesStatus = statusFilter === 'all' || mod.status === statusFilter;
      const matchesSearch = !searchTerm || 
        mod.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mod.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const stats = {
    pending: photoModerations.filter(m => m.status === 'pending').length,
    approved: photoModerations.filter(m => m.status === 'approved').length,
    rejected: photoModerations.filter(m => m.status === 'rejected').length,
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Photos</h1>
            <p className="text-gray-600">Modérez les photos des utilisateurs</p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">En attente</p>
                  <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
                </div>
                <AlertCircle className="w-12 h-12 text-yellow-500" />
              </div>
            </div>
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Approuvées</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">{stats.approved}</p>
                </div>
                <Check className="w-12 h-12 text-green-500" />
              </div>
            </div>
            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Rejetées</p>
                  <p className="text-3xl font-bold text-red-900 mt-1">{stats.rejected}</p>
                </div>
                <X className="w-12 h-12 text-red-500" />
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
                  <SelectItem value="approved">Approuvées</SelectItem>
                  <SelectItem value="rejected">Rejetées</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grille de photos */}
          {profilesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array(20).fill(0).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          ) : filteredModerations.length === 0 ? (
            <div className="text-center py-20">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucune photo à modérer</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredModerations.map((moderation) => (
                <div
                  key={moderation.id}
                  className="relative group cursor-pointer"
                  onClick={() => setSelectedPhoto(moderation)}
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-200">
                    <img
                      src={moderation.photo_url}
                      alt={moderation.user_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Badge statut */}
                  <div className="absolute top-2 left-2">
                    {moderation.status === 'pending' && (
                      <Badge className="bg-yellow-500">En attente</Badge>
                    )}
                    {moderation.status === 'approved' && (
                      <Badge className="bg-green-500">Approuvée</Badge>
                    )}
                    {moderation.status === 'rejected' && (
                      <Badge className="bg-red-500">Rejetée</Badge>
                    )}
                  </div>

                  {/* Badge photo principale */}
                  {moderation.is_main_photo && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-amber-500">Principale</Badge>
                    </div>
                  )}

                  {/* Info utilisateur */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="text-white text-sm font-medium truncate">
                      {moderation.user_name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialog détails photo */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Modération de la photo</DialogTitle>
            <DialogDescription>
              Photo de {selectedPhoto?.user_name}
            </DialogDescription>
          </DialogHeader>

          {selectedPhoto && (
            <div className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={selectedPhoto.photo_url}
                  alt={selectedPhoto.user_name}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Utilisateur:</span>
                  <p className="font-medium">{selectedPhoto.user_name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <p className="font-medium">{selectedPhoto.user_email}</p>
                </div>
                <div>
                  <span className="text-gray-500">Statut:</span>
                  <p className="font-medium">
                    {selectedPhoto.status === 'pending' && 'En attente'}
                    {selectedPhoto.status === 'approved' && 'Approuvée'}
                    {selectedPhoto.status === 'rejected' && 'Rejetée'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Type:</span>
                  <p className="font-medium">
                    {selectedPhoto.is_main_photo ? 'Photo principale' : 'Photo secondaire'}
                  </p>
                </div>
              </div>

              {selectedPhoto.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => approveMutation.mutate(selectedPhoto)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={approveMutation.isPending}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approuver
                  </Button>
                  <Button
                    onClick={() => setShowRejectDialog(true)}
                    variant="destructive"
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              )}

              {selectedPhoto.status === 'rejected' && selectedPhoto.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    <strong>Raison du rejet:</strong> {selectedPhoto.rejection_reason}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog rejet */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la photo</DialogTitle>
            <DialogDescription>
              Indiquez la raison de la suppression (l'utilisateur sera notifié)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Raison de la suppression</label>
              <Textarea
                placeholder="Ex: Photo inappropriée, ne respecte pas les conditions d'utilisation..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Niveau de risque de fraude</label>
              <Select value={fraudRiskLevel} onValueChange={setFraudRiskLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      <span>Faible - Photo non conforme aux règles</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <span>Élevé - Photo volée / internet (⚠️ Surveillance)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {fraudRiskLevel === 'high' && (
                <p className="text-xs text-red-600 mt-2">
                  ⚠️ L'utilisateur sera automatiquement mis sous surveillance et un signalement de fraude sera créé.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason('');
                  setFraudRiskLevel('low');
                }}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={() => rejectMutation.mutate({ 
                  moderation: selectedPhoto, 
                  reason: rejectionReason,
                  riskLevel: fraudRiskLevel
                })}
                variant="destructive"
                className="flex-1"
                disabled={!rejectionReason.trim() || rejectMutation.isPending}
              >
                Confirmer la suppression
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}