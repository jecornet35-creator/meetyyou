import React, { useEffect, useState } from 'react';
import { 
  Clock, 
  User, 
  CheckCircle2, 
  Check, 
  Trash2, 
  Camera
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { toast } from 'sonner';

const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
  <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex items-center gap-4 flex-1 min-w-[250px]">
    <div className={`p-4 rounded-xl ${bgColor} ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <h3 className="text-2xl font-bold text-neutral-900">{value}</h3>
      <p className="text-sm text-neutral-500 font-medium">{label}</p>
    </div>
  </div>
);

export default function PhotoManagement() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      try {
        const data = await api.get('pending_photos');
        setPhotos(data || []);
      } catch (error) {
        console.error("Failed to fetch pending photos:", error);
        toast.error("Erreur lors du chargement des photos");
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, []);

  const handleAcceptPhoto = async (photo) => {
    try {
      // 1. Update user profile
      const profiles = await api.get('profiles');
      const updatedProfiles = profiles.map(p => {
        if (p.id === photo.userId) {
          // If it's primary, update the main photo
          if (photo.isPrimary) {
            return { ...p, photo: photo.url };
          }
          // In a real app, we might have a 'photos' array
          // For now, let's just assume we update the main photo if it's primary
          // or we could add it to a photos array if it existed.
          // Let's check if p.photos exists, if not create it
          const currentPhotos = p.photos || [];
          return { ...p, photos: [...currentPhotos, photo.url] };
        }
        return p;
      });
      await api.save('profiles', updatedProfiles);

      // 2. Remove from pending photos
      const updatedPending = photos.filter(p => p.id !== photo.id);
      await api.save('pending_photos', updatedPending);
      setPhotos(updatedPending);

      toast.success(`Photo de ${photo.name} acceptée`);
    } catch (error) {
      console.error("Failed to accept photo:", error);
      toast.error("Erreur lors de l'acceptation de la photo");
    }
  };

  const handleDeletePhoto = async (photo) => {
    try {
      // Remove from pending photos
      const updatedPending = photos.filter(p => p.id !== photo.id);
      await api.save('pending_photos', updatedPending);
      setPhotos(updatedPending);

      toast.success(`Photo de ${photo.name} supprimée`);
    } catch (error) {
      console.error("Failed to delete photo:", error);
      toast.error("Erreur lors de la suppression de la photo");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8"
    >
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Modération des photos</h1>
        <p className="text-neutral-500">Photos en attente de validation — les photos vérifiées sont exclues</p>
      </header>

      {/* Stats Grid */}
      <div className="flex flex-wrap gap-6 mb-8">
        <StatCard icon={Clock} label="Photos en attente" value={photos.length.toString()} color="text-yellow-600" bgColor="bg-yellow-50" />
        <StatCard icon={User} label="Profils concernés" value={new Set(photos.map(p => p.userId)).size.toString()} color="text-blue-600" bgColor="bg-blue-50" />
        <StatCard icon={CheckCircle2} label="Photos vérifiées (exclues)" value="0" color="text-emerald-600" bgColor="bg-emerald-50" />
      </div>

      {/* Photo Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : photos.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-neutral-100 shadow-sm">
          <Camera className="mx-auto mb-4 text-neutral-200 w-12 h-12" />
          <h3 className="text-xl font-bold text-neutral-800 mb-2">Aucune photo en attente</h3>
          <p className="text-neutral-400">Toutes les photos ont été modérées.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {photos.map((photo) => (
            <motion.div 
              key={photo.id}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="relative aspect-square">
                <img 
                  src={photo.url} 
                  alt={photo.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {photo.isPrimary && (
                  <div className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm">
                    Principale
                  </div>
                )}
              </div>
              
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <img 
                    src={photo.userPhoto} 
                    alt={photo.name} 
                    className="w-8 h-8 rounded-full object-cover border border-neutral-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-neutral-900 truncate">{photo.name}</p>
                    <p className="text-[10px] text-neutral-400 truncate">{photo.email}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-auto">
                  <button 
                    onClick={() => handleAcceptPhoto(photo)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Accepter
                  </button>
                  <button 
                    onClick={() => handleDeletePhoto(photo)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Supprimer
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
