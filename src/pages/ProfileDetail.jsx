import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, MessageCircle, Star, MapPin, CheckCircle, Flag } from 'lucide-react';
import Header from '@/components/layout/Header';

const translateValue = (value, field) => {
  const translations = {
    hair_color: {
      bald_shaved: 'Chauve/Rasé', black: 'Noir', blond: 'Blond', brown: 'Brun', 
      grey_white: 'Gris/Blanc', chestnut: 'Châtain', redhead: 'Roux', 
      change_often: 'Change souvent', other: 'Autre'
    },
    eye_color: {
      black: 'Noir', blue: 'Bleu', brown: 'Brun', green: 'Vert', 
      gray: 'Gris', hazelnut: 'Noisette', other: 'Autre'
    },
    body_type: {
      little: 'Petit', thin: 'Mince', sporty: 'Sportif', average: 'Moyen',
      few_extra_kilos: 'Quelques kilos en plus', round: 'Rond', 
      large_magnificent: 'Magnifiquement grande'
    },
    ethnicity: {
      african: 'Africain', african_american: 'Afro-américain', 
      afro_caribbean: 'Afro-caribéen', arabic: 'Arabe', asian: 'Asiatique',
      caucasian: 'Caucasien', hispanic_latino: 'Hispanique/Latino',
      indian: 'Indien', metis: 'Métis', pacific_islander: 'Insulaire du Pacifique',
      other: 'Autre', prefer_not_comment: 'Préfère ne pas commenter'
    },
    smoking: { smoke: 'Fume', dont_smoke: 'Ne fume pas', smoke_occasionally: 'Fume occasionnellement' },
    drinking: { drink: 'Boit', dont_drink: 'Ne boit pas', wood_on_occasion: 'Boit à l\'occasion' },
    family_situation: {
      bachelor: 'Célibataire', separated: 'Séparé', widower: 'Veuf/Veuve',
      divorce: 'Divorcé', other: 'Autre', prefer_not_comment: 'Préfère ne pas commenter'
    },
    want_children: { yes: 'Oui', not_sure: 'Pas sûr', no: 'Non' },
    ready_to_move: {
      only_within_country: 'Seulement dans le pays',
      to_another_country: 'Vers un autre pays',
      do_not_wish_to_move: 'Ne souhaite pas déménager',
      not_sure: 'Pas sûr'
    }
  };
  return translations[field]?.[value] || value;
};

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

  const { data: correspondance } = useQuery({
    queryKey: ['correspondance', profile?.created_by],
    queryFn: async () => {
      const corrs = await base44.entities.Correspondance.filter({ created_by: profile.created_by });
      return corrs[0] || null;
    },
    enabled: !!profile,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-96 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-500">Profil non trouvé</p>
          <Link to={createPageUrl('Home')}>
            <Button className="mt-4">Retour</Button>
          </Link>
        </div>
      </div>
    );
  }

  const InfoRow = ({ label, userValue, searchValue, matches }) => (
    <div className="grid grid-cols-3 py-3 border-b border-gray-100 hover:bg-gray-50">
      <div className="text-sm font-medium text-gray-600">{label}:</div>
      <div className={`text-sm ${matches ? 'bg-green-100 text-green-800 px-2 py-1 rounded' : 'text-gray-900'}`}>
        {userValue || 'Non renseigné'}
      </div>
      <div className={`text-sm ${matches ? 'bg-green-100 text-green-800 px-2 py-1 rounded' : searchValue === 'Pas de préférence' ? 'text-gray-400' : 'text-gray-900'}`}>
        {searchValue || 'Pas de préférence'}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Photo + Quick Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-6">
              {/* Main photo */}
              <div className="relative h-80">
                <img
                  src={profile.main_photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'}
                  alt={profile.display_name}
                  className="w-full h-full object-cover"
                />
                {profile.is_online && (
                  <div className="absolute top-3 right-3 flex items-center gap-2 bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full" />
                    En ligne
                  </div>
                )}
                {profile.is_verified && (
                  <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Vérifié
                  </div>
                )}
              </div>

              {/* Quick info */}
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {profile.display_name}
                  {profile.is_verified && <CheckCircle className="w-5 h-5 inline ml-2 text-amber-500" />}
                </h1>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  {profile.age && <p>{profile.age} ans</p>}
                  {profile.i_am && <p>{profile.i_am === 'homme' ? 'Homme' : 'Femme'} / {profile.family_situation ? translateValue(profile.family_situation, 'family_situation') : 'Non renseigné'}</p>}
                  {profile.city && (
                    <p className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.city}{profile.country && `, ${profile.country}`}
                    </p>
                  )}
                  {profile.seeking_gender && (
                    <p>Cherche: {profile.seeking_gender === 'homme' ? 'Homme' : 'Femme'} {profile.age_min && profile.age_max && `${profile.age_min}-${profile.age_max} ans`}</p>
                  )}
                  {profile.relationship_looking_for && profile.relationship_looking_for.length > 0 && (
                    <p>Pour: {profile.relationship_looking_for.join(', ')}</p>
                  )}
                </div>

                {profile.about_yourself && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 italic">{profile.about_yourself}</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="space-y-2">
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 gap-2">
                    <Heart className="w-4 h-4" />
                    J'aime
                  </Button>
                  <Button className="w-full gap-2" variant="outline">
                    <MessageCircle className="w-4 h-4" />
                    Envoyer un message
                  </Button>
                  <div className="flex gap-2">
                    <Button className="flex-1 gap-2" variant="outline">
                      <Star className="w-4 h-4" />
                      Favori
                    </Button>
                    <Button variant="outline" size="icon">
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Detailed comparison */}
          <div className="lg:col-span-2 space-y-6">
            {/* Comparison table header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <h3 className="text-sm font-medium text-gray-500">Critère</h3>
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-semibold text-gray-900">{profile.display_name}</h3>
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-semibold text-gray-900">Recherche</h3>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-100" />
                  <span className="text-gray-600">Correspondance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-100" />
                  <span className="text-gray-600">Pas de correspondance</span>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3">
                <h2 className="text-white font-semibold">Informations de base</h2>
              </div>
              <div className="p-6">
                <InfoRow 
                  label="Niveau d'études" 
                  userValue={profile.education_level}
                  searchValue={correspondance?.education_level || 'Pas de préférence'}
                />
                <InfoRow 
                  label="A des enfants" 
                  userValue={profile.has_children || 'Non'}
                  searchValue={correspondance?.has_children || 'Pas de préférence'}
                />
                <InfoRow 
                  label="Alcool" 
                  userValue={translateValue(profile.drinking, 'drinking')}
                  searchValue={correspondance?.drinking?.[0] || 'Pas de préférence'}
                />
                <InfoRow 
                  label="Tabac" 
                  userValue={translateValue(profile.smoking, 'smoking')}
                  searchValue={correspondance?.smoking?.[0] || 'Pas de préférence'}
                />
                <InfoRow 
                  label="Religion" 
                  userValue={profile.religion}
                  searchValue={correspondance?.religion?.[0] || 'Pas de préférence'}
                />
                <InfoRow 
                  label="Profession" 
                  userValue={profile.occupation}
                  searchValue={correspondance?.occupation?.[0] || 'Pas de préférence'}
                />
              </div>
            </div>

            {/* Appearance */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-3">
                <h2 className="text-white font-semibold">Apparence</h2>
              </div>
              <div className="p-6">
                <InfoRow 
                  label="Couleur cheveux" 
                  userValue={translateValue(profile.hair_color, 'hair_color')}
                  searchValue={correspondance?.hair_color?.[0] || 'Pas de préférence'}
                />
                <InfoRow 
                  label="Couleur yeux" 
                  userValue={translateValue(profile.eye_color, 'eye_color')}
                  searchValue={correspondance?.eye_color?.[0] || 'Pas de préférence'}
                />
                <InfoRow 
                  label="Taille" 
                  userValue={profile.height}
                  searchValue={correspondance?.height_min && correspondance?.height_max ? `${correspondance.height_min} - ${correspondance.height_max}` : 'Pas de préférence'}
                />
                <InfoRow 
                  label="Poids" 
                  userValue={profile.weight}
                  searchValue={correspondance?.weight_min && correspondance?.weight_max ? `${correspondance.weight_min} - ${correspondance.weight_max}` : 'Pas de préférence'}
                />
                <InfoRow 
                  label="Type de corps" 
                  userValue={translateValue(profile.body_type, 'body_type')}
                  searchValue={correspondance?.body_type?.[0] || 'Pas de préférence'}
                />
                <InfoRow 
                  label="Ethnicité" 
                  userValue={translateValue(profile.ethnicity, 'ethnicity')}
                  searchValue={correspondance?.ethnicity?.[0] || 'Pas de préférence'}
                />
                <InfoRow 
                  label="Art corporel" 
                  userValue={profile.body_art?.join(', ')}
                  searchValue={correspondance?.body_art?.[0] || 'Pas de préférence'}
                />
                <InfoRow 
                  label="Apparence" 
                  userValue={translateValue(profile.appearance, 'appearance')}
                  searchValue={correspondance?.appearance?.[0] || 'Pas de préférence'}
                />
              </div>
            </div>

            {/* Lifestyle */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-3">
                <h2 className="text-white font-semibold">Style de vie</h2>
              </div>
              <div className="p-6">
                <InfoRow 
                  label="Prêt à déménager" 
                  userValue={translateValue(profile.ready_to_move, 'ready_to_move')}
                  searchValue={correspondance?.ready_to_move?.[0] || 'Pas de préférence'}
                />
                <InfoRow 
                  label="Situation familiale" 
                  userValue={translateValue(profile.family_situation, 'family_situation')}
                  searchValue={correspondance?.family_situation?.[0] || 'Pas de préférence'}
                />
                <InfoRow 
                  label="Veut des enfants" 
                  userValue={translateValue(profile.want_children, 'want_children')}
                  searchValue={correspondance?.want_children?.[0] || 'Pas de préférence'}
                />
                <InfoRow 
                  label="Situation de vie" 
                  userValue={profile.living_situation}
                  searchValue={correspondance?.living_situation?.[0] || 'Pas de préférence'}
                />
                <InfoRow 
                  label="Revenu annuel" 
                  userValue={profile.annual_income}
                  searchValue={correspondance?.annual_income_min || 'Pas de préférence'}
                />
              </div>
            </div>

            {/* About */}
            {profile.about_me && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3">
                  <h2 className="text-white font-semibold">À propos de moi</h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 leading-relaxed">{profile.about_me}</p>
                </div>
              </div>
            )}

            {/* Looking for */}
            {profile.looking_for_in_partner && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-6 py-3">
                  <h2 className="text-white font-semibold">Je recherche</h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 leading-relaxed">{profile.looking_for_in_partner}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}