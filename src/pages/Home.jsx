import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Header from '@/components/layout/Header';
import FilterBar from '@/components/profiles/FilterBar';
import ProfileCard from '@/components/profiles/ProfileCard';
import { Skeleton } from '@/components/ui/skeleton';
import NotificationToast from '@/components/notifications/NotificationToast';
import QuickSearchModal from '@/components/search/QuickSearchModal';
import FeaturedProfiles from '@/components/boost/FeaturedProfiles';


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

  // Fetch advanced filter (permanent, saved in DB)
  const { data: advancedFilter } = useQuery({
    queryKey: ['advancedFilter', currentUser?.email],
    queryFn: async () => {
      const results = await base44.entities.AdvancedFilter.filter({ created_by: currentUser.email });
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

  // Ephemeral quick filter from sessionStorage
  const [quickFilter, setQuickFilter] = useState(() => {
    try {
      const saved = sessionStorage.getItem('quickFilter');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // Listen for quick filter updates
  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = sessionStorage.getItem('quickFilter');
        setQuickFilter(saved ? JSON.parse(saved) : null);
      } catch { setQuickFilter(null); }
    };
    window.addEventListener('quickFilterUpdated', handleStorage);
    return () => window.removeEventListener('quickFilterUpdated', handleStorage);
  }, []);

  // Use advanced filter if set, fallback to correspondance for gender
  const af = advancedFilter;
  const lookingFor = af?.looking_for || myCorrespondance?.looking_for;
  const genderFilter = lookingFor === 'men' ? 'homme'
    : lookingFor === 'women' ? 'femme'
    : null;

  const hasValue = (v) => v && v !== '' && v !== 'no_preference';
  const arrHasValue = (arr) => arr && arr.length > 0 && !arr.includes('no_preference');

  // Quick filter gender (overrides advanced filter if set)
  const quickLookingFor = quickFilter?.looking_for;
  const effectiveLookingFor = quickLookingFor || lookingFor;
  const effectiveGenderFilter = effectiveLookingFor === 'men' ? 'homme'
    : effectiveLookingFor === 'women' ? 'femme'
    : null;

  const visibleProfiles = profiles.filter(p => {
    if (blockedEmails.includes(p.created_by)) return false;
    if (effectiveGenderFilter && p.gender && p.gender !== effectiveGenderFilter) return false;

    // Quick filter age (ephemeral)
    if (quickFilter?.age_min && p.age && p.age < Number(quickFilter.age_min)) return false;
    if (quickFilter?.age_max && p.age && p.age > Number(quickFilter.age_max)) return false;

    // Quick filter country (ephemeral)
    if (quickFilter?.country && quickFilter.country !== 'all' && p.country && !p.country.toLowerCase().includes(quickFilter.country.toLowerCase())) return false;

    if (!af) return true;

    // Age
    if (hasValue(af.age_min) && p.age && p.age < Number(af.age_min)) return false;
    if (hasValue(af.age_max) && p.age && p.age > Number(af.age_max)) return false;

    // Location (advanced filter)
    if (hasValue(af.country) && p.country && !p.country.toLowerCase().includes(af.country.toLowerCase())) return false;
    if (hasValue(af.state) && p.state && !p.state.toLowerCase().includes(af.state.toLowerCase())) return false;
    if (hasValue(af.city) && p.city && !p.city.toLowerCase().includes(af.city.toLowerCase())) return false;

    // Quick filter city (ephemeral)
    if (quickFilter?.city && quickFilter.city.trim() !== '' && p.city && !p.city.toLowerCase().includes(quickFilter.city.toLowerCase())) return false;

    // Body type
    if (arrHasValue(af.body_type) && p.body_type && !af.body_type.includes(p.body_type)) return false;
    // Ethnicity
    if (arrHasValue(af.ethnicity) && p.ethnicity && !af.ethnicity.includes(p.ethnicity)) return false;
    // Appearance
    if (arrHasValue(af.appearance) && p.appearance && !af.appearance.includes(p.appearance)) return false;
    // Smoking
    if (arrHasValue(af.smoking) && p.smoking && !af.smoking.includes(p.smoking)) return false;
    // Drinking
    if (arrHasValue(af.drinking) && p.drinking && !af.drinking.includes(p.drinking)) return false;
    // Ready to move
    if (arrHasValue(af.ready_to_move) && p.ready_to_move && !af.ready_to_move.includes(p.ready_to_move)) return false;
    // Religion
    if (arrHasValue(af.religion) && p.religion && !af.religion.includes(p.religion)) return false;
    // Astrological sign
    if (arrHasValue(af.astrological_sign) && p.astrological_sign && !af.astrological_sign.includes(p.astrological_sign)) return false;
    // Relationship looking for
    if (arrHasValue(af.relationship_looking_for) && p.relationship_looking_for) {
      const match = p.relationship_looking_for.some(r => af.relationship_looking_for.includes(r));
      if (!match) return false;
    }
    // Education
    if (hasValue(af.education_level) && p.education_level) {
      const levels = ['primary_elementary','college','high_school','vocational_education','license','mastery','doctorate'];
      const minIdx = levels.indexOf(af.education_level);
      const pIdx = levels.indexOf(p.education_level);
      if (minIdx >= 0 && pIdx >= 0 && pIdx < minIdx) return false;
    }
    // English proficiency
    if (hasValue(af.english_proficiency) && p.english_proficiency) {
      const levels = ['dont_speak','average','good','very_good','good_command'];
      const minIdx = levels.indexOf(af.english_proficiency);
      const pIdx = levels.indexOf(p.english_proficiency);
      if (minIdx >= 0 && pIdx >= 0 && pIdx < minIdx) return false;
    }
    // French proficiency
    if (hasValue(af.french_proficiency) && p.french_proficiency) {
      const levels = ['dont_speak','average','good','very_good','good_command'];
      const minIdx = levels.indexOf(af.french_proficiency);
      const pIdx = levels.indexOf(p.french_proficiency);
      if (minIdx >= 0 && pIdx >= 0 && pIdx < minIdx) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <Header user={myProfile} />
      <QuickSearchModal isOpen={isQuickSearchOpen} onClose={() => setIsQuickSearchOpen(false)} />
      <FeaturedProfiles />
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