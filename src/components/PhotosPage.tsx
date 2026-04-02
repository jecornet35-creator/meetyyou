import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Upload, 
  Info,
  Pause,
  Ban,
  Clock,
  Trash2,
  Camera
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { toast } from 'sonner';

export default function PhotosPage({ onBack }) {
  const [pendingPhotos, setPendingPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Mock current user info
  const currentUser = {
    id: 'my-id',
    name: 'Aisha',
    email: 'jlcornet878@gmail.com',
    photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop'
  };

  useEffect(() => {
    const fetchPendingPhotos = async () => {
      try {
        const data = await api.get('pending_photos');
        // Filter for current user
        const userPhotos = (data || []).filter(p => p.userId === currentUser.id || p.email === currentUser.email);
        setPendingPhotos(userPhotos);
      } catch (error) {
        console.error("Failed to fetch pending photos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingPhotos();
  }, []);

  const handleUpload = async () => {
    if (uploading) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const simulateProgress = async () => {
      for (let i = 0; i <= 100; i += 5) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    };

    await simulateProgress();

    // In a real app, this would open a file picker and cropper
    // For this demo, we'll just add a random unsplash image
    const newPhoto = {
      id: Date.now().toString(),
      name: currentUser.name,
      email: currentUser.email,
      userId: currentUser.id,
      userPhoto: currentUser.photo,
      url: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?w=600&h=600&fit=crop`,
      isPrimary: pendingPhotos.length === 0, // First one is primary for demo
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      const allPending = await api.get('pending_photos') || [];
      await api.save('pending_photos', [...allPending, newPhoto]);
      setPendingPhotos(prev => [...prev, newPhoto]);
      toast.success("Photo envoyée pour modération", {
        description: "Votre photo sera visible une fois validée par notre équipe."
      });
    } catch (error) {
      console.error("Failed to upload photo:", error);
      toast.error("Erreur lors de l'envoi de la photo");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeletePending = async (id) => {
    try {
      const allPending = await api.get('pending_photos') || [];
      const updated = allPending.filter(p => p.id !== id);
      await api.save('pending_photos', updated);
      setPendingPhotos(prev => prev.filter(p => p.id !== id));
      toast.success("Photo retirée de la modération");
    } catch (error) {
      console.error("Failed to delete pending photo:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <div className="bg-emerald-500/90 px-3 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" />
            APPROUVÉE
          </div>
        );
      case 'rejected':
        return (
          <div className="bg-red-500/90 px-3 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1">
            <XCircle className="w-2.5 h-2.5" />
            REJETÉE
          </div>
        );
      default:
        return (
          <div className="bg-orange-500/90 px-3 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            EN ATTENTE
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header with Back Button */}
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-orange-500 font-medium hover:underline"
        >
          <ArrowLeft className="w-[18px] h-[18px]" />
          Mes Photos
        </button>
        <span className="text-neutral-400 text-sm">{pendingPhotos.length} photo(s) au total</span>
      </div>

      {/* Guidelines Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden mb-8">
        {/* Good Practices */}
        <div className="p-8 border-b border-neutral-100">
          <div className="flex items-center gap-3 mb-6 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
            <h2 className="text-lg font-bold">Bonnes pratiques pour vos photos</h2>
          </div>
          <ul className="space-y-4">
            {[
              "Utilisez des photos récentes qui vous ressemblent vraiment",
              "Votre visage doit être clairement visible sur la photo principale",
              "Privilégiez des photos prises dans un environnement naturel et bien éclairé",
              "Variez les situations : portrait, loisir, voyage... pour mieux vous présenter",
              "3 à 6 photos est idéal pour un profil attractif et crédible"
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3 text-neutral-600 text-sm">
                <CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0 w-4 h-4" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Forbidden Photos */}
        <div className="p-8 bg-amber-50/30 border-b border-neutral-100">
          <div className="flex items-center gap-3 mb-6 text-amber-600">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-lg font-bold">Photos interdites</h2>
          </div>
          <ul className="space-y-4">
            {[
              "Photos volées sur les réseaux sociaux (Facebook, Instagram, TikTok...)",
              "Images générées par l'intelligence artificielle (IA, Midjourney, DALL-E...)",
              "Photos de célébrités, mannequins ou personnes tierces",
              "Images à caractère sexuel, violent ou inapproprié",
              "Photos floues, retouchées à l'extrême ou trompeuses"
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3 text-neutral-600 text-sm">
                <AlertTriangle className="text-amber-500 mt-0.5 shrink-0 w-4 h-4" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Consequences */}
        <div className="p-8 bg-red-50/30">
          <div className="flex items-center gap-3 mb-4 text-red-600">
            <XCircle className="w-6 h-6" />
            <h2 className="text-lg font-bold">Conséquences en cas de non-respect</h2>
          </div>
          <p className="text-red-700/70 text-sm mb-8 leading-relaxed">
            Notre équipe de modération vérifie régulièrement les profils. Toute infraction peut entraîner les sanctions suivantes, par ordre de gravité :
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl border border-red-100 text-center shadow-sm">
              <AlertTriangle className="mx-auto mb-3 text-amber-500 w-6 h-6" />
              <div className="font-bold text-neutral-800 text-sm mb-1">Avertissement</div>
              <div className="text-[11px] text-neutral-500">Suppression de la photo et notification</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-red-100 text-center shadow-sm">
              <Pause className="mx-auto mb-3 text-blue-500 w-6 h-6" fill="currentColor" />
              <div className="font-bold text-neutral-800 text-sm mb-1">Suspension</div>
              <div className="text-[11px] text-neutral-500">Compte suspendu temporairement</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-red-100 text-center shadow-sm">
              <Ban className="mx-auto mb-3 text-red-500 w-6 h-6" />
              <div className="font-bold text-red-600 text-sm mb-1">Suppression définitive</div>
              <div className="text-[11px] text-neutral-500">Compte supprimé sans récupération possible</div>
            </div>
          </div>

          <div className="flex items-start gap-2 text-red-600/80 text-[11px] italic">
            <Info className="shrink-0 mt-0.5 w-3.5 h-3.5" />
            En ajoutant une photo, vous certifiez qu'il s'agit bien de vous et que vous en êtes l'auteur ou disposez des droits nécessaires.
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="mb-8">
        <motion.div 
          whileHover={!uploading ? { scale: 1.01 } : {}}
          onClick={!uploading ? handleUpload : undefined}
          className={`bg-white rounded-2xl border-2 border-dashed ${uploading ? 'border-neutral-200 cursor-not-allowed' : 'border-orange-400 cursor-pointer hover:bg-orange-50/30'} p-12 text-center transition-all`}
        >
          {uploading ? (
            <div className="max-w-xs mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-orange-600">Téléchargement en cours...</span>
                <span className="text-sm font-bold text-orange-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
                <motion.div 
                  className="bg-orange-500 h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-neutral-400 text-xs mt-4">Veuillez ne pas fermer cette page</p>
            </div>
          ) : (
            <>
              <div className="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="text-orange-500 w-8 h-8" />
              </div>
              <h3 className="text-neutral-800 font-bold text-lg mb-1">Cliquez pour ajouter une photo</h3>
              <p className="text-neutral-400 text-sm">JPG, PNG — l'outil de recadrage s'ouvrira automatiquement</p>
            </>
          )}
        </motion.div>
      </div>

      {/* Photos Grid (Pending/Status) */}
      {pendingPhotos.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-neutral-800 mb-4 flex items-center gap-2">
            <Camera className="text-orange-500 w-5 h-5" />
            Vos photos et leur statut
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {pendingPhotos.map((photo) => (
              <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden border border-neutral-200 group">
                <img 
                  src={photo.url} 
                  alt="User Photo" 
                  className={`w-full h-full object-cover ${photo.status === 'pending' ? 'opacity-60' : 'opacity-100'}`}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                  {getStatusBadge(photo.status)}
                </div>
                
                {/* Delete button only for pending or rejected photos */}
                {(photo.status === 'pending' || photo.status === 'rejected') && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePending(photo.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {pendingPhotos.length === 0 && !loading && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center">
          <p className="text-neutral-400 font-medium mb-1">Aucune photo pour le moment</p>
          <p className="text-neutral-300 text-sm">Ajoutez votre première photo ci-dessus</p>
        </div>
      )}
    </div>
  );
}
