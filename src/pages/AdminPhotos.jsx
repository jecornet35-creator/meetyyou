import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Image, CheckCircle, Clock, Trash2, User, Bell, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

export default function AdminPhotos() {
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(null); // { profile, photoUrl }

  // Fetch all profiles with photos
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['admin-profiles-photos'],
    queryFn: () => base44.entities.Profile.list('-updated_date', 500),
  });

  // Fetch approved verification requests to know which main photos are verified
  const { data: verificationRequests = [] } = useQuery({
    queryKey: ['admin-verification-requests'],
    queryFn: () => base44.entities.VerificationRequest.filter({ status: 'approved' }),
  });

  // Build set of verified selfie URLs (these should NOT appear in moderation)
  const verifiedSelfieUrls = new Set(verificationRequests.map(v => v.selfie_url).filter(Boolean));

  // Build pending photos list: one entry per photo, excluding verified selfies and verified main photos
  const pendingPhotos = [];
  profiles.forEach(profile => {
    if (!profile.photos || profile.photos.length === 0) return;
    profile.photos.forEach(photoUrl => {
      // Skip if this photo is a verified selfie (came from profile verification)
      if (verifiedSelfieUrls.has(photoUrl)) return;
      // Skip if this is the main photo AND profile is verified (verified profile's main photo is already approved)
      if (profile.is_verified && photoUrl === profile.main_photo) return;
      // Only show photos that haven't been explicitly approved
      // We consider a photo "pending" if it's not yet approved (we'll track this via accepted_photos array on profile)
      const acceptedPhotos = profile.accepted_photos || [];
      if (acceptedPhotos.includes(photoUrl)) return;

      pendingPhotos.push({ profile, photoUrl });
    });
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Profile.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profiles-photos'] });
    },
  });

  const sendNotificationMutation = useMutation({
    mutationFn: (notification) => base44.entities.Notification.create(notification),
  });

  const handleAcceptPhoto = (profile, photoUrl) => {
    const acceptedPhotos = [...(profile.accepted_photos || []), photoUrl];
    updateProfileMutation.mutate({
      id: profile.id,
      data: { accepted_photos: acceptedPhotos },
    });
    sendNotificationMutation.mutate({
      user_email: profile.created_by,
      type: 'profile_view',
      title: '✅ Photo approuvée',
      message: 'Votre photo a été approuvée par notre équipe et est maintenant visible sur votre profil.',
      is_read: false,
    });
    toast.success('Photo approuvée et notification envoyée');
  };

  const handleDeletePhoto = (profile, photoUrl) => {
    const newPhotos = profile.photos.filter(p => p !== photoUrl);
    const newMainPhoto = profile.main_photo === photoUrl ? (newPhotos[0] || null) : profile.main_photo;
    updateProfileMutation.mutate({
      id: profile.id,
      data: { photos: newPhotos, main_photo: newMainPhoto },
    });
    sendNotificationMutation.mutate({
      user_email: profile.created_by,
      type: 'profile_view',
      title: '⚠️ Photo supprimée',
      message: 'Une de vos photos a été supprimée par notre équipe de modération car elle ne respecte pas nos conditions d\'utilisation.',
      is_read: false,
    });
    toast.success('Photo supprimée et notification envoyée');
    setConfirmDelete(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar currentPage="AdminPhotos" />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Modération des photos</h1>
          <p className="text-gray-500 mt-1">Photos en attente de validation — les photos vérifiées sont exclues</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingPhotos.length}</p>
                <p className="text-sm text-gray-500">Photos en attente</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{new Set(pendingPhotos.map(p => p.profile.id)).size}</p>
                <p className="text-sm text-gray-500">Profils concernés</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{verificationRequests.length}</p>
                <p className="text-sm text-gray-500">Photos vérifiées (exclues)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Photos Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-56 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : pendingPhotos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-16 text-center">
            <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Aucune photo en attente de modération</p>
            <p className="text-gray-400 text-sm mt-1">Toutes les photos ont été traitées.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {pendingPhotos.map(({ profile, photoUrl }, index) => (
              <div key={`${profile.id}-${index}`} className="bg-white rounded-xl shadow overflow-hidden group">
                <div className="relative">
                  <img
                    src={photoUrl}
                    alt="Photo en attente"
                    className="w-full h-48 object-cover"
                  />
                  {photoUrl === profile.main_photo && (
                    <Badge className="absolute top-2 left-2 bg-amber-500 text-xs">Principale</Badge>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {profile.main_photo && (
                      <img src={profile.main_photo} alt="" className="w-6 h-6 rounded-full object-cover" />
                    )}
                    <p className="text-sm font-semibold text-gray-800 truncate">{profile.display_name || profile.first_name || 'Inconnu'}</p>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{profile.created_by}</p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleAcceptPhoto(profile, photoUrl)}
                      disabled={updateProfileMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition-colors"
                      title="Accepter la photo"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Accepter
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ profile, photoUrl })}
                      disabled={updateProfileMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors"
                      title="Supprimer la photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900">Supprimer cette photo ?</h3>
              <button onClick={() => setConfirmDelete(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={confirmDelete.photoUrl}
              alt="À supprimer"
              className="w-full h-40 object-cover rounded-xl mb-4"
            />
            <p className="text-sm text-gray-600 mb-1">
              Profil : <span className="font-semibold">{confirmDelete.profile.display_name || confirmDelete.profile.first_name}</span>
            </p>
            <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
              <Bell className="w-4 h-4 text-amber-500" />
              Une notification sera envoyée à l'utilisateur.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeletePhoto(confirmDelete.profile, confirmDelete.photoUrl)}
                disabled={updateProfileMutation.isPending}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50"
              >
                Supprimer et notifier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}