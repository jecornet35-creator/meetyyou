import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Upload, X, Star, Crop, RotateCcw, ZoomIn, ZoomOut, Check, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import PhotoCropModal from '@/components/photos/PhotoCropModal.jsx';
import PhotoGallery from '@/components/photos/PhotoGallery.jsx';

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

        {/* Guidelines */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Good practices */}
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h2 className="font-semibold text-gray-800">Bonnes pratiques pour vos photos</h2>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Utilisez des photos récentes qui vous ressemblent vraiment</li>
              <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Votre visage doit être clairement visible sur la photo principale</li>
              <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Privilégiez des photos prises dans un environnement naturel et bien éclairé</li>
              <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Variez les situations : portrait, loisir, voyage… pour mieux vous présenter</li>
              <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> 3 à 6 photos est idéal pour un profil attractif et crédible</li>
            </ul>
          </div>

          {/* Warning */}
          <div className="p-5 bg-amber-50 border-b border-amber-100">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-amber-800">Photos interdites</h2>
            </div>
            <ul className="space-y-2 text-sm text-amber-800">
              <li className="flex items-start gap-2"><span className="mt-0.5">⚠️</span> Photos volées sur les réseaux sociaux (Facebook, Instagram, TikTok…)</li>
              <li className="flex items-start gap-2"><span className="mt-0.5">⚠️</span> Images générées par l'intelligence artificielle (IA, Midjourney, DALL-E…)</li>
              <li className="flex items-start gap-2"><span className="mt-0.5">⚠️</span> Photos de célébrités, mannequins ou personnes tierces</li>
              <li className="flex items-start gap-2"><span className="mt-0.5">⚠️</span> Images à caractère sexuel, violent ou inapproprié</li>
              <li className="flex items-start gap-2"><span className="mt-0.5">⚠️</span> Photos floues, retouchées à l'extrême ou trompeuses</li>
            </ul>
          </div>

          {/* Sanctions */}
          <div className="p-5 bg-red-50">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5 text-red-500" />
              <h2 className="font-semibold text-red-800">Conséquences en cas de non-respect</h2>
            </div>
            <p className="text-sm text-red-700 mb-3">
              Notre équipe de modération vérifie régulièrement les profils. Toute infraction peut entraîner les sanctions suivantes, par ordre de gravité :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="bg-white rounded-xl p-3 border border-red-100 text-center">
                <span className="text-2xl">⚠️</span>
                <p className="font-semibold text-gray-800 mt-1">Avertissement</p>
                <p className="text-xs text-gray-500 mt-0.5">Suppression de la photo et notification</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-red-100 text-center">
                <span className="text-2xl">⏸️</span>
                <p className="font-semibold text-gray-800 mt-1">Suspension</p>
                <p className="text-xs text-gray-500 mt-0.5">Compte suspendu temporairement</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-red-200 text-center bg-red-100">
                <span className="text-2xl">🚫</span>
                <p className="font-semibold text-red-700 mt-1">Suppression définitive</p>
                <p className="text-xs text-red-500 mt-0.5">Compte supprimé sans récupération possible</p>
              </div>
            </div>
            <p className="text-xs text-red-600 mt-3 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              En ajoutant une photo, vous certifiez qu'il s'agit bien de vous et que vous en êtes l'auteur ou disposez des droits nécessaires.
            </p>
          </div>
        </div>

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