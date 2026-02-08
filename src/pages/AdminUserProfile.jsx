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

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-gray-100 text-sm">
      <div className="font-medium text-gray-600">{label}:</div>
      <div className="text-gray-900">{value || 'Non renseigné'}</div>
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
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
                  <h2 className="text-white font-semibold text-lg">Informations essentielles</h2>
                </div>
                <div className="p-6">
                  <InfoRow label="Nom complet" value={profile.first_name} />
                  <InfoRow label="Âge" value={profile.age ? `${profile.age} ans` : null} />
                  <InfoRow label="Genre" value={profile.i_am === 'homme' ? 'Homme' : 'Femme'} />
                  <InfoRow label="Date de naissance" value={profile.birth_month && profile.birth_year ? `${profile.birth_month} ${profile.birth_year}` : null} />
                  <InfoRow label="Email" value={profile.created_by} />
                  <InfoRow label="Ville" value={profile.city} />
                  <InfoRow label="État/Province" value={profile.state} />
                  <InfoRow label="Pays" value={profile.country} />
                  <InfoRow label="Nationalité" value={profile.nationality} />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                  <h2 className="text-white font-semibold text-lg">Identité & Apparence</h2>
                </div>
                <div className="p-6">
                  <InfoRow label="Taille" value={profile.height} />
                  <InfoRow label="Poids" value={profile.weight} />
                  <InfoRow label="Type de corps" value={translateValue(profile.body_type, 'body_type')} />
                  <InfoRow label="Couleur cheveux" value={translateValue(profile.hair_color, 'hair_color')} />
                  <InfoRow label="Couleur yeux" value={translateValue(profile.eye_color, 'eye_color')} />
                  <InfoRow label="Ethnicité" value={translateValue(profile.ethnicity, 'ethnicity')} />
                  <InfoRow label="Art corporel" value={profile.body_art?.join(', ')} />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                  <h2 className="text-white font-semibold text-lg">Situation personnelle</h2>
                </div>
                <div className="p-6">
                  <InfoRow label="Situation familiale" value={translateValue(profile.family_situation, 'family_situation')} />
                  <InfoRow label="A des enfants" value={profile.has_children} />
                  <InfoRow label="Nombre d'enfants" value={profile.number_of_children} />
                  <InfoRow label="Veut des enfants" value={translateValue(profile.want_children, 'want_children')} />
                  <InfoRow label="Profession" value={profile.occupation} />
                  <InfoRow label="Statut professionnel" value={profile.professional_status} />
                  <InfoRow label="Revenu annuel" value={profile.annual_income} />
                  <InfoRow label="Niveau d'études" value={profile.education_level} />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                  <h2 className="text-white font-semibold text-lg">Langue & Culture</h2>
                </div>
                <div className="p-6">
                  <InfoRow label="Langues parlées" value={profile.languages_spoken?.join(', ')} />
                  <InfoRow label="Niveau d'anglais" value={profile.english_proficiency} />
                  <InfoRow label="Niveau de français" value={profile.french_proficiency} />
                  <InfoRow label="Religion" value={profile.religion} />
                  <InfoRow label="Valeurs religieuses" value={profile.religious_values} />
                  <InfoRow label="Polygamie" value={translateValue(profile.polygamy, 'polygamy')} />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                  <h2 className="text-white font-semibold text-lg">Style de vie</h2>
                </div>
                <div className="p-6">
                  <InfoRow label="Fumeur" value={translateValue(profile.smoking, 'smoking')} />
                  <InfoRow label="Alcool" value={translateValue(profile.drinking, 'drinking')} />
                  <InfoRow label="Situation de vie" value={profile.living_situation} />
                  <InfoRow label="Prêt à déménager" value={profile.ready_to_move} />
                </div>
              </div>

              {profile.about_me && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-6 py-4">
                    <h2 className="text-white font-semibold text-lg">À propos</h2>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.about_me}</p>
                  </div>
                </div>
              )}

              {profile.looking_for_in_partner && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                    <h2 className="text-white font-semibold text-lg">Recherche</h2>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.looking_for_in_partner}</p>
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