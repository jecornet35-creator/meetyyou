import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Header from '@/components/layout/Header';
import FilterBar from '@/components/profiles/FilterBar';
import ProfileCard from '@/components/profiles/ProfileCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [activeFilter, setActiveFilter] = useState('correspondences');

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.Profile.list('-created_date', 50),
    initialData: [],
  });

  // Generate card sizes for masonry effect
  const getCardSize = (index) => {
    const pattern = [0, 3, 5, 8, 11, 14];
    return pattern.includes(index % 15) ? 'large' : 'medium';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array(15).fill(0).map((_, i) => (
              <Skeleton key={i} className={`rounded-lg ${getCardSize(i) === 'large' ? 'row-span-2 h-96' : 'h-64'}`} />
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Aucun profil disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-max">
            {profiles.map((profile, index) => (
              <ProfileCard 
                key={profile.id} 
                profile={profile} 
                size={getCardSize(index)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}