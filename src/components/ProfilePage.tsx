import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  ShieldAlert, 
  CheckCircle2, 
  MapPin, 
  Camera,
  Target,
  User as UserIcon,
  UserX,
  Brain,
  Zap,
  ShoppingBag,
  Sparkles,
  Star,
  Lock,
  X,
  Upload,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, Fragment, useEffect } from 'react';
import { api } from '../lib/api';
import { toast } from 'sonner';

export default function ProfilePage({ profile, onBack, onLike, onFavorite, onMessage, isSubscribed, isOwnProfile = false }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isChangePhotoModalOpen, setIsChangePhotoModalOpen] = useState(false);

  // Default data if profile is missing (for demo/own profile)
  const [displayProfile, setDisplayProfile] = useState(profile || {
    id: 'my-id',
    name: "Jean-Pierre Martin",
    age: 42,
    city: "Lyon",
    country: "France",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=4&w=800&h=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=4&w=800&h=800&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=4&w=800&h=800&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=4&w=800&h=800&q=80"
    ],
    gender: "man",
    looking_for: "woman",
    search_type: "Mariage",
    is_verified: true,
    online: true
  });

  useEffect(() => {
    if (profile) {
      setDisplayProfile(profile);
    }
  }, [profile]);

  const handleUpdatePhoto = async (newPhotoUrl) => {
    try {
      // Update local state
      setDisplayProfile(prev => ({ ...prev, photo: newPhotoUrl }));
      
      // Update in database
      const allProfiles = await api.get('profiles');
      const updatedProfiles = allProfiles.map(p => {
        if (p.id === displayProfile.id || p.email === 'jlcornet878@gmail.com') {
          return { ...p, photo: newPhotoUrl };
        }
        return p;
      });
      await api.save('profiles', updatedProfiles);
      
      toast.success("Photo de profil mise à jour");
      setIsChangePhotoModalOpen(false);
    } catch (error) {
      console.error("Failed to update profile photo:", error);
      toast.error("Erreur lors de la mise à jour de la photo");
    }
  };

  const handleUploadNewPhoto = async () => {
    // Simulate upload
    const newPhotoUrl = `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?w=800&h=800&fit=crop`;
    
    try {
      // In a real app, this would go to moderation
      const newPendingPhoto = {
        id: Date.now().toString(),
        name: displayProfile.name,
        email: 'jlcornet878@gmail.com',
        userId: displayProfile.id,
        userPhoto: displayProfile.photo,
        url: newPhotoUrl,
        isPrimary: false,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const allPending = await api.get('pending_photos') || [];
      await api.save('pending_photos', [...allPending, newPendingPhoto]);
      
      toast.success("Photo envoyée pour modération", {
        description: "Elle apparaîtra dans votre galerie une fois validée."
      });
      
      // For demo purposes, let's also add it to the local profile photos
      setDisplayProfile(prev => ({
        ...prev,
        photos: [...(prev.photos || []), newPhotoUrl]
      }));
    } catch (error) {
      console.error("Failed to upload photo:", error);
      toast.error("Erreur lors de l'envoi de la photo");
    }
  };

  const categories = [
    {
      title: "Basique",
      rows: [
        { label: "Genre :", user: displayProfile.gender === 'woman' ? 'Femme' : 'Homme', search: "Pas de préférence", match: null },
        { label: "Âge :", user: `${displayProfile.age} ans`, search: "Pas de préférence", match: null },
        { label: "Pays :", user: displayProfile.country, search: "Pas de préférence", match: null },
        { label: "Ville :", user: displayProfile.city, search: "Pas de préférence", match: null },
        { label: "État / Province :", user: "Rhône", search: "Pas de préférence", match: null },
        { label: "Nationalité :", user: "Française", search: "Pas de préférence", match: null },
        { label: "Prêt à déménager :", user: "Pas de réponse", search: "Pas de préférence", match: null },
        { label: "Type de relation :", user: "Long terme", search: "Pas de préférence", match: null },
      ]
    },
    {
      title: "Apparence",
      rows: [
        { label: "Taille :", user: "180 cm", search: "Pas de préférence", match: null },
        { label: "Poids :", user: "75 kg", search: "Pas de préférence", match: null },
        { label: "Morphologie :", user: "Athlétique", search: "Pas de préférence", match: null },
        { label: "Ethnicité :", user: "Caucasien", search: "Pas de préférence", match: null },
        { label: "Couleur des cheveux :", user: "Brun", search: "Pas de préférence", match: null },
        { label: "Couleur des yeux :", user: "Bleu", search: "Pas de préférence", match: null },
        { label: "Art corporel :", user: "Aucun", search: "Pas de préférence", match: null },
        { label: "Apparence :", user: "Attrayant", search: "Pas de préférence", match: null },
      ]
    },
    {
      title: "Style de vie",
      rows: [
        { label: "Alcool :", user: "Occasionnel", search: "Pas de préférence", match: null },
        { label: "Tabac :", user: "Non-fumeur", search: "Pas de préférence", match: null },
        { label: "Situation familiale :", user: "Célibataire", search: "Pas de préférence", match: null },
        { label: "A des enfants :", user: "Non", search: "Pas de préférence", match: null },
        { label: "Nombre d'enfants :", user: "0", search: "Pas de préférence", match: null },
        { label: "Veut des enfants :", user: "Oui", search: "Pas de préférence", match: null },
        { label: "Profession :", user: "Ingénieur", search: "Pas de préférence", match: null },
        { label: "Statut professionnel :", user: "Temps plein", search: "Pas de préférence", match: null },
        { label: "Revenu annuel :", user: "Confidentiel", search: "Pas de préférence", match: null },
        { label: "Situation de vie :", user: "Seul", search: "Pas de préférence", match: null },
      ]
    },
    {
      title: "Origines / Valeurs culturelles",
      rows: [
        { label: "Niveau d'études :", user: "Master", search: "Pas de préférence", match: null },
        { label: "Langues parlées :", user: "Français, Anglais", search: "Pas de préférence", match: null },
        { label: "Niveau d'anglais :", user: "Courant", search: "Pas de préférence", match: null },
        { label: "Niveau de français :", user: "Langue maternelle", search: "Pas de préférence", match: null },
        { label: "Religion :", user: "Chrétien", search: "Pas de préférence", match: null },
        { label: "Valeurs religieuses :", user: "Modérées", search: "Pas de préférence", match: null },
        { label: "Polygamie :", user: "Contre", search: "Pas de préférence", match: null },
        { label: "Signe astrologique :", user: "Lion", search: "Pas de préférence", match: null },
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 sm:py-6 pb-24 sm:pb-12">
      {/* Back Link */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-orange-500 font-medium mb-4 sm:mb-6 hover:underline"
      >
        <ArrowLeft className="w-[18px] h-[18px]" />
        <span className="text-sm sm:text-base">Retour</span>
      </button>

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-neutral-200 overflow-hidden mb-6 sm:mb-8">
        <div className="flex flex-col md:flex-row">
          {/* Photo Section */}
          <div className="md:w-[320px] relative aspect-square md:aspect-auto group">
            <img 
              src={displayProfile.photo} 
              alt={displayProfile.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            
            {isOwnProfile && (
              <button 
                onClick={() => setIsChangePhotoModalOpen(true)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2"
              >
                <div className="p-2 sm:p-3 bg-white/20 rounded-full backdrop-blur-md">
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Modifier la photo</span>
              </button>
            )}

            {displayProfile.online && (
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
                <span className="bg-emerald-500/90 text-white text-[9px] sm:text-[11px] font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full flex items-center gap-1 sm:gap-1.5 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></span>
                  En ligne
                </span>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex-1 p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 sm:mb-6">
              <div>
                <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800">{displayProfile.name}</h1>
                  <span 
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${displayProfile.online ? 'bg-emerald-500' : 'bg-neutral-300'}`}
                    title={displayProfile.online ? 'En ligne' : 'Hors ligne'}
                  ></span>
                </div>
                <div className="text-neutral-500 text-xs sm:text-sm font-medium">
                  {displayProfile.age} ans • {displayProfile.city} • {displayProfile.country}
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start overflow-x-auto pb-2 sm:pb-0">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onLike) onLike();
                  }}
                  className={`p-2 sm:p-3 rounded-full border border-neutral-100 transition-all relative shrink-0 ${
                    isSubscribed 
                      ? 'text-neutral-300 hover:text-red-500 hover:bg-red-50' 
                      : 'text-neutral-200 bg-neutral-50 cursor-not-allowed'
                  }`}
                >
                  <Heart className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px]" />
                   {!isSubscribed && (
                    <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-neutral-100">
                      <Lock className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-neutral-400" />
                    </div>
                  )}
                </button>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onFavorite) onFavorite();
                  }}
                  className={`p-2 sm:p-3 rounded-full border border-neutral-100 transition-all relative shrink-0 ${
                    isSubscribed 
                      ? 'text-neutral-300 hover:text-yellow-500 hover:bg-yellow-50' 
                      : 'text-neutral-200 bg-neutral-50 cursor-not-allowed'
                  }`}
                >
                  <Star className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px]" />
                  {!isSubscribed && (
                    <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-neutral-100">
                      <Lock className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-neutral-400" />
                    </div>
                  )}
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onMessage) onMessage();
                  }}
                  className="p-2 sm:p-3 rounded-full border border-neutral-100 text-neutral-300 hover:text-blue-500 hover:bg-blue-50 transition-all shrink-0"
                >
                  <MessageCircle className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px]" />
                </button>
                {!isOwnProfile && (
                  <>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Voulez-vous vraiment bloquer ${displayProfile.name} ?`)) {
                          api.add('block_list', { 
                            blockedUserId: displayProfile.id, 
                            blockedUserName: displayProfile.name,
                            blockedUserPhoto: displayProfile.photo,
                            timestamp: new Date().toISOString() 
                          }).then(() => {
                            toast.error(`${displayProfile.name} a été bloqué(e)`);
                            onBack();
                          });
                        }
                      }}
                      className="p-2 sm:p-3 rounded-full border border-neutral-100 text-neutral-300 hover:text-red-600 hover:bg-red-50 transition-all shrink-0"
                      title="Bloquer l'utilisateur"
                    >
                      <UserX className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px]" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const reason = window.prompt(`Pourquoi souhaitez-vous signaler ${displayProfile.name} ?`);
                        if (reason) {
                          api.add('reports', { 
                            reportedUserId: displayProfile.id, 
                            reportedUserName: displayProfile.name,
                            reason,
                            timestamp: new Date().toISOString() 
                          }).then(() => {
                            toast.warning(`Signalement envoyé pour ${displayProfile.name}`);
                          });
                        }
                      }}
                      className="p-2 sm:p-3 rounded-full border border-neutral-100 text-neutral-300 hover:text-orange-600 hover:bg-orange-50 transition-all shrink-0"
                      title="Signaler l'utilisateur"
                    >
                      <ShieldAlert className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px]" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Boost Section (Only for own profile or demo) */}
            <div className="bg-amber-50/50 border border-amber-100 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                  <Zap className="w-[18px] h-[18px] sm:w-5 sm:h-5" fill="currentColor" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-800 text-xs sm:text-sm">Boost de profil</h3>
                  <p className="text-neutral-500 text-[10px] sm:text-xs">Apparaissez en tête des résultats pendant 24h.</p>
                </div>
              </div>
              <button className="w-full mt-3 sm:mt-4 py-2.5 sm:py-3 border border-amber-200 rounded-lg sm:rounded-xl text-amber-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:bg-amber-100 transition-all bg-white">
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Acheter des boosts (5€ / 10)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-neutral-200 p-1 flex mb-6 sm:mb-8 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex-1 min-w-[100px] py-3 sm:py-4 text-[10px] sm:text-sm font-bold transition-all border-b-2 shrink-0 ${activeTab === 'profile' ? 'bg-orange-50/50 text-orange-600 border-orange-500' : 'text-neutral-400 border-transparent hover:bg-neutral-50'}`}
        >
          Profil & Critères
        </button>
        <button 
          onClick={onBack}
          className={`flex-1 min-w-[100px] py-3 sm:py-4 text-[10px] sm:text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 ${activeTab === 'hobbies' ? 'bg-orange-50/50 text-orange-600 border-orange-500' : 'text-neutral-400 border-transparent hover:bg-neutral-50'}`}
        >
          <Target className={`w-3.5 h-3.5 sm:w-[18px] sm:h-[18px] ${activeTab === 'hobbies' ? 'text-orange-500' : 'text-neutral-300'}`} />
          Loisirs & Intérêts
        </button>
        <button 
          onClick={() => setActiveTab('personality')}
          className={`flex-1 min-w-[100px] py-3 sm:py-4 text-[10px] sm:text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 ${activeTab === 'personality' ? 'bg-orange-50/50 text-orange-600 border-orange-500' : 'text-neutral-400 border-transparent hover:bg-neutral-50'}`}
        >
          <Brain className={`w-3.5 h-3.5 sm:w-[18px] sm:h-[18px] ${activeTab === 'personality' ? 'text-purple-500' : 'text-neutral-300'}`} />
          Personnalité
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-neutral-200 overflow-hidden mb-8 sm:mb-12">
        {activeTab === 'profile' ? (
          <>
            <div className="p-4 sm:p-8 border-b border-neutral-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-800">Plus d'informations</h2>
              <div className="flex gap-4 sm:gap-6 text-[10px] sm:text-xs font-bold">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-400 rounded-full"></span>
                  <span className="text-neutral-400">Correspondance</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-300 rounded-full"></span>
                  <span className="text-neutral-400">Pas de correspondance</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px] sm:min-w-0">
                <thead>
                  <tr className="bg-neutral-50/50 text-[10px] sm:text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                    <th className="px-4 sm:px-8 py-4 sm:py-5 border-b border-neutral-100">INFORMATION</th>
                    <th className="px-4 sm:px-8 py-4 sm:py-5 border-b border-neutral-100 text-orange-600">{displayProfile.name}</th>
                    <th className="px-4 sm:px-8 py-4 sm:py-5 border-b border-neutral-100">Recherche</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, catIdx) => (
                    <Fragment key={catIdx}>
                      <tr className="bg-neutral-50/30">
                        <td colSpan={3} className="px-4 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-orange-700">
                          {category.title}
                        </td>
                      </tr>
                      {category.rows.map((row, rowIdx) => (
                        <tr key={rowIdx} className="group hover:bg-neutral-50/50 transition-colors">
                          <td className="px-4 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm text-neutral-500 border-b border-neutral-50 w-1/3">
                            {row.label}
                          </td>
                          <td className={`px-4 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b border-neutral-50 w-1/3 ${row.match === true ? 'text-emerald-600' : row.match === false ? 'text-red-500' : 'text-neutral-400 italic'}`}>
                            {row.user}
                          </td>
                          <td className={`px-4 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm border-b border-neutral-50 w-1/3 ${row.match === true ? 'text-emerald-600' : row.match === false ? 'text-red-500' : 'text-neutral-400 italic'}`}>
                            {row.search}
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : activeTab === 'hobbies' ? (
          <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-800 mb-3 sm:mb-4 flex items-center gap-2">
                <Target className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-orange-500" />
                Loisirs
              </h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {['Voyages', 'Cuisine', 'Cinéma', 'Randonnée', 'Photographie', 'Lecture', 'Musique'].map(item => (
                  <span key={item} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-50 text-orange-700 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium border border-orange-100">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-800 mb-3 sm:mb-4 flex items-center gap-2">
                <Sparkles className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-amber-500" />
                Intérêts
              </h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {['Technologie', 'Art', 'Histoire', 'Musique Classique', 'Environnement', 'Psychologie', 'Astronomie'].map(item => (
                  <span key={item} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-50 text-amber-700 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium border border-amber-100">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="p-4 sm:p-6 bg-purple-50 rounded-xl sm:rounded-2xl border border-purple-100">
                <h3 className="font-bold text-purple-800 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <Brain className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
                  Traits de caractère
                </h3>
                <ul className="space-y-2 sm:space-y-3">
                  {['Calme et réfléchi', 'Empathique', 'Curieux et ouvert d\'esprit', 'Organisé et fiable'].map((trait, i) => (
                    <li key={i} className="flex items-center gap-2 text-neutral-700 text-xs sm:text-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
                      {trait}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 sm:p-6 bg-emerald-50 rounded-xl sm:rounded-2xl border border-emerald-100">
                <h3 className="font-bold text-emerald-800 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <ShieldAlert className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
                  Valeurs
                </h3>
                <ul className="space-y-2 sm:space-y-3">
                  {['Honnêteté absolue', 'Respect mutuel', 'Importance de la famille', 'Loyauté et fidélité'].map((value, i) => (
                    <li key={i} className="flex items-center gap-2 text-neutral-700 text-xs sm:text-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                      {value}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="bg-neutral-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-neutral-100">
              <h3 className="text-lg sm:text-xl font-bold text-neutral-800 mb-3 sm:mb-4">Description personnelle</h3>
              <p className="text-neutral-600 leading-relaxed italic text-sm sm:text-base">
                "Je suis une personne passionnée par la découverte de nouvelles cultures et de nouveaux horizons. 
                J'aime les plaisirs simples de la vie, comme une bonne discussion autour d'un café ou une promenade en forêt. 
                Je recherche quelqu'un avec qui partager ces moments et construire une relation basée sur la confiance et la complicité. 
                Mon approche de la vie est positive et je crois fermement que chaque rencontre est une opportunité d'apprendre."
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Change Photo Modal */}
      <AnimatePresence>
        {isChangePhotoModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChangePhotoModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-neutral-100">
                <h3 className="text-xl font-bold text-neutral-800">Changer ma photo de profil</h3>
                <button 
                  onClick={() => setIsChangePhotoModalOpen(false)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X className="text-neutral-400 w-5 h-5" />
                </button>
              </div>

              <div className="p-8">
                {/* Upload New Photo */}
                <div 
                  onClick={handleUploadNewPhoto}
                  className="border-2 border-dashed border-orange-200 rounded-2xl p-8 text-center cursor-pointer hover:bg-orange-50/50 transition-all mb-8 group"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="text-orange-500 w-6 h-6" />
                  </div>
                  <div className="font-bold text-neutral-800 mb-1">Télécharger une nouvelle photo</div>
                  <p className="text-xs text-neutral-400">Elle sera soumise à modération avant d'être publique</p>
                </div>

                {/* Select Existing Photo */}
                <div>
                  <h4 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-4">Ou choisir parmi vos photos</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {displayProfile.photos && displayProfile.photos.length > 0 ? (
                      displayProfile.photos.map((photoUrl, idx) => (
                        <div 
                          key={idx}
                          onClick={() => handleUpdatePhoto(photoUrl)}
                          className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer group border-2 transition-all ${displayProfile.photo === photoUrl ? 'border-orange-500 ring-4 ring-orange-500/10' : 'border-transparent hover:border-orange-200'}`}
                        >
                          <img 
                            src={photoUrl} 
                            alt={`Photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {displayProfile.photo === photoUrl && (
                            <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                              <div className="bg-white rounded-full p-1 shadow-sm">
                                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-12 text-center bg-neutral-50 rounded-2xl border border-neutral-100">
                        <Camera className="mx-auto mb-2 text-neutral-200 w-8 h-8" />
                        <p className="text-sm text-neutral-400">Aucune autre photo disponible</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-3">
                <button 
                  onClick={() => setIsChangePhotoModalOpen(false)}
                  className="px-6 py-2.5 text-sm font-bold text-neutral-500 hover:bg-neutral-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
