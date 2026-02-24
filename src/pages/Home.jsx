import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Header from '@/components/layout/Header';
import FilterBar from '@/components/profiles/FilterBar';
import ProfileCard from '@/components/profiles/ProfileCard';
import { Skeleton } from '@/components/ui/skeleton';
import NotificationToast from '@/components/notifications/NotificationToast';
import QuickSearchModal from '@/components/search/QuickSearchModal';


export default function Home() {
  const [activeFilter, setActiveFilter] = useState('correspondences');
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(user => {
      setCurrentUser(user);
      // Save pending signup data (profile + correspondance) if it exists
      const pending = localStorage.getItem('pendingSignupData');
      if (pending && user) {
        try {
          const { profile: profileData, correspondance: corrData } = JSON.parse(pending);
          localStorage.removeItem('pendingSignupData');
          // Check if profile already exists for this user
          base44.entities.Profile.filter({ created_by: user.email }).then(existing => {
            if (existing.length === 0) {
              base44.entities.Profile.create({ ...profileData, is_online: true });
            }
          });
          // Check if correspondance already exists
          base44.entities.Correspondance.filter({ created_by: user.email }).then(existing => {
            if (existing.length === 0) {
              base44.entities.Correspondance.create(corrData);
            }
          });
        } catch (e) {
          // ignore parse errors
        }
      }
    }).catch(() => {});
    const handleOpenQuickSearch = () => setIsQuickSearchOpen(true);
    window.addEventListener('openQuickSearch', handleOpenQuickSearch);
    return () => window.removeEventListener('openQuickSearch', handleOpenQuickSearch);
  }, []);

  // Fetch current user's correspondance to know their looking_for filter
  const { data: myCorrespondance } = useQuery({
    queryKey: ['myCorrespondance', currentUser?.email],
    queryFn: async () => {
      const results = await base44.entities.Correspondance.filter({ created_by: currentUser.email });
      return results[0] || null;
    },
    enabled: !!currentUser,
  });

  const { data: myProfile } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: async () => {
      const results = await base44.entities.Profile.filter({ created_by: currentUser.email });
      return results[0] || null;
    },
    enabled: !!currentUser,
  });

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.Profile.list('-last_seen', 100),
    initialData: [],
  });

  const { data: blockedEmails = [] } = useQuery({
    queryKey: ['blockedEmails'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const iBlocked = await base44.entities.BlockedUser.filter({ blocker_email: user.email });
      const blockedMe = await base44.entities.BlockedUser.filter({ blocked_email: user.email });
      return [
        ...iBlocked.map(b => b.blocked_email),
        ...blockedMe.map(b => b.blocker_email),
      ];
    },
    enabled: !!currentUser,
    initialData: [],
  });

  // Map looking_for value to gender enum used in Profile
  const genderFilter = myCorrespondance?.looking_for === 'men' ? 'homme'
    : myCorrespondance?.looking_for === 'women' ? 'femme'
    : null; // 'both' or not set = show all

  const visibleProfiles = profiles.filter(p => {
    if (blockedEmails.includes(p.created_by)) return false;
    if (genderFilter && p.gender && p.gender !== genderFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <QuickSearchModal isOpen={isQuickSearchOpen} onClose={() => setIsQuickSearchOpen(false)} />
      <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array(15).fill(0).map((_, i) => (
              <Skeleton key={i} className="rounded-lg h-80" />
            ))}
          </div>
        ) : visibleProfiles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Aucun profil disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {visibleProfiles.map((profile) => (
              <ProfileCard 
                key={profile.id} 
                profile={profile}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}