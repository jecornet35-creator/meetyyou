import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Upload, X, Star, Crop, RotateCcw, ZoomIn, ZoomOut, Check } from 'lucide-react';
import PhotoCropModal from '@/components/photos/PhotoCropModal';
import PhotoGallery from '@/components/photos/PhotoGallery';

export default function Photos() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [cropImage, setCropImage] = useState(null); // { src, file }
  const fileInputRef = useRef(null);

  const { data: profile } = useQuery({
    queryKey: ['myProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const profiles = await base44.entities.Profile.filter({ created_by: user.email });
      return profiles[0] || null;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      if (profile?.id) return base44.entities.Profile.update(profile.id, data);
      const user = await base44.auth.me();
      return base44.entities.Profile.create({ ...data, display_name: user.full_name || 'Utilisateur' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const src = URL.createObjectURL(file);
    setCropImage({ src, file });
    e.target.value = '';
  };

  const handleCropDone = async (croppedBlob) => {
    setCropImage(null);
    setUploading(true);
    const file = new File([croppedBlob], 'photo.jpg', { type: 'image/jpeg' });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const photos = [...(profile?.photos || []), file_url];
    const main_photo = profile?.main_photo || file_url;
    await updateMutation.mutateAsync({ photos, main_photo });
    setUploading(false);
    toast.success('Photo ajoutée avec succès !');
  };

  const handleRemove = async (url) => {
    const photos = (profile?.photos || []).filter(p => p !== url);
    const main_photo = profile?.main_photo === url ? (photos[0] || null) : profile?.main_photo;
    await updateMutation.mutateAsync({ photos, main_photo });
    toast.success('Photo supprimée');
  };

  const handleSetMain = async (url) => {
    await updateMutation.mutateAsync({ main_photo: url });
    toast.success('Photo principale mise à jour');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to={createPageUrl('EditProfile')} className="text-white/70 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">Mes Photos</h1>
          <span className="text-white/70 text-sm ml-auto">{(profile?.photos || []).length} photo(s)</span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Upload zone */}
        <div
          className="bg-white rounded-2xl border-2 border-dashed border-amber-300 p-10 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-50/30 transition-all"
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          <Upload className="w-14 h-14 mx-auto text-amber-400 mb-4" />
          <p className="text-gray-700 font-medium text-lg mb-1">
            {uploading ? 'Upload en cours...' : 'Cliquez pour ajouter une photo'}
          </p>
          <p className="text-gray-400 text-sm">JPG, PNG — l'outil de recadrage s'ouvrira automatiquement</p>
        </div>

        {/* Gallery */}
        <PhotoGallery
          photos={profile?.photos || []}
          mainPhoto={profile?.main_photo}
          onRemove={handleRemove}
          onSetMain={handleSetMain}
        />
      </main>

      {/* Crop modal */}
      {cropImage && (
        <PhotoCropModal
          src={cropImage.src}
          onDone={handleCropDone}
          onCancel={() => setCropImage(null)}
        />
      )}
    </div>
  );
}