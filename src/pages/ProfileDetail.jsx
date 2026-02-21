import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, MessageCircle, Star, Flag, MapPin, CheckCircle, Ban, AlertCircle, Camera } from 'lucide-react';
import Header from '@/components/layout/Header';

// ─── Labels helpers ────────────────────────────────────────────────────────────

const LABELS = {
  gender: { homme: 'Homme', femme: 'Femme', autre: 'Autre' },
  hair_color: { bald_shaved: 'Chauve/Rasé', black: 'Noir', blond: 'Blond', brown: 'Brun', grey_white: 'Gris/Blanc', chestnut: 'Châtain', redhead: 'Roux', change_often: 'Change souvent', other: 'Autre' },
  eye_color: { black: 'Noir', blue: 'Bleu', brown: 'Marron', green: 'Vert', gray: 'Gris', hazelnut: 'Noisette', other: 'Autre' },
  body_type: { little: 'Petit(e)', thin: 'Mince', sporty: 'Sportif(ve)', average: 'Moyen(ne)', few_extra_kilos: 'Quelques kilos en plus', round: 'Rond(e)', large_magnificent: 'Large et magnifique' },
  ethnicity: { african: 'Africain(e)', african_american: 'Afro-américain(e)', afro_caribbean: 'Afro-caribéen(ne)', arabic: 'Arabe', asian: 'Asiatique', caucasian: 'Caucasien(ne)', hispanic_latino: 'Hispanique/Latino', indian: 'Indien(ne)', metis: 'Métis(se)', pacific_islander: 'Insulaire du Pacifique', other: 'Autre', prefer_not_comment: 'Préfère ne pas dire' },
  appearance: { below_average: 'En dessous de la moyenne', average: 'Moyenne', attractive: 'Attrayant(e)', very_attractive: 'Très attrayant(e)' },
  drinking: { drink: 'Je bois', dont_drink: 'Je ne bois pas', wood_on_occasion: 'Bois à l\'occasion', drink_occasionally: 'Bois à l\'occasion' },
  smoking: { smoke: 'Je fume', dont_smoke: 'Je ne fume pas', smoke_occasionally: 'Fume occasionnellement' },
  family_situation: { bachelor: 'Célibataire', separated: 'Séparé(e)', widower: 'Veuf/Veuve', divorce: 'Divorcé(e)', other: 'Autre', prefer_not_comment: 'Préfère ne pas dire' },
  want_children: { yes: 'Oui', not_sure: 'Pas sûr(e)', no: 'Non' },
  occupation: { entertainment_media: 'Divertissement/Médias', hairdresser_beauty: 'Coiffure/Beauté', independent: 'Indépendant(e)', transportation: 'Transport', administrative_office: 'Administratif/Bureau', advertising_media: 'Publicité/Médias', artistic_creative: 'Artistique/Créatif', building_commerce: 'Construction/Commerce', home_help: 'Aide à domicile', teaching_university: 'Enseignement/Université', executive_management: 'Direction/Management', livestock_farming: 'Élevage/Agriculture', finance_banking: 'Finance/Banque', firefighters_police: 'Pompiers/Police', information_technology: 'Informatique', farm_worker: 'Agriculture', legal: 'Juridique', medical_dental: 'Médical/Dentaire', military: 'Militaire', nanny_babysitter: 'Nounou/Baby-sitter', unemployed_homemaker: 'Au foyer', nonprofit_clergy: 'ONG/Clergé', politics_government: 'Politique/Gouvernement', retail_food: 'Commerce/Alimentation', retirement: 'Retraite', sales_marketing: 'Ventes/Marketing', sports_leisure: 'Sports/Loisirs', student: 'Étudiant(e)', technology_science: 'Technologie/Science', tourism_hospitality: 'Tourisme/Hôtellerie', unemployed: 'Sans emploi', other: 'Autre' },
  professional_status: { student: 'Étudiant(e)', part_time: 'Temps partiel', full_time: 'Temps plein', homemaker: 'Au foyer', retirement: 'Retraité(e)', unemployed: 'Sans emploi', other: 'Autre', prefer_not_comment: 'Préfère ne pas dire' },
  living_situation: { live_alone: 'Seul(e)', live_with_friends: 'Avec des amis', live_with_family: 'Avec la famille', live_with_children: 'Avec les enfants', live_with_partner: 'Avec un partenaire', other: 'Autre', prefer_not_comment: 'Préfère ne pas dire' },
  ready_to_move: { only_within_country: 'Dans le pays seulement', to_another_country: 'Dans un autre pays', do_not_wish_to_move: 'Ne souhaite pas déménager', not_sure: 'Pas sûr(e)' },
  education_level: { primary_elementary: 'Primaire/Élémentaire', college: 'Collège', high_school: 'Lycée', vocational_education: 'Formation professionnelle', license: 'Licence', mastery: 'Master', doctorate: 'Doctorat' },
  english_proficiency: { dont_speak: 'Ne parle pas', average: 'Moyen', good: 'Bien', very_good: 'Très bien', good_command: 'Excellente maîtrise' },
  french_proficiency: { dont_speak: 'Ne parle pas', average: 'Moyen', good: 'Bien', very_good: 'Très bien', good_command: 'Excellente maîtrise' },
  religious_values: { not_religious: 'Pas religieux(se)', average: 'Assez religieux(se)', very_religious: 'Très religieux(se)', prefer_not_comment: 'Préfère ne pas dire' },
  polygamy: { accept: 'Accepte', against: 'Contre', might_accept: 'Pourrait accepter' },
  astrological_sign: { aquarius: 'Verseau', aries: 'Bélier', cancer: 'Cancer', capricorn: 'Capricorne', gemini: 'Gémeaux', leo: 'Lion', libra: 'Balance', pisces: 'Poissons', sagittarius: 'Sagittaire', scorpio: 'Scorpion', taurus: 'Taureau', virgo: 'Vierge', dont_know: 'Ne sait pas' },
  relationship_looking_for: { corresponding: 'Correspondance', friendship: 'Amitié', love_dating: 'Rencontres amoureuses', long_term_relationship: 'Relation long terme' },
  body_art: { brand: 'Tatouage au fer', earrings: 'Boucles d\'oreilles', piercing: 'Piercing', tattoo: 'Tatouage', other: 'Autre', none: 'Aucun', prefer_not_comment: 'Préfère ne pas dire' },
  no_preference: 'Pas de préférence',
};

function getLabel(category, value) {
  if (!value) return null;
  if (category === 'no_preference') return LABELS.no_preference;
  return LABELS[category]?.[value] || value;
}

function getArrayLabel(category, values) {
  if (!values || values.length === 0) return null;
  if (values.includes('no_preference')) return LABELS.no_preference;
  return values.map(v => LABELS[category]?.[v] || v).join(', ');
}

// ─── Row definitions ────────────────────────────────────────────────────────────
// Each row: { label, profileKey, profileType, correspondanceKey, correspondanceType }
// type: 'text' | 'enum' | 'array' | 'children'
const ROWS = [
  { label: 'Genre', profileKey: 'gender', profileType: 'enum', category: 'gender', correspondanceKey: 'looking_for', correspondanceType: 'enum', correspondanceCategory: 'looking_for' },
  { label: 'Âge', profileKey: 'age', profileType: 'text', correspondanceKey: null, correspondanceText: (c) => c?.age_min && c?.age_max ? `${c.age_min} - ${c.age_max} ans` : null },
  { label: 'Pays', profileKey: 'country', profileType: 'text', correspondanceKey: 'country', correspondanceType: 'text' },
  { label: 'Ville', profileKey: 'city', profileType: 'text', correspondanceKey: 'city', correspondanceType: 'text' },
  { label: 'Nationalité', profileKey: 'nationality', profileType: 'text', correspondanceKey: 'nationality', correspondanceType: 'text' },
  { label: 'Situation familiale', profileKey: 'family_situation', profileType: 'enum', category: 'family_situation', correspondanceKey: 'family_situation', correspondanceType: 'array', correspondanceCategory: 'family_situation' },
  { label: 'Enfants', profileKey: 'has_children', profileType: 'text', correspondanceKey: 'has_children', correspondanceType: 'text' },
  { label: 'Veut des enfants', profileKey: 'want_children', profileType: 'enum', category: 'want_children', correspondanceKey: 'want_children', correspondanceType: 'array', correspondanceCategory: 'want_children' },
  { label: 'Taille', profileKey: 'height', profileType: 'text', correspondanceKey: null, correspondanceText: (c) => c?.height_min && c?.height_max ? `${c.height_min} - ${c.height_max}` : null },
  { label: 'Poids', profileKey: 'weight', profileType: 'text', correspondanceKey: null, correspondanceText: (c) => c?.weight_min && c?.weight_max ? `${c.weight_min} - ${c.weight_max}` : null },
  { label: 'Morphologie', profileKey: 'body_type', profileType: 'enum', category: 'body_type', correspondanceKey: 'body_type', correspondanceType: 'array', correspondanceCategory: 'body_type' },
  { label: 'Apparence', profileKey: 'appearance', profileType: 'enum', category: 'appearance', correspondanceKey: 'appearance', correspondanceType: 'array', correspondanceCategory: 'appearance' },
  { label: 'Ethnicité', profileKey: 'ethnicity', profileType: 'enum', category: 'ethnicity', correspondanceKey: 'ethnicity', correspondanceType: 'array', correspondanceCategory: 'ethnicity' },
  { label: 'Couleur des cheveux', profileKey: 'hair_color', profileType: 'enum', category: 'hair_color', correspondanceKey: 'hair_color', correspondanceType: 'array', correspondanceCategory: 'hair_color' },
  { label: 'Couleur des yeux', profileKey: 'eye_color', profileType: 'enum', category: 'eye_color', correspondanceKey: 'eye_color', correspondanceType: 'array', correspondanceCategory: 'eye_color' },
  { label: 'Art corporel', profileKey: 'body_art', profileType: 'array', category: 'body_art', correspondanceKey: 'body_art', correspondanceType: 'array', correspondanceCategory: 'body_art' },
  { label: 'Alcool', profileKey: 'drinking', profileType: 'enum', category: 'drinking', correspondanceKey: 'drinking', correspondanceType: 'array', correspondanceCategory: 'drinking' },
  { label: 'Tabac', profileKey: 'smoking', profileType: 'enum', category: 'smoking', correspondanceKey: 'smoking', correspondanceType: 'array', correspondanceCategory: 'smoking' },
  { label: 'Profession', profileKey: 'occupation', profileType: 'enum', category: 'occupation', correspondanceKey: 'occupation', correspondanceType: 'array', correspondanceCategory: 'occupation' },
  { label: 'Statut professionnel', profileKey: 'professional_status', profileType: 'enum', category: 'professional_status', correspondanceKey: 'professional_status', correspondanceType: 'array', correspondanceCategory: 'professional_status' },
  { label: 'Revenu annuel', profileKey: 'annual_income', profileType: 'text', correspondanceKey: 'annual_income_min', correspondanceType: 'text' },
  { label: 'Situation de vie', profileKey: 'living_situation', profileType: 'enum', category: 'living_situation', correspondanceKey: 'living_situation', correspondanceType: 'array', correspondanceCategory: 'living_situation' },
  { label: 'Prêt à déménager', profileKey: 'ready_to_move', profileType: 'enum', category: 'ready_to_move', correspondanceKey: 'ready_to_move', correspondanceType: 'array', correspondanceCategory: 'ready_to_move' },
  { label: 'Niveau d\'études', profileKey: 'education_level', profileType: 'enum', category: 'education_level', correspondanceKey: 'education_level', correspondanceType: 'enum', correspondanceCategory: 'education_level' },
  { label: 'Anglais', profileKey: 'english_proficiency', profileType: 'enum', category: 'english_proficiency', correspondanceKey: 'english_proficiency', correspondanceType: 'enum', correspondanceCategory: 'english_proficiency' },
  { label: 'Français', profileKey: 'french_proficiency', profileType: 'enum', category: 'french_proficiency', correspondanceKey: 'french_proficiency', correspondanceType: 'enum', correspondanceCategory: 'french_proficiency' },
  { label: 'Religion', profileKey: 'religion', profileType: 'text', correspondanceKey: 'religion', correspondanceType: 'array', correspondanceCategory: 'religion' },
  { label: 'Valeurs religieuses', profileKey: 'religious_values', profileType: 'enum', category: 'religious_values', correspondanceKey: 'religious_values', correspondanceType: 'array', correspondanceCategory: 'religious_values' },
  { label: 'Polygamie', profileKey: 'polygamy', profileType: 'enum', category: 'polygamy', correspondanceKey: 'polygamy', correspondanceType: 'array', correspondanceCategory: 'polygamy' },
  { label: 'Signe astrologique', profileKey: 'astrological_sign', profileType: 'enum', category: 'astrological_sign', correspondanceKey: 'astrological_sign', correspondanceType: 'array', correspondanceCategory: 'astrological_sign' },
  { label: 'Relation recherchée', profileKey: 'relationship_looking_for', profileType: 'array', category: 'relationship_looking_for', correspondanceKey: 'relationship_looking_for', correspondanceType: 'array', correspondanceCategory: 'relationship_looking_for' },
];

function getProfileValue(row, profile) {
  const val = profile?.[row.profileKey];
  if (!val) return null;
  if (row.profileType === 'enum') return getLabel(row.category, val);
  if (row.profileType === 'array') return getArrayLabel(row.category, val);
  return val;
}

function getCorrespondanceValue(row, correspondance) {
  if (row.correspondanceText) return row.correspondanceText(correspondance);
  const val = correspondance?.[row.correspondanceKey];
  if (!val) return null;
  if (row.correspondanceType === 'enum') return getLabel(row.correspondanceCategory, val);
  if (row.correspondanceType === 'array') return getArrayLabel(row.correspondanceCategory, val);
  return val;
}

function isMatch(profileVal, correspondanceVal) {
  if (!profileVal || !correspondanceVal) return null;
  if (correspondanceVal === LABELS.no_preference) return true;
  return profileVal.toLowerCase().includes(correspondanceVal.toLowerCase()) ||
    correspondanceVal.toLowerCase().includes(profileVal.toLowerCase());
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function ProfileDetail() {
  const [activePhoto, setActivePhoto] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const profileId = urlParams.get('id');

  const { data: profile, isLoading: loadingProfile } = useQuery({
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
      const results = await base44.entities.Correspondance.filter({ created_by: profile.created_by });
      return results[0] || null;
    },
    enabled: !!profile?.created_by,
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: myCorrespondance } = useQuery({
    queryKey: ['myCorrespondance', currentUser?.email],
    queryFn: async () => {
      const results = await base44.entities.Correspondance.filter({ created_by: currentUser.email });
      return results[0] || null;
    },
    enabled: !!currentUser?.email,
  });

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-96 bg-gray-200 rounded-2xl" />
            <div className="h-64 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-500">Profil non trouvé</p>
          <Link to={createPageUrl('Home')}>
            <Button className="mt-4 bg-amber-500 hover:bg-amber-600">Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  const displayName = profile.display_name || profile.first_name || 'Utilisateur';

  const rows = ROWS.map(row => ({
    ...row,
    profileVal: getProfileValue(row, profile),
    correspondanceVal: getCorrespondanceValue(row, correspondance),
  })).filter(r => r.profileVal || r.correspondanceVal);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 mb-5 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Retour aux profils
        </Link>

        {/* ── Top Card ── */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6">
          <div className="flex flex-col md:flex-row">
            {/* Photo */}
            <div className="relative w-full md:w-72 flex-shrink-0">
              <img
                src={profile.main_photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800'}
                alt={displayName}
                className="w-full h-72 md:h-full object-cover"
              />
              {profile.is_online && (
                <span className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 text-green-600 text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
                  En ligne
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                {/* Top actions */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      {displayName}
                      {profile.is_verified && (
                        <CheckCircle className="w-5 h-5 text-amber-500" />
                      )}
                      {profile.is_online && (
                        <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                      )}
                    </h1>
                    <p className="text-gray-500 mt-1">
                      {[profile.age && `${profile.age} ans`, profile.city, profile.state, profile.country].filter(Boolean).join(' • ')}
                    </p>
                    {profile.gender && (
                      <p className="text-sm text-gray-500 mt-1">
                        {getLabel('gender', profile.gender)}
                        {profile.family_situation && ` / ${getLabel('family_situation', profile.family_situation)}`}
                      </p>
                    )}
                    {correspondance && (
                      <p className="text-sm text-amber-700 mt-1 font-medium">
                        Cherche {LABELS.gender?.[correspondance.looking_for] || correspondance.looking_for}
                        {correspondance.age_min && correspondance.age_max && ` entre ${correspondance.age_min} et ${correspondance.age_max} ans`}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-full border-2 border-red-200 flex items-center justify-center hover:bg-red-50 transition-colors">
                      <Heart className="w-5 h-5 text-red-400" />
                    </button>
                    <button className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                      <MessageCircle className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* Looking for */}
                {profile.looking_for && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4">
                    <p className="text-sm text-amber-800">
                      <strong>Recherche :</strong> {profile.looking_for}
                    </p>
                  </div>
                )}

                {/* Photos gallery */}
                {profile.photos && profile.photos.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      {profile.photos.length} photo{profile.photos.length > 1 ? 's' : ''}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {profile.photos.slice(0, 5).map((photo, i) => (
                        <img
                          key={i}
                          src={photo}
                          alt={`Photo ${i + 1}`}
                          onClick={() => setActivePhoto(photo)}
                          className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border-2 border-transparent hover:border-amber-400"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <Button className="flex-1 bg-amber-500 hover:bg-amber-600 gap-2">
                  <Heart className="w-4 h-4" />
                  J'aime
                </Button>
                <Button variant="outline" className="flex-1 gap-2 border-slate-300">
                  <MessageCircle className="w-4 h-4" />
                  Message
                </Button>
                <Button variant="outline" size="icon" className="border-slate-300">
                  <Star className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="border-slate-300">
                  <Flag className="w-4 h-4 text-red-400" />
                </Button>
                <Button variant="outline" size="icon" className="border-slate-300">
                  <Ban className="w-4 h-4 text-gray-400" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Vue Rapide Table ── */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6">
          {/* Table header */}
          <div className="grid grid-cols-3 border-b border-gray-100">
            <div className="px-6 py-4 bg-slate-50">
              <h2 className="font-bold text-slate-600 text-sm uppercase tracking-wider">Information</h2>
            </div>
            <div className="px-6 py-4 border-l border-gray-100">
              <h2 className="font-bold text-amber-600 text-base">{displayName}</h2>
            </div>
            <div className="px-6 py-4 border-l border-gray-100 bg-slate-50">
              <h2 className="font-bold text-slate-500 text-base">
                {profile.gender === 'femme' ? 'Elle recherche' : profile.gender === 'homme' ? 'Il recherche' : 'Recherche'}
              </h2>
            </div>
          </div>

          {/* Rows */}
          {rows.map((row, i) => {
            const match = isMatch(row.profileVal, row.correspondanceVal);
            return (
              <div
                key={row.label}
                className={`grid grid-cols-3 border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
              >
                {/* Col 1: Label */}
                <div className="px-6 py-3 flex items-center">
                  <span className="text-sm text-slate-500 font-medium">{row.label}</span>
                </div>

                {/* Col 2: Profile value */}
                <div className="px-6 py-3 border-l border-gray-100 flex items-center">
                  <span className="text-sm text-gray-800">{row.profileVal || '—'}</span>
                </div>

                {/* Col 3: Correspondance value */}
                <div className={`px-6 py-3 border-l border-gray-100 flex items-center ${
                  match === true ? 'bg-green-50' : match === false ? 'bg-red-50' : ''
                }`}>
                  <span className={`text-sm ${
                    !row.correspondanceVal ? 'text-gray-300 italic' :
                    match === true ? 'text-green-700 font-medium' :
                    match === false ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {row.correspondanceVal || 'Pas de préférence'}
                  </span>
                  {match === true && row.correspondanceVal && row.correspondanceVal !== LABELS.no_preference && (
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 ml-2 flex-shrink-0" />
                  )}
                </div>
              </div>
            );
          })}

          {/* Legend */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-200 inline-block border border-green-400" />
              Correspondance
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-200 inline-block border border-red-400" />
              Pas de correspondance
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-200 inline-block border border-gray-300" />
              Pas de préférence
            </span>
          </div>
        </div>

        {/* ── About / Bio ── */}
        {(profile.about_me || profile.bio) && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h2 className="font-bold text-gray-800 mb-3 text-lg">À propos</h2>
            <p className="text-gray-600 leading-relaxed">{profile.about_me || profile.bio}</p>
          </div>
        )}
      </main>

      {/* Lightbox */}
      {activePhoto && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setActivePhoto(null)}
        >
          <img src={activePhoto} alt="Photo" className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain" />
        </div>
      )}
    </div>
  );
}