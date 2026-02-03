import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, MessageCircle, Star, Share2, Flag, MapPin, Calendar, CheckCircle } from 'lucide-react';
import Header from '@/components/layout/Header';

export default function ProfileDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const profileId = urlParams.get('id');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: async () => {
      const profiles = await base44.entities.Profile.filter({ id: profileId });
      return profiles[0];
    },
    enabled: !!profileId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-96 bg-gray-200 rounded-xl" />
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-500">Profil non trouvé</p>
          <Link to={createPageUrl('Home')}>
            <Button className="mt-4">Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Retour aux profils
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Main photo */}
          <div className="relative h-96 md:h-[500px]">
            <img
              src={profile.main_photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800'}
              alt={profile.display_name}
              className="w-full h-full object-cover"
            />
            {profile.is_online && (
              <Badge className="absolute top-4 right-4 bg-green-500">En ligne</Badge>
            )}
            {profile.is_verified && (
              <Badge className="absolute top-4 left-4 bg-amber-500 gap-1">
                <CheckCircle className="w-3 h-3" />
                Vérifié
              </Badge>
            )}
          </div>

          {/* Profile info */}
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.display_name}
                  {profile.is_verified && <span className="text-amber-500 ml-2">✓</span>}
                </h1>
                <div className="flex items-center gap-4 mt-2 text-gray-600">
                  {profile.age && <span>{profile.age} ans</span>}
                  {profile.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.city}{profile.country && `, ${profile.country}`}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Flag className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {profile.looking_for && (
              <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Recherche :</strong> {profile.looking_for}
                </p>
              </div>
            )}

            {profile.bio && (
              <div className="mt-6">
                <h2 className="font-semibold text-gray-900 mb-2">À propos</h2>
                <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Photo gallery */}
            {profile.photos && profile.photos.length > 0 && (
              <div className="mt-6">
                <h2 className="font-semibold text-gray-900 mb-3">Photos ({profile.photos.length})</h2>
                <div className="grid grid-cols-3 gap-2">
                  {profile.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-8 flex gap-3">
              <Button className="flex-1 bg-amber-500 hover:bg-amber-600 gap-2">
                <Heart className="w-5 h-5" />
                J'aime
              </Button>
              <Button className="flex-1 gap-2" variant="outline">
                <MessageCircle className="w-5 h-5" />
                Message
              </Button>
              <Button variant="outline" size="icon">
                <Star className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}