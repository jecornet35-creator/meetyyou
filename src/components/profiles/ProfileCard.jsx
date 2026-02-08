import React from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Heart, MessageCircle, Star, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import TrustBadge from '@/components/trust/TrustBadge';

export default function ProfileCard({ profile, currentUser }) {
  const queryClient = useQueryClient();

  const { data: trustScore } = useQuery({
    queryKey: ['trust-score', profile.created_by],
    queryFn: async () => {
      const scores = await base44.entities.TrustScore.filter({ user_email: profile.created_by });
      return scores[0];
    },
    enabled: !!profile.created_by,
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
          <img
            src={profile.main_photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'}
            alt={profile.display_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Online indicator */}
          {profile.is_online && (
            <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg" />
          )}
          
          {/* Verified badge */}
          {profile.is_verified && (
            <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              ✓ Vérifié
            </div>
          )}

          {/* Trust Score Badge */}
          {trustScore && (
            <div className="absolute top-3 left-3" style={{ marginTop: profile.is_verified ? '28px' : '0' }}>
              <TrustBadge trustScore={trustScore} />
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
            {!profile.is_online && profile.last_seen && (
              <p className="text-xs text-white/70 mt-1">
                {formatLastSeen(profile.last_seen)}
              </p>
            )}
            {profile.is_online && (
              <p className="text-xs text-green-400 mt-1">En ligne</p>
            )}
          </div>
        </div>
      </Link>
      
      {/* Action buttons */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-white border-t">
        <button className="p-1.5 hover:bg-amber-50 rounded-full transition-colors group/btn">
          <Heart className="w-4 h-4 text-gray-400 group-hover/btn:text-amber-500 transition-colors" />
        </button>
        <button 
          onClick={() => startConversationMutation.mutate()}
          disabled={startConversationMutation.isPending}
          className="p-1.5 hover:bg-amber-50 rounded-full transition-colors group/btn"
        >
          <MessageCircle className="w-4 h-4 text-gray-400 group-hover/btn:text-amber-500 transition-colors" />
        </button>
        <button className="p-1.5 hover:bg-amber-50 rounded-full transition-colors group/btn">
          <Star className="w-4 h-4 text-gray-400 group-hover/btn:text-amber-500 transition-colors" />
        </button>
        <div className="flex items-center gap-1 text-gray-400 text-xs">
          <Camera className="w-3.5 h-3.5" />
          <span>{profile.photos?.length || 1}</span>
        </div>
      </div>
    </div>
  );
}