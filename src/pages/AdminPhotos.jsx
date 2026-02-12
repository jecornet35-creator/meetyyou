import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Image, CheckCircle, XCircle, AlertTriangle, Eye, Trash2, 
  Clock, Shield, Flag, User
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminPhotos() {
  const queryClient = useQueryClient();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: profiles = [] } = useQuery({
    queryKey: ['admin-profiles-photos'],
    queryFn: () => base44.entities.Profile.list('-updated_date', 500),
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Profile.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profiles-photos'] });
      setSelectedProfile(null);
    },
  });

  const profilesWithPhotos = profiles.filter(p => p.photos && p.photos.length > 0);
  const pendingPhotos = profiles.filter(p => p.photos && p.photos.length > 0 && !p.is_verified).length;
  const verifiedPhotos = profiles.filter(p => p.photos && p.photos.length > 0 && p.is_verified).length;

  const filteredProfiles = profilesWithPhotos.filter(profile => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return !profile.is_verified;
    if (filterStatus === 'verified') return profile.is_verified;
    return true;
  });

  const handleRemovePhoto = (profile, photoUrl) => {
    const newPhotos = profile.photos.filter(p => p !== photoUrl);
    const newMainPhoto = profile.main_photo === photoUrl ? (newPhotos[0] || null) : profile.main_photo;
    
    updateProfileMutation.mutate({
      id: profile.id,
      data: { 
        photos: newPhotos,
        main_photo: newMainPhoto
      }
    });
  };

  const handleVerifyProfile = (profile) => {
    updateProfileMutation.mutate({
      id: profile.id,
      data: { is_verified: !profile.is_verified }
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar currentPage="AdminPhotos" />
      
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des photos</h1>
          <p className="text-gray-500 mt-1">Modérez et gérez les photos des profils</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Image className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{profilesWithPhotos.length}</p>
                <p className="text-sm text-gray-500">Profils avec photos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingPhotos}</p>
                <p className="text-sm text-gray-500">En attente</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{verifiedPhotos}</p>
                <p className="text-sm text-gray-500">Vérifiés</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-gray-500">Signalées</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
            className={filterStatus === 'all' ? 'bg-amber-500 hover:bg-amber-600' : ''}
          >
            Tous
          </Button>
          <Button
            variant={filterStatus === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('pending')}
            className={filterStatus === 'pending' ? 'bg-amber-500 hover:bg-amber-600' : ''}
          >
            En attente
          </Button>
          <Button
            variant={filterStatus === 'verified' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('verified')}
            className={filterStatus === 'verified' ? 'bg-amber-500 hover:bg-amber-600' : ''}
          >
            Vérifiés
          </Button>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProfiles.map((profile) => (
            <Card key={profile.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="relative mb-3">
                  <img
                    src={profile.main_photo || profile.photos[0]}
                    alt={profile.display_name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  {profile.is_verified && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Vérifié
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="mb-3">
                  <h3 className="font-semibold text-lg">{profile.display_name || profile.first_name}</h3>
                  <p className="text-sm text-gray-500">
                    {profile.age} ans • {profile.city || '-'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {profile.photos?.length || 0} photo{profile.photos?.length > 1 ? 's' : ''}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedProfile(profile)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Voir tout
                  </Button>
                  <Button
                    size="sm"
                    variant={profile.is_verified ? 'outline' : 'default'}
                    className={profile.is_verified ? '' : 'bg-green-500 hover:bg-green-600'}
                    onClick={() => handleVerifyProfile(profile)}
                  >
                    {profile.is_verified ? (
                      <>
                        <XCircle className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Photo Detail Dialog */}
        <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <User className="w-5 h-5" />
                {selectedProfile?.display_name || selectedProfile?.first_name}
                {selectedProfile?.is_verified && (
                  <Badge className="bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Vérifié
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            
            {selectedProfile && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p className="font-medium">{selectedProfile.created_by}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Âge:</span>
                      <p className="font-medium">{selectedProfile.age} ans</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Ville:</span>
                      <p className="font-medium">{selectedProfile.city || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Inscription:</span>
                      <p className="font-medium">
                        {selectedProfile.created_date 
                          ? format(new Date(selectedProfile.created_date), 'dd MMM yyyy', { locale: fr })
                          : '-'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Photos ({selectedProfile.photos?.length || 0})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedProfile.photos?.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        {photo === selectedProfile.main_photo && (
                          <Badge className="absolute top-2 left-2 bg-amber-500">
                            Photo principale
                          </Badge>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemovePhoto(selectedProfile, photo)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant={selectedProfile.is_verified ? 'outline' : 'default'}
                    className={selectedProfile.is_verified ? '' : 'bg-green-500 hover:bg-green-600'}
                    onClick={() => handleVerifyProfile(selectedProfile)}
                  >
                    {selectedProfile.is_verified ? (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Retirer la vérification
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Vérifier le profil
                      </>
                    )}
                  </Button>
                  <Button variant="outline">
                    <Flag className="w-4 h-4 mr-2" />
                    Signaler
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}