import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

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
    polygamy: {
      accept: 'J\'accepte la polygamie',
      against: 'Je suis contre la polygamie',
      might_accept: 'Je pourrais accepter'
    }
  };
  return translations[field]?.[value] || value;
};

export default function AdminUserProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const profileId = urlParams.get('id');
  const [currentPhoto, setCurrentPhoto] = useState(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['admin-profile', profileId],
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

  const InfoRow = ({ label, userValue, searchValue }) => (
    <div className="grid grid-cols-3 py-2 border-b border-gray-100 text-sm">
      <div className="font-medium text-gray-600">{label}:</div>
      <div className="text-gray-900">{userValue || 'Non renseigné'}</div>
      <div className="text-gray-500">{searchValue || 'Pas de préférence'}</div>
    </div>
  );

  if (isLoading || !profile) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar currentPage="AdminUsers" />
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-96 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentPage="AdminUsers" />
      
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Link to={createPageUrl('AdminUsers')} className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-6">
                <div className="relative h-80">
                  <img
                    src={currentPhoto || profile.main_photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'}
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

                {profile.photos && profile.photos.length > 0 && (
                  <div className="px-4 py-3 border-t border-gray-100">
                    <div className="flex gap-2 overflow-x-auto">
                      {profile.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          onClick={() => setCurrentPhoto(photo)}
                          className={`w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-all flex-shrink-0 ${
                            (currentPhoto || profile.main_photo) === photo ? 'ring-2 ring-amber-500' : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{profile.display_name}</h1>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {profile.age && <p>{profile.age} ans</p>}
                    {profile.i_am && <p>{profile.i_am === 'homme' ? 'Homme' : 'Femme'}</p>}
                    {profile.city && (
                      <p className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {profile.city}{profile.country && `, ${profile.country}`}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">Email: {profile.created_by}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b">
                  <div className="text-center"><h3 className="text-sm font-medium text-gray-500">Critère</h3></div>
                  <div className="text-center"><h3 className="text-sm font-semibold text-gray-900">Profil</h3></div>
                  <div className="text-center"><h3 className="text-sm font-semibold text-gray-900">Recherche</h3></div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3">
                  <h2 className="text-white font-semibold">Informations de base</h2>
                </div>
                <div className="p-6">
                  <InfoRow label="Niveau d'études" userValue={profile.education_level} searchValue={correspondance?.education_level} />
                  <InfoRow label="A des enfants" userValue={profile.has_children || 'Non'} searchValue={correspondance?.has_children} />
                  <InfoRow label="Alcool" userValue={translateValue(profile.drinking, 'drinking')} searchValue={correspondance?.drinking?.[0]} />
                  <InfoRow label="Tabac" userValue={translateValue(profile.smoking, 'smoking')} searchValue={correspondance?.smoking?.[0]} />
                  <InfoRow label="Religion" userValue={profile.religion} searchValue={correspondance?.religion?.[0]} />
                  <InfoRow label="Profession" userValue={profile.occupation} searchValue={correspondance?.occupation?.[0]} />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-3">
                  <h2 className="text-white font-semibold">Apparence</h2>
                </div>
                <div className="p-6">
                  <InfoRow label="Couleur cheveux" userValue={translateValue(profile.hair_color, 'hair_color')} searchValue={correspondance?.hair_color?.[0]} />
                  <InfoRow label="Couleur yeux" userValue={translateValue(profile.eye_color, 'eye_color')} searchValue={correspondance?.eye_color?.[0]} />
                  <InfoRow label="Taille" userValue={profile.height} searchValue={correspondance?.height_min && correspondance?.height_max ? `${correspondance.height_min} - ${correspondance.height_max}` : null} />
                  <InfoRow label="Poids" userValue={profile.weight} searchValue={correspondance?.weight_min && correspondance?.weight_max ? `${correspondance.weight_min} - ${correspondance.weight_max}` : null} />
                  <InfoRow label="Type de corps" userValue={translateValue(profile.body_type, 'body_type')} searchValue={correspondance?.body_type?.[0]} />
                  <InfoRow label="Ethnicité" userValue={translateValue(profile.ethnicity, 'ethnicity')} searchValue={correspondance?.ethnicity?.[0]} />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-3">
                  <h2 className="text-white font-semibold">Style de vie</h2>
                </div>
                <div className="p-6">
                  <InfoRow label="Statut matrimonial" userValue={translateValue(profile.family_situation, 'family_situation')} searchValue={correspondance?.family_situation?.[0]} />
                  <InfoRow label="Veut des enfants" userValue={translateValue(profile.want_children, 'want_children')} searchValue={correspondance?.want_children?.[0]} />
                  <InfoRow label="Statut professionnel" userValue={profile.professional_status} searchValue={correspondance?.professional_status?.[0]} />
                  <InfoRow label="Revenu" userValue={profile.annual_income} searchValue={correspondance?.annual_income_min} />
                  <InfoRow label="Situation de vie" userValue={profile.living_situation} searchValue={correspondance?.living_situation?.[0]} />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3">
                  <h2 className="text-white font-semibold">Origines / Valeurs culturelles</h2>
                </div>
                <div className="p-6">
                  <InfoRow label="Nationalité" userValue={profile.nationality} searchValue={correspondance?.nationality?.[0]} />
                  <InfoRow label="Langues parlées" userValue={profile.languages_spoken?.join(', ')} searchValue={correspondance?.languages_spoken?.join(', ')} />
                  <InfoRow label="Niveau d'anglais" userValue={profile.english_proficiency} searchValue={correspondance?.english_proficiency} />
                  <InfoRow label="Niveau de français" userValue={profile.french_proficiency} searchValue={correspondance?.french_proficiency} />
                  <InfoRow label="Valeurs religieuses" userValue={profile.religious_values} searchValue={correspondance?.religious_values?.[0]} />
                  <InfoRow label="Polygamie" userValue={translateValue(profile.polygamy, 'polygamy')} searchValue={correspondance?.polygamy?.[0]} />
                </div>
              </div>

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
        </div>
      </div>
    </div>
  );
}