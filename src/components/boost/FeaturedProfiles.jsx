import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Rocket, MapPin } from 'lucide-react';

export default function FeaturedProfiles() {
  const { data: boostedProfiles = [] } = useQuery({
    queryKey: ['featuredProfiles'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const boosts = await base44.entities.ProfileBoost.filter({ is_active: true });
      const activeBoosts = boosts.filter(b => b.expires_at > now);
      if (activeBoosts.length === 0) return [];

      const profileIds = [...new Set(activeBoosts.map(b => b.profile_id))];
      const profileResults = await Promise.all(
        profileIds.slice(0, 8).map(id => base44.entities.Profile.filter({ id }).then(r => r[0]).catch(() => null))
      );
      return profileResults.filter(Boolean);
    },
    refetchInterval: 60000,
  });

  if (boostedProfiles.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-3">
          <Rocket className="w-4 h-4 text-amber-600" />
          <h2 className="text-sm font-bold text-amber-700 uppercase tracking-wide">Profils à la une</h2>
          <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">{boostedProfiles.length}</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {boostedProfiles.map(profile => {
            const photo = profile.main_photo || profile.accepted_photos?.[0] || profile.photos?.[0];
            const name = profile.display_name || profile.first_name || 'Utilisateur';
            return (
              <Link
                key={profile.id}
                to={createPageUrl('ProfileDetail') + '?id=' + profile.id}
                className="flex-shrink-0 group"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400 ring-2 ring-amber-200 group-hover:ring-amber-400 transition-all">
                    {photo ? (
                      <img src={photo} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-amber-100 flex items-center justify-center">
                        <span className="text-amber-600 font-bold text-lg">{name[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5">
                    <Rocket className="w-2.5 h-2.5 text-white" />
                  </div>
                  {profile.is_online && (
                    <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <p className="text-xs text-center text-gray-600 mt-1 max-w-[64px] truncate">{name}</p>
                {profile.city && (
                  <p className="text-xs text-center text-gray-400 max-w-[64px] truncate flex items-center justify-center gap-0.5">
                    <MapPin className="w-2 h-2" />{profile.city}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}