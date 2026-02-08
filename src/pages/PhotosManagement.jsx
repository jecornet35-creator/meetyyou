import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Camera, Upload, Trash2, Star, Loader2, CheckCircle } from 'lucide-react';

export default function PhotosManagement() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', currentUser?.email],
    queryFn: async () => {
      const profiles = await base44.entities.Profile.filter({ 
        created_by: currentUser.email 
      });
      return profiles[0] || null;
    },
    enabled: !!currentUser,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.entities.Profile.update(profile.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Photos mises à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour')
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = [];
      
      for (const file of files) {
        const result = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(result.file_url);
      }

      const currentPhotos = profile?.photos || [];
      const newPhotos = [...currentPhotos, ...uploadedUrls];
      
      const updateData = { photos: newPhotos };
      
      // Si c'est la première photo, la définir comme photo principale
      if (!profile?.main_photo && uploadedUrls.length > 0) {
        updateData.main_photo = uploadedUrls[0];
      }

      await updateProfileMutation.mutateAsync(updateData);
      toast.success(`${files.length} photo(s) ajoutée(s)`);
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const setMainPhoto = async (photoUrl) => {
    await updateProfileMutation.mutateAsync({ main_photo: photoUrl });
    toast.success('Photo principale définie');
  };

  const deletePhoto = async (photoUrl) => {
    const currentPhotos = profile?.photos || [];
    const newPhotos = currentPhotos.filter(p => p !== photoUrl);
    
    const updateData = { photos: newPhotos };
    
    // Si on supprime la photo principale, prendre la première photo restante
    if (profile?.main_photo === photoUrl) {
      updateData.main_photo = newPhotos[0] || '';
    }
    
    await updateProfileMutation.mutateAsync(updateData);
    toast.success('Photo supprimée');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  const photos = profile?.photos || [];
  const mainPhoto = profile?.main_photo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Camera className="w-8 h-8 text-amber-600" />
            <h1 className="text-3xl font-bold text-gray-900">Mes Photos</h1>
          </div>
          <p className="text-gray-600">
            Ajoutez jusqu'à 10 photos pour mettre en valeur votre profil
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{photos.length}</div>
              <div className="text-sm text-gray-600">Photos ajoutées</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-amber-600">{10 - photos.length}</div>
              <div className="text-sm text-gray-600">Places restantes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-600">
                {mainPhoto ? '✓' : '○'}
              </div>
              <div className="text-sm text-gray-600">Photo principale</div>
            </CardContent>
          </Card>
        </div>

        {/* Upload zone */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-amber-500 transition-colors">
              <input
                type="file"
                id="photo-upload"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading || photos.length >= 10}
                className="hidden"
              />
              <label 
                htmlFor="photo-upload" 
                className={`cursor-pointer ${uploading || photos.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {uploading ? (
                  <Loader2 className="w-12 h-12 mx-auto mb-4 text-amber-600 animate-spin" />
                ) : (
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                )}
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {uploading ? 'Upload en cours...' : 'Cliquez pour ajouter des photos'}
                </p>
                <p className="text-sm text-gray-500">
                  JPG, PNG, JPEG jusqu'à 10MB • {photos.length}/10 photos
                </p>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Photos grid */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <Card key={index} className="overflow-hidden group relative">
                <div className="relative aspect-square">
                  <img 
                    src={photo} 
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Main photo badge */}
                  {photo === mainPhoto && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" />
                      Principale
                    </div>
                  )}

                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {photo !== mainPhoto && (
                      <Button
                        size="sm"
                        onClick={() => setMainPhoto(photo)}
                        className="bg-amber-500 hover:bg-amber-600"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deletePhoto(photo)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">Aucune photo ajoutée</p>
              <p className="text-sm text-gray-400">
                Commencez par ajouter des photos pour compléter votre profil
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              Conseils pour de bonnes photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Utilisez des photos récentes et de bonne qualité</li>
              <li>✓ Montrez clairement votre visage</li>
              <li>✓ Variez les types de photos (portrait, activités, voyages)</li>
              <li>✓ Évitez les photos de groupe ou floues</li>
              <li>✓ La première photo sera votre photo principale</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}