import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, MessageCircle, Star, Flag, MapPin, CheckCircle, Ban, Camera, Smile, Music, Plane, Dumbbell, Palette, Leaf, Cpu, Users, Apple, MoreHorizontal, Brain, Target, Quote } from 'lucide-react';
import Header from '@/components/layout/Header';
import BlockButton from '@/components/block/BlockButton';

const INTEREST_CATEGORIES = [
  { key: 'sports', label: 'Sports', icon: Dumbbell, color: 'bg-orange-100 text-orange-700' },
  { key: 'music', label: 'Musique', icon: Music, color: 'bg-purple-100 text-purple-700' },
  { key: 'arts', label: 'Arts & Culture', icon: Palette, color: 'bg-pink-100 text-pink-700' },
  { key: 'travel', label: 'Voyages', icon: Plane, color: 'bg-blue-100 text-blue-700' },
  { key: 'food', label: 'Cuisine', icon: Apple, color: 'bg-red-100 text-red-700' },
  { key: 'nature', label: 'Nature', icon: Leaf, color: 'bg-green-100 text-green-700' },
  { key: 'tech', label: 'Technologie', icon: Cpu, color: 'bg-cyan-100 text-cyan-700' },
  { key: 'social', label: 'Social', icon: Users, color: 'bg-yellow-100 text-yellow-700' },
  { key: 'wellness', label: 'Bien-être', icon: Smile, color: 'bg-teal-100 text-teal-700' },
];

const PERSONALITY_QUESTIONS = [
  { key: 'personality_q1', label: 'Comment vos amis vous décriraient-ils ?' },
  { key: 'personality_q2', label: 'Êtes-vous plutôt introverti(e) ou extraverti(e) ?' },
  { key: 'personality_q3', label: 'Comment gérez-vous les conflits ?' },
  { key: 'personality_q4', label: 'Qu\'est-ce qui vous rend heureux(se) au quotidien ?' },
  { key: 'personality_q5', label: 'Quelle est votre plus grande qualité ?' },
  { key: 'personality_q6', label: 'Quel est votre plus grand défaut ?' },
  { key: 'personality_q7', label: 'Comment réagissez-vous face au stress ?' },
  { key: 'personality_q8', label: 'Êtes-vous plutôt tête ou cœur ?' },
];

const LIFE_GOAL_QUESTIONS = [
  { key: 'life_goal_q1', label: 'Votre objectif principal dans les 5 prochaines années ?' },
  { key: 'life_goal_q2', label: 'Comment imaginez-vous votre vie idéale ?' },
  { key: 'life_goal_q3', label: 'Quelle place occupe la famille dans votre vie ?' },
  { key: 'life_goal_q4', label: 'Qu\'est-ce que le succès signifie pour vous ?' },
  { key: 'life_goal_q5', label: 'Quel héritage souhaitez-vous laisser ?' },
  { key: 'life_goal_q6', label: 'Quelle est votre vision d\'une relation épanouissante ?' },
];

// ─── Labels ────────────────────────────────────────────────────────────────────
const L = {
  gender: { homme: 'Homme', femme: 'Femme', autre: 'Autre' },
  looking_for: { women: 'Femme', men: 'Homme', both: 'Les deux' },
  hair_color: { bald_shaved: 'Chauve/Rasé', black: 'Noir', blond: 'Blond', brown: 'Brun', grey_white: 'Gris/Blanc', chestnut: 'Châtain', redhead: 'Roux', change_often: 'Change souvent', other: 'Autre' },
  eye_color: { black: 'Noir', blue: 'Bleu', brown: 'Marron', green: 'Vert', gray: 'Gris', hazelnut: 'Noisette', other: 'Autre' },
  body_type: { little: 'Petit(e)', thin: 'Mince', sporty: 'Sportif(ve)', average: 'Moyen(ne)', few_extra_kilos: 'Quelques kilos en plus', round: 'Rond(e)', large_magnificent: 'Large et magnifique' },
  ethnicity: { african: 'Africain(e)', african_american: 'Afro-américain(e)', afro_caribbean: 'Afro-caribéen(ne)', arabic: 'Arabe', asian: 'Asiatique', caucasian: 'Caucasien(ne)', hispanic_latino: 'Hispanique/Latino', indian: 'Indien(ne)', metis: 'Métis(se)', pacific_islander: 'Insulaire du Pacifique', other: 'Autre', prefer_not_comment: 'Préfère ne pas dire' },
  appearance: { below_average: 'En dessous de la moyenne', average: 'Moyenne', attractive: 'Attrayant(e)', very_attractive: 'Très attrayant(e)' },
  drinking: { drink: 'Je bois', dont_drink: 'Je ne bois pas', wood_on_occasion: "Bois à l'occasion", drink_occasionally: "Bois à l'occasion" },
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
  polygamy: { accept: 'Accepte la polygamie', against: 'Contre la polygamie', might_accept: 'Pourrait accepter' },
  astrological_sign: { aquarius: 'Verseau', aries: 'Bélier', cancer: 'Cancer', capricorn: 'Capricorne', gemini: 'Gémeaux', leo: 'Lion', libra: 'Balance', pisces: 'Poissons', sagittarius: 'Sagittaire', scorpio: 'Scorpion', taurus: 'Taureau', virgo: 'Vierge', dont_know: 'Ne sait pas' },
  relationship_looking_for: { corresponding: 'Correspondance', friendship: 'Amitié', love_dating: 'Rencontres amoureuses', long_term_relationship: 'Relation long terme' },
  body_art: { brand: 'Tatouage au fer', earrings: "Boucles d'oreilles", piercing: 'Piercing', tattoo: 'Tatouage', other: 'Autre', none: 'Aucun', prefer_not_comment: 'Préfère ne pas dire' },
};

const lbl = (cat, val) => L[cat]?.[val] || val || null;
const lblArr = (cat, arr) => {
  if (!arr || arr.length === 0) return null;
  if (arr.includes('no_preference')) return 'Pas de préférence';
  return arr.map(v => L[cat]?.[v] || v).join(', ');
};

// ─── Sections config ────────────────────────────────────────────────────────────
// profileFn: (profile) => string | null
// corrFn: (corr) => string | null
const SECTIONS = [
  {
    title: 'Basique',
    rows: [
      { label: 'Genre', profileFn: p => lbl('gender', p.gender), corrFn: c => lbl('looking_for', c?.looking_for) },
      { label: 'Âge', profileFn: p => p.age ? `${p.age} ans` : null, corrFn: c => c?.age_min && c?.age_max ? `${c.age_min} - ${c.age_max} ans` : null },
      { label: 'Pays', profileFn: p => p.country || null, corrFn: c => c?.country || null },
      { label: 'Ville', profileFn: p => p.city || null, corrFn: c => c?.city || null },
      { label: 'État / Province', profileFn: p => p.state || null, corrFn: c => c?.state_province || null },
      { label: 'Nationalité', profileFn: p => p.nationality || null, corrFn: c => c?.nationality || null },
      { label: 'Prêt à déménager', profileFn: p => lbl('ready_to_move', p.ready_to_move), corrFn: c => lblArr('ready_to_move', c?.ready_to_move) },
      { label: 'Type de relation', profileFn: p => lblArr('relationship_looking_for', p.relationship_looking_for), corrFn: c => lblArr('relationship_looking_for', c?.relationship_looking_for) },
    ]
  },
  {
    title: 'Apparence',
    rows: [
      { label: 'Taille', profileFn: p => p.height || null, corrFn: c => c?.height_min && c?.height_max ? `${c.height_min} - ${c.height_max}` : null },
      { label: 'Poids', profileFn: p => p.weight || null, corrFn: c => c?.weight_min && c?.weight_max ? `${c.weight_min} - ${c.weight_max}` : null },
      { label: 'Morphologie', profileFn: p => lbl('body_type', p.body_type), corrFn: c => lblArr('body_type', c?.body_type) },
      { label: 'Ethnicité', profileFn: p => lbl('ethnicity', p.ethnicity), corrFn: c => lblArr('ethnicity', c?.ethnicity) },
      { label: 'Couleur des cheveux', profileFn: p => lbl('hair_color', p.hair_color), corrFn: c => lblArr('hair_color', c?.hair_color) },
      { label: 'Couleur des yeux', profileFn: p => lbl('eye_color', p.eye_color), corrFn: c => lblArr('eye_color', c?.eye_color) },
      { label: 'Art corporel', profileFn: p => lblArr('body_art', p.body_art), corrFn: c => lblArr('body_art', c?.body_art) },
      { label: 'Apparence', profileFn: p => lbl('appearance', p.appearance), corrFn: c => lblArr('appearance', c?.appearance) },
    ]
  },
  {
    title: 'Style de vie',
    rows: [
      { label: 'Alcool', profileFn: p => lbl('drinking', p.drinking), corrFn: c => lblArr('drinking', c?.drinking) },
      { label: 'Tabac', profileFn: p => lbl('smoking', p.smoking), corrFn: c => lblArr('smoking', c?.smoking) },
      { label: 'Situation familiale', profileFn: p => lbl('family_situation', p.family_situation), corrFn: c => lblArr('family_situation', c?.family_situation) },
      { label: 'A des enfants', profileFn: p => p.has_children || null, corrFn: c => c?.has_children || null },
      { label: "Nombre d'enfants", profileFn: p => p.number_of_children || null, corrFn: c => c?.number_of_children_max ? `Max ${c.number_of_children_max}` : null },
      { label: "Âge de l'aîné", profileFn: p => p.eldest_child_age || null, corrFn: c => c?.oldest_child_age || null },
      { label: 'Âge du plus jeune', profileFn: p => p.youngest_child_age || null, corrFn: c => c?.youngest_child_age || null },
      { label: 'Veut des enfants', profileFn: p => lbl('want_children', p.want_children), corrFn: c => lblArr('want_children', c?.want_children) },
      { label: 'Profession', profileFn: p => lbl('occupation', p.occupation), corrFn: c => lblArr('occupation', c?.occupation) },
      { label: 'Statut professionnel', profileFn: p => lbl('professional_status', p.professional_status), corrFn: c => lblArr('professional_status', c?.professional_status) },
      { label: 'Revenu annuel', profileFn: p => p.annual_income || null, corrFn: c => c?.annual_income_min || null },
      { label: 'Situation de vie', profileFn: p => lbl('living_situation', p.living_situation), corrFn: c => lblArr('living_situation', c?.living_situation) },
    ]
  },
  {
    title: 'Origines / Valeurs culturelles',
    rows: [
      { label: "Niveau d'études", profileFn: p => lbl('education_level', p.education_level), corrFn: c => lbl('education_level', c?.education_level) },
      { label: 'Langues parlées', profileFn: p => Array.isArray(p.languages_spoken) ? p.languages_spoken.join(', ') : p.languages_spoken || null, corrFn: c => Array.isArray(c?.languages_spoken) ? c.languages_spoken.join(', ') : c?.languages_spoken || null },
      { label: "Niveau d'anglais", profileFn: p => lbl('english_proficiency', p.english_proficiency), corrFn: c => lbl('english_proficiency', c?.english_proficiency) },
      { label: 'Niveau de français', profileFn: p => lbl('french_proficiency', p.french_proficiency), corrFn: c => lbl('french_proficiency', c?.french_proficiency) },
      { label: 'Religion', profileFn: p => p.religion || null, corrFn: c => lblArr('religion', c?.religion) },
      { label: 'Valeurs religieuses', profileFn: p => lbl('religious_values', p.religious_values), corrFn: c => lblArr('religious_values', c?.religious_values) },
      { label: 'Polygamie', profileFn: p => lbl('polygamy', p.polygamy), corrFn: c => lblArr('polygamy', c?.polygamy) },
      { label: 'Signe astrologique', profileFn: p => lbl('astrological_sign', p.astrological_sign), corrFn: c => lblArr('astrological_sign', c?.astrological_sign) },
    ]
  },
];

// ─── Match logic ───────────────────────────────────────────────────────────────
// returns: 'match' | 'no_match' | 'no_pref' | null
function getMatchStatus(profileVal, corrVal) {
  if (!corrVal || corrVal === 'Pas de préférence') return 'no_pref';
  if (!profileVal) return 'no_pref';
  const pv = profileVal.toLowerCase();
  const cv = corrVal.toLowerCase();
  // Check if any part of corrVal contains profileVal or vice versa
  const corrParts = cv.split(',').map(s => s.trim());
  const matched = corrParts.some(part => pv.includes(part) || part.includes(pv));
  return matched ? 'match' : 'no_match';
}

// ─── Row Component ─────────────────────────────────────────────────────────────
function ProfileRow({ label, profileVal, corrVal, isEven }) {
  const status = getMatchStatus(profileVal, corrVal);
  const corrDisplay = corrVal || 'Pas de préférence';
  const isNoPref = !corrVal || corrVal === 'Pas de préférence';

  return (
    <div className={`grid grid-cols-3 border-b border-gray-100 ${isEven ? 'bg-gray-50/60' : 'bg-white'}`}>
      <div className="px-4 py-2.5 flex items-center">
        <span className="text-sm text-gray-600">{label} :</span>
      </div>
      <div className={`px-4 py-2.5 border-l border-gray-100 flex items-center ${
        status === 'match' ? 'bg-green-100' : status === 'no_match' ? 'bg-red-100' : ''
      }`}>
        <span className={`text-sm ${profileVal ? 'text-gray-800' : 'text-gray-400 italic'}`}>
          {profileVal || 'Pas de réponse'}
        </span>
      </div>
      <div className={`px-4 py-2.5 border-l border-gray-100 flex items-center ${
        status === 'match' ? 'bg-green-100' : status === 'no_match' ? 'bg-red-100' : ''
      }`}>
        <span className={`text-sm ${isNoPref ? 'text-gray-400 italic' : status === 'match' ? 'text-green-800' : status === 'no_match' ? 'text-red-800' : 'text-gray-700'}`}>
          {corrDisplay}
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ProfileDetail() {
  const [activePhoto, setActivePhoto] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const urlParams = new URLSearchParams(window.location.search);
  const profileId = urlParams.get('id');

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

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
      const results = await base44.entities.Correspondance.filter({ created_by: profile.created_by });
      return results[0] || null;
    },
    enabled: !!profile?.created_by,
  });

  const { data: interests } = useQuery({
    queryKey: ['interests', profile?.created_by],
    queryFn: async () => {
      const results = await base44.entities.Interest.filter({ created_by: profile.created_by });
      return results[0] || null;
    },
    enabled: !!profile?.created_by,
  });

  const { data: personality } = useQuery({
    queryKey: ['personality', profile?.created_by],
    queryFn: async () => {
      const results = await base44.entities.Personality.filter({ created_by: profile.created_by });
      return results[0] || null;
    },
    enabled: !!profile?.created_by,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-72 bg-gray-200 rounded-2xl" />
            <div className="h-96 bg-gray-200 rounded-2xl" />
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Retour aux profils
        </Link>

        {/* ── Top Card ── */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Photo */}
            <div className="relative w-full md:w-64 flex-shrink-0">
              <img
                src={profile.main_photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800'}
                alt={displayName}
                className="w-full h-64 md:h-full object-cover"
              />
              {profile.is_online && (
                <span className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 text-green-600 text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
                  En ligne
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    {displayName}
                    {profile.is_verified && <CheckCircle className="w-5 h-5 text-amber-500" />}
                    {profile.is_online && <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />}
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                    {[profile.age && `${profile.age} ans`, profile.city, profile.state, profile.country].filter(Boolean).join(' • ')}
                  </p>
                  {profile.gender && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      {lbl('gender', profile.gender)}
                      {profile.family_situation && ` / ${lbl('family_situation', profile.family_situation)}`}
                    </p>
                  )}
                  {correspondance && (
                    <p className="text-sm text-amber-700 mt-1 font-medium">
                      Cherche {lbl('looking_for', correspondance.looking_for)}
                      {correspondance.age_min && correspondance.age_max && ` · ${correspondance.age_min} - ${correspondance.age_max} ans`}
                      {Array.isArray(correspondance.relationship_looking_for) && correspondance.relationship_looking_for.length > 0 && !correspondance.relationship_looking_for.includes('no_preference') &&
                        ` · ${lblArr('relationship_looking_for', correspondance.relationship_looking_for)}`
                      }
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

              {/* Photos gallery */}
              {profile.photos && profile.photos.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    {profile.photos.length} photo{profile.photos.length > 1 ? 's' : ''}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {profile.photos.slice(0, 6).map((photo, i) => (
                      <img
                        key={i}
                        src={photo}
                        alt={`Photo ${i + 1}`}
                        onClick={() => setActivePhoto(photo)}
                        className="w-14 h-14 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border-2 border-transparent hover:border-amber-400"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <Button className="flex-1 bg-amber-500 hover:bg-amber-600 gap-2 h-9">
                  <Heart className="w-4 h-4" />
                  J'aime
                </Button>
                <Button variant="outline" className="flex-1 gap-2 h-9 border-slate-300">
                  <MessageCircle className="w-4 h-4" />
                  Message
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9 border-slate-300">
                  <Star className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9 border-slate-300">
                  <Flag className="w-4 h-4 text-red-400" />
                </Button>
                <BlockButton
                  targetProfile={profile}
                  currentUserEmail={currentUser?.email}
                  variant="outline"
                  size="icon"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'profile', label: 'Profil & Critères' },
              { id: 'interests', label: '🎯 Loisirs & Intérêts' },
              { id: 'personality', label: '🧠 Personnalité' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-700 bg-amber-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Interests Tab ── */}
        {activeTab === 'interests' && (
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
            {(!interests || INTEREST_CATEGORIES.every(cat => !interests[cat.key]?.length)) ? (
              <p className="text-center text-gray-400 py-8">Aucun loisir ou intérêt renseigné</p>
            ) : (
              INTEREST_CATEGORIES.map(cat => {
                const items = interests?.[cat.key];
                if (!items || items.length === 0) return null;
                const Icon = cat.icon;
                return (
                  <div key={cat.key}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-1.5 rounded-lg ${cat.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-semibold text-gray-700">{cat.label}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {items.map((item, i) => (
                        <Badge key={i} variant="outline" className={`${cat.color} border-0 px-3 py-1`}>
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
            {interests?.other_interests && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                  <h3 className="font-semibold text-gray-700">Autres</h3>
                </div>
                <p className="text-gray-600 text-sm">{interests.other_interests}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Personality Tab ── */}
        {activeTab === 'personality' && (
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-8">
            {/* Personality questions */}
            {PERSONALITY_QUESTIONS.some(q => personality?.[q.key]) && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-purple-500" />
                  <h3 className="font-bold text-gray-800">Personnalité</h3>
                </div>
                <div className="space-y-4">
                  {PERSONALITY_QUESTIONS.map(q => personality?.[q.key] ? (
                    <div key={q.key} className="bg-purple-50 rounded-xl p-4">
                      <p className="text-xs font-medium text-purple-600 mb-1">{q.label}</p>
                      <p className="text-gray-800 text-sm">{personality[q.key]}</p>
                    </div>
                  ) : null)}
                </div>
              </div>
            )}

            {/* Life goals */}
            {LIFE_GOAL_QUESTIONS.some(q => personality?.[q.key]) && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-gray-800">Objectifs de vie</h3>
                </div>
                <div className="space-y-4">
                  {LIFE_GOAL_QUESTIONS.map(q => personality?.[q.key] ? (
                    <div key={q.key} className="bg-amber-50 rounded-xl p-4">
                      <p className="text-xs font-medium text-amber-600 mb-1">{q.label}</p>
                      <p className="text-gray-800 text-sm">{personality[q.key]}</p>
                    </div>
                  ) : null)}
                </div>
              </div>
            )}

            {/* Quotes */}
            {[1,2,3].some(i => personality?.[`quote${i}`]) && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Quote className="w-5 h-5 text-blue-500" />
                  <h3 className="font-bold text-gray-800">Citations favorites</h3>
                </div>
                <div className="space-y-3">
                  {[1,2,3].map(i => personality?.[`quote${i}`] ? (
                    <div key={i} className="border-l-4 border-blue-300 pl-4 py-2">
                      <p className="text-gray-700 italic">"{personality[`quote${i}`]}"</p>
                      {personality[`quote_author${i}`] && (
                        <p className="text-xs text-gray-400 mt-1">— {personality[`quote_author${i}`]}</p>
                      )}
                    </div>
                  ) : null)}
                </div>
              </div>
            )}

            {!personality || (!PERSONALITY_QUESTIONS.some(q => personality?.[q.key]) && !LIFE_GOAL_QUESTIONS.some(q => personality?.[q.key]) && ![1,2,3].some(i => personality?.[`quote${i}`])) ? (
              <p className="text-center text-gray-400 py-8">Aucune information de personnalité renseignée</p>
            ) : null}
          </div>
        )}

        {/* ── Detailed Table ── */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {/* Table header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-lg">Plus d'informations</h2>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-green-300 border border-green-500 inline-block" />
                  Correspondance
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-300 border border-red-400 inline-block" />
                  Pas de correspondance
                </span>
              </div>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
              <div className="px-4 py-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Information</span>
              </div>
              <div className="px-4 py-3 border-l border-gray-200">
                <span className="text-sm font-bold text-amber-600">{displayName}</span>
              </div>
              <div className="px-4 py-3 border-l border-gray-200">
                <span className="text-sm font-bold text-slate-500">
                  {profile.gender === 'femme' ? 'Elle recherche' : profile.gender === 'homme' ? 'Il recherche' : 'Recherche'}
                </span>
              </div>
            </div>

            {/* Sections */}
            {SECTIONS.map((section) => (
              <div key={section.title}>
                <div className="px-4 py-2 bg-slate-100 border-b border-gray-200">
                  <span className="text-sm font-bold text-amber-700">{section.title}</span>
                </div>
                {section.rows.map((row, i) => (
                  <ProfileRow
                    key={row.label}
                    label={row.label}
                    profileVal={row.profileFn(profile)}
                    corrVal={row.corrFn(correspondance)}
                    isEven={i % 2 === 0}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ── About ── */}
        {activeTab === 'profile' && (profile.about_me || profile.bio) && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="font-bold text-gray-800 mb-3 text-lg">À propos</h2>
            <p className="text-gray-600 leading-relaxed">{profile.about_me || profile.bio}</p>
          </div>
        )}
      </main>

      {/* Lightbox */}
      {activePhoto && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setActivePhoto(null)}>
          <img src={activePhoto} alt="Photo" className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain" />
        </div>
      )}
    </div>
  );
}