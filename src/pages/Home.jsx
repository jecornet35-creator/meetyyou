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
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const handleOpenQuickSearch = () => setIsQuickSearchOpen(true);
    window.addEventListener('openQuickSearch', handleOpenQuickSearch);
    base44.auth.me().then(async (user) => {
      setCurrentUser(user);
      // Récupérer le profil de l'utilisateur
      const profiles = await base44.entities.Profile.filter({ created_by: user.email });
      if (profiles[0]) {
        setUserProfile(profiles[0]);
      }
    });
    return () => window.removeEventListener('openQuickSearch', handleOpenQuickSearch);
  }, []);

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.Profile.list('-created_date', 100),
    initialData: [],
  });

  const { data: blockedUsers = [] } = useQuery({
    queryKey: ['blockedUsers', currentUser?.email],
    queryFn: async () => {
      if (!currentUser) return [];
      return base44.entities.BlockedUser.filter({ blocker_email: currentUser.email });
    },
    enabled: !!currentUser,
  });

  const blockedEmails = blockedUsers.map(b => b.blocked_email);
  
  // Filtrage par défaut basé sur le profil de l'utilisateur
  const filteredProfiles = profiles.filter(profile => {
    // Exclure les profils bloqués
    if (blockedEmails.includes(profile.created_by)) return false;
    
    // Exclure son propre profil
    if (currentUser && profile.created_by === currentUser.email) return false;
    
    // Si on a le profil utilisateur, appliquer les filtres par défaut
    if (userProfile) {
      // Filtrer par genre recherché
      if (userProfile.seeking_gender) {
        if (profile.i_am !== userProfile.seeking_gender) return false;
      }
      
      // Filtrer par âge (age_min et age_max du profil utilisateur)
      if (userProfile.age_min && profile.age && profile.age < userProfile.age_min) return false;
      if (userProfile.age_max && profile.age && profile.age > userProfile.age_max) return false;
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <NotificationToast />
      <QuickSearchModal isOpen={isQuickSearchOpen} onClose={() => setIsQuickSearchOpen(false)} />
      <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array(15).fill(0).map((_, i) => (
              <Skeleton key={i} className="rounded-lg h-80" />
            ))}
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Aucun profil disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProfiles.map((profile) => (
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