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

  useEffect(() => {
    const handleOpenQuickSearch = () => setIsQuickSearchOpen(true);
    window.addEventListener('openQuickSearch', handleOpenQuickSearch);
    return () => window.removeEventListener('openQuickSearch', handleOpenQuickSearch);
  }, []);

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.Profile.list('-created_date', 50),
    initialData: [],
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
        ) : profiles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Aucun profil disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {profiles.map((profile) => (
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