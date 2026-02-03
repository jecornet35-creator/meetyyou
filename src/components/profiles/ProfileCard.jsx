import React from 'react';
import { Heart, MessageCircle, Star, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ProfileCard({ profile, size = 'medium' }) {
  const isLarge = size === 'large';
  
  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return '';
    const diff = Math.floor((Date.now() - new Date(lastSeen).getTime()) / 60000);
    if (diff < 60) return `il y a ${diff} min`;
    if (diff < 1440) return `il y a ${Math.floor(diff / 60)}h`;
    return `il y a ${Math.floor(diff / 1440)}j`;
  };

  return (
    <div className={`relative group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${isLarge ? 'row-span-2' : ''}`}>
      <Link to={createPageUrl('ProfileDetail') + `?id=${profile.id}`}>
        <div className={`relative overflow-hidden ${isLarge ? 'h-80' : 'h-48'}`}>
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
      <div className="flex items-center justify-between px-3 py-2 bg-white border-t">
        <button className="p-2 hover:bg-amber-50 rounded-full transition-colors group/btn">
          <Heart className="w-5 h-5 text-gray-400 group-hover/btn:text-amber-500 transition-colors" />
        </button>
        <button className="p-2 hover:bg-amber-50 rounded-full transition-colors group/btn">
          <MessageCircle className="w-5 h-5 text-gray-400 group-hover/btn:text-amber-500 transition-colors" />
        </button>
        <button className="p-2 hover:bg-amber-50 rounded-full transition-colors group/btn">
          <Star className="w-5 h-5 text-gray-400 group-hover/btn:text-amber-500 transition-colors" />
        </button>
        <div className="flex items-center gap-1 text-gray-400 text-sm">
          <Camera className="w-4 h-4" />
          <span>{profile.photos?.length || 1}</span>
        </div>
      </div>
    </div>
  );
}