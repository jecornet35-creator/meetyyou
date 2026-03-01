import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Heart, MessageCircle, Star, Camera, Lock } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { usePlan } from '@/components/premium/usePlan';

export default function ProfileCard({ profile, currentUser }) {
  const queryClient = useQueryClient();
  const { canMessage, isFree } = usePlan();
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);

  const sendFavoriteMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      const myProfiles = await base44.entities.Profile.filter({ created_by: user.email });
      const myProfile = myProfiles[0];
      const senderName = myProfile?.display_name || myProfile?.first_name || user.full_name || user.email;
      const senderPhoto = myProfile?.main_photo || myProfile?.accepted_photos?.[0] || myProfile?.photos?.[0] || null;
      await base44.entities.Notification.create({
        user_email: profile.created_by,
        type: 'favorite',
        title: `${senderName} vous a ajouté en favori !`,
        message: 'A ajouté votre profil en favori',
        from_profile_name: senderName,
        from_profile_photo: senderPhoto,
        from_profile_id: myProfile?.id,
        is_read: false,
        link: `/ProfileDetail?id=${myProfile?.id || ''}`,
      });
    },
    onSuccess: () => setFavorited(true),
  });

  const sendLikeMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      // Fetch sender's profile to get their real photo and display name
      const myProfiles = await base44.entities.Profile.filter({ created_by: user.email });
      const myProfile = myProfiles[0];
      const senderName = myProfile?.display_name || myProfile?.first_name || user.full_name || user.email;
      const senderPhoto = myProfile?.main_photo || myProfile?.accepted_photos?.[0] || myProfile?.photos?.[0] || null;
      await base44.entities.Notification.create({
        user_email: profile.created_by,
        type: 'like',
        title: `${senderName} vous a liké !`,
        message: 'A aimé votre profil',
        from_profile_name: senderName,
        from_profile_photo: senderPhoto,
        from_profile_id: myProfile?.id,
        is_read: false,
        link: `/ProfileDetail?id=${myProfile?.id || ''}`,
      });
    },
    onSuccess: () => setLiked(true),
  });

  const startConversationMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      // Check if conversation already exists
      const existingConvs = await base44.entities.Conversation.list();
      const existing = existingConvs.find(c => 
        c.participants?.includes(user.email) && c.participants?.includes(profile.created_by)
      );
      
      if (existing) {
        window.location.href = createPageUrl('Messages') + `?conv=${existing.id}`;
        return existing;
      }

      // Create new conversation
      const conv = await base44.entities.Conversation.create({
        participants: [user.email, profile.created_by],
        participant_profiles: [
          { email: user.email, display_name: user.full_name, photo: user.main_photo },
          { email: profile.created_by, display_name: profile.display_name, photo: profile.main_photo }
        ],
        unread_count: { [user.email]: 0, [profile.created_by]: 0 }
      });

      window.location.href = createPageUrl('Messages') + `?conv=${conv.id}`;
      return conv;
    }
  });

  const isReallyOnline = (profile) => {
    if (!profile.is_online) return false;
    if (!profile.last_seen) return false;
    const diffMin = (Date.now() - new Date(profile.last_seen).getTime()) / 60000;
    return diffMin < 5;
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return '';
    const diff = Math.floor((Date.now() - new Date(lastSeen).getTime()) / 60000);
    if (diff < 60) return `il y a ${diff} min`;
    if (diff < 1440) return `il y a ${Math.floor(diff / 60)}h`;
    return `il y a ${Math.floor(diff / 1440)}j`;
  };

  return (
    <div className="relative group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <Link to={createPageUrl('ProfileDetail') + `?id=${profile.id}`}>
        <div className="relative overflow-hidden h-64">
          {profile.main_photo ? (
            <img
              src={profile.main_photo}
              alt={profile.display_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Camera className="w-12 h-12 text-gray-400" />
            </div>
          )}
          
          {/* Online indicator */}
          {isReallyOnline(profile) && (
            <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg" />
          )}
          
          {/* Verified badge */}
          {profile.is_verified && (
            <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              ✓ Vérifié
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-lg">{profile.display_name}</h3>
              {profile.is_verified && <span className="text-amber-400">✓</span>}
            </div>
            <p className="text-sm text-white/90">
              {profile.age && `${profile.age} • `}{profile.city}{profile.country && `, ${profile.country}`}
            </p>
            {profile.looking_for && (
              <p className="text-xs text-amber-300 mt-1">
                Recherche : {profile.looking_for}
              </p>
            )}
            {!isReallyOnline(profile) && profile.last_seen && (
              <p className="text-xs text-white/70 mt-1">
                {formatLastSeen(profile.last_seen)}
              </p>
            )}
            {isReallyOnline(profile) && (
              <p className="text-xs text-green-400 mt-1">En ligne</p>
            )}
          </div>
        </div>
      </Link>
      
      {/* Action buttons */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-white border-t">
        <button
          onClick={() => !liked && sendLikeMutation.mutate()}
          disabled={liked || sendLikeMutation.isPending}
          title={liked ? "Déjà liké" : "J'aime ce profil"}
          className="p-1.5 hover:bg-amber-50 rounded-full transition-colors group/btn"
        >
          <Heart className={`w-4 h-4 transition-colors ${liked ? 'text-red-500 fill-red-500' : 'text-gray-400 group-hover/btn:text-amber-500'}`} />
        </button>
        {canMessage ? (
          <button
            onClick={() => startConversationMutation.mutate()}
            disabled={startConversationMutation.isPending}
            title="Envoyer un message"
            className="p-1.5 hover:bg-amber-50 rounded-full transition-colors group/btn"
          >
            <MessageCircle className="w-4 h-4 text-gray-400 group-hover/btn:text-amber-500 transition-colors" />
          </button>
        ) : (
          <Link to={createPageUrl('SubscriptionPlans')} title="Passer en Premium pour envoyer des messages">
            <span className="p-1.5 flex items-center justify-center hover:bg-amber-50 rounded-full transition-colors relative">
              <MessageCircle className="w-4 h-4 text-gray-300" />
              <Lock className="w-2.5 h-2.5 text-amber-400 absolute -bottom-0.5 -right-0.5" />
            </span>
          </Link>
        )}
        <button
          onClick={() => !favorited && sendFavoriteMutation.mutate()}
          disabled={favorited || sendFavoriteMutation.isPending}
          title={favorited ? "Ajouté en favori" : "Ajouter aux favoris"}
          className="p-1.5 hover:bg-amber-50 rounded-full transition-colors group/btn"
        >
          <Star className={`w-4 h-4 transition-colors ${favorited ? 'text-amber-500 fill-amber-400' : 'text-gray-400 group-hover/btn:text-amber-500'}`} />
        </button>
        <div className="flex items-center gap-1 text-gray-400 text-xs" title={`${profile.photos?.length || 1} photo(s)`}>
          <Camera className="w-3.5 h-3.5" />
          <span>{profile.photos?.length || 1}</span>
        </div>
      </div>
    </div>
  );
}