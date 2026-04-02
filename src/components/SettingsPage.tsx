import { 
  ArrowLeft, 
  Settings, 
  User, 
  Eye, 
  Bell, 
  Shield, 
  Mail, 
  Lock, 
  Trash2, 
  ChevronRight,
  MessageSquare,
  Users,
  Heart,
  Star,
  Gift,
  Moon,
  BellOff,
  Save,
  UserX,
  Flag
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export default function SettingsPage({ onBack }) {
  const [activeSection, setActiveSection] = useState('account');
  const [privacyToggles, setPrivacyToggles] = useState({
    onlineStatus: true,
    lastSeen: true,
    profileVisits: false,
    showAge: true,
    showLocation: true,
    personalizedAdvice: true
  });
  const [notificationToggles, setNotificationToggles] = useState({
    pushEnabled: true,
    newMessages: true,
    newMatches: true,
    profileVisits: true,
    likesReceived: true,
    addedToFavorites: true,
    offersPromotions: false,
    emailNotifications: true,
    silentMode: false
  });
  const [messagePreference, setMessagePreference] = useState('everyone');

  const togglePrivacy = (key) => {
    setPrivacyToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleNotification = (key) => {
    setNotificationToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const sidebarItems = [
    { id: 'account', icon: <User className="w-5 h-5" />, label: "Compte" },
    { id: 'privacy', icon: <Eye className="w-5 h-5" />, label: "Confidentialité" },
    { id: 'notifications', icon: <Bell className="w-5 h-5" />, label: "Notifications" },
    { id: 'security', icon: <Shield className="w-5 h-5" />, label: "Sécurité" },
  ];

  const Toggle = ({ enabled, onToggle }) => (
    <button 
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-black' : 'bg-neutral-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-orange-500 shrink-0"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-orange-500 p-1.5 sm:p-2 rounded-lg text-white">
            <Settings className="w-[18px] h-[18px] sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-800">Paramètres</h1>
            <p className="text-neutral-500 text-[10px] sm:text-sm">Gérez votre compte et vos préférences</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
        {/* Sidebar / Tabs */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-neutral-100 overflow-hidden flex lg:flex-col overflow-x-auto no-scrollbar">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex-1 lg:w-full flex items-center justify-center lg:justify-between px-4 sm:px-6 py-3 sm:py-4 transition-all whitespace-nowrap ${
                  activeSection === item.id 
                    ? 'bg-orange-50 text-orange-600 font-bold border-b-2 lg:border-b-0 lg:border-r-4 border-orange-500' 
                    : 'text-neutral-500 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="shrink-0">{item.icon}</span>
                  <span className="text-xs sm:text-sm">{item.label}</span>
                </div>
                <ChevronRight className={`w-4 h-4 hidden lg:block ${activeSection === item.id ? 'text-orange-500' : 'text-neutral-300'}`} />
              </button>
            ))}
          </div>

          {/* User Profile Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-neutral-100 p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
            <img 
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop" 
              alt="Profile" 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="overflow-hidden min-w-0">
              <h3 className="font-bold text-neutral-800 text-sm sm:text-base truncate">Cornet Jean</h3>
              <p className="text-neutral-400 text-[10px] sm:text-xs truncate">jlcornet878@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-6">
          {activeSection === 'account' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Account Settings */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-neutral-100 p-4 sm:p-8">
                <h2 className="text-[10px] sm:text-[11px] font-bold text-neutral-400 tracking-widest uppercase mb-4 sm:mb-8">Paramètres du compte</h2>
                
                <div className="space-y-3 sm:space-y-4">
                  {/* Email */}
                  <button className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl hover:bg-neutral-50 transition-all border border-transparent hover:border-neutral-100 group">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="bg-orange-500 p-2 sm:p-3 rounded-xl text-white shadow-sm shrink-0">
                        <Mail className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
                      </div>
                      <div className="text-left min-w-0">
                        <h3 className="font-bold text-neutral-800 text-sm sm:text-base truncate">Adresse Email</h3>
                        <p className="text-neutral-500 text-[10px] sm:text-sm truncate">Modifier ou vérifier votre adresse email</p>
                      </div>
                    </div>
                    <ChevronRight className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-neutral-300 group-hover:text-neutral-400 shrink-0" />
                  </button>

                  {/* Password */}
                  <button className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl hover:bg-neutral-50 transition-all border border-transparent hover:border-neutral-100 group">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="bg-slate-700 p-2 sm:p-3 rounded-xl text-white shadow-sm shrink-0">
                        <Lock className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
                      </div>
                      <div className="text-left min-w-0">
                        <h3 className="font-bold text-neutral-800 text-sm sm:text-base truncate">Mot de passe</h3>
                        <p className="text-neutral-500 text-[10px] sm:text-sm truncate">Changer votre mot de passe</p>
                      </div>
                    </div>
                    <ChevronRight className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-neutral-300 group-hover:text-neutral-400 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-red-100 p-4 sm:p-8">
                <h2 className="text-[10px] sm:text-[11px] font-bold text-neutral-400 tracking-widest uppercase mb-4 sm:mb-8">Zone de danger</h2>
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
                  <div className="min-w-0">
                    <h3 className="font-bold text-neutral-800 text-sm sm:text-base mb-1">Supprimer mon compte</h3>
                    <p className="text-neutral-500 text-[10px] sm:text-sm">Cette action est irréversible. Toutes vos données seront supprimées.</p>
                  </div>
                  <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-red-100 text-red-500 font-bold hover:bg-red-50 transition-all active:scale-95 text-sm sm:text-base">
                    <Trash2 className="w-[18px] h-[18px]" />
                    Supprimer
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'privacy' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Profile Visibility */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-neutral-100 p-4 sm:p-8">
                <h2 className="text-[10px] sm:text-[11px] font-bold text-neutral-400 tracking-widest uppercase mb-4 sm:mb-8">Visibilité du profil</h2>
                
                <div className="space-y-4 sm:space-y-6">
                  {[
                    { id: 'onlineStatus', label: 'Statut en ligne', desc: 'Montrer quand vous êtes connecté(e)', icon: <Eye className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />, color: 'bg-purple-500' },
                    { id: 'lastSeen', label: 'Dernière connexion', desc: 'Afficher votre dernière visite', icon: <Eye className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />, color: 'bg-indigo-500' },
                    { id: 'profileVisits', label: 'Visites de profil', desc: 'Permettre aux autres de voir que vous avez visité', icon: <Eye className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />, color: 'bg-blue-500' },
                    { id: 'showAge', label: 'Afficher mon âge', desc: 'Rendre votre âge visible sur votre profil', icon: <Eye className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />, color: 'bg-teal-500' },
                    { id: 'showLocation', label: 'Afficher ma localisation', desc: 'Rendre votre ville visible', icon: <Eye className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />, color: 'bg-cyan-500' },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className={`${item.color} p-2 sm:p-2.5 rounded-xl text-white shadow-sm shrink-0`}>
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-neutral-800 text-xs sm:text-sm truncate">{item.label}</h3>
                          <p className="text-neutral-400 text-[10px] sm:text-xs truncate">{item.desc}</p>
                        </div>
                      </div>
                      <Toggle enabled={privacyToggles[item.id]} onToggle={() => togglePrivacy(item.id)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Personalized Advice */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-neutral-100 p-4 sm:p-8">
                <h2 className="text-[10px] sm:text-[11px] font-bold text-neutral-400 tracking-widest uppercase mb-4 sm:mb-8">Conseils personnalisés</h2>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="bg-orange-500 p-2 sm:p-2.5 rounded-xl text-white shadow-sm shrink-0">
                      <Bell className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-neutral-800 text-xs sm:text-sm truncate">Activer les conseils personnalisés</h3>
                      <p className="text-neutral-400 text-[10px] sm:text-xs truncate">Recevez des suggestions et recommandations basées sur votre profil</p>
                    </div>
                  </div>
                  <Toggle enabled={privacyToggles.personalizedAdvice} onToggle={() => togglePrivacy('personalizedAdvice')} />
                </div>
              </div>

              {/* Messages */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-neutral-100 p-4 sm:p-8">
                <h2 className="text-[10px] sm:text-[11px] font-bold text-neutral-400 tracking-widest uppercase mb-4">Messages</h2>
                <p className="text-neutral-500 text-[10px] sm:text-xs mb-4 sm:mb-6">Qui peut vous envoyer des messages ?</p>
                
                <div className="space-y-2 sm:space-y-3">
                  {[
                    { id: 'everyone', label: 'Tout le monde', desc: "N'importe quel membre peut vous écrire" },
                    { id: 'matches', label: 'Mes correspondances uniquement', desc: 'Seulement vos correspondances' },
                    { id: 'nobody', label: 'Personne', desc: 'Désactiver les messages entrants' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setMessagePreference(option.id)}
                      className={`w-full text-left p-3 sm:p-4 rounded-xl border transition-all ${
                        messagePreference === option.id 
                          ? 'border-orange-500 bg-orange-50/30' 
                          : 'border-neutral-100 hover:border-neutral-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-bold text-neutral-800 text-xs sm:text-sm truncate">{option.label}</h3>
                          <p className="text-neutral-400 text-[10px] sm:text-xs truncate">{option.desc}</p>
                        </div>
                        {messagePreference === option.id && <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 shrink-0" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'notifications' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Header Card */}
              <div className="bg-orange-500 rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-8 text-white">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                  <h2 className="text-lg sm:text-xl font-bold">Préférences de notification</h2>
                </div>
                <p className="text-orange-100 text-[10px] sm:text-sm">Personnalisez vos alertes et notifications</p>
              </div>

              {/* Warning Box */}
              <div className="bg-red-50 border border-red-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex items-start gap-3 sm:gap-4">
                <div className="bg-white p-1.5 sm:p-2 rounded-lg text-red-400 shadow-sm shrink-0">
                  <BellOff className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </div>
                <p className="text-red-700 text-[10px] sm:text-xs leading-relaxed">
                  Notifications bloquées par le navigateur. Modifiez les permissions dans les paramètres de votre navigateur.
                </p>
              </div>

              {/* Master Push Toggle */}
              <div className="bg-orange-50/30 border border-orange-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="text-orange-500 shrink-0">
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-neutral-800 text-xs sm:text-sm truncate">Notifications Push</h3>
                    <p className="text-neutral-400 text-[10px] sm:text-xs truncate">Activer toutes les notifications</p>
                  </div>
                </div>
                <Toggle enabled={notificationToggles.pushEnabled} onToggle={() => toggleNotification('pushEnabled')} />
              </div>

              {/* Notification Types */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-neutral-100 p-4 sm:p-8">
                <h2 className="text-xs sm:text-sm font-bold text-neutral-800 mb-4 sm:mb-8">Types de notifications</h2>
                
                <div className="space-y-4 sm:space-y-6">
                  {[
                    { id: 'newMessages', label: 'Nouveaux messages', desc: 'Recevoir une alerte pour chaque nouveau message', icon: <MessageSquare className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />, color: 'bg-blue-500' },
                    { id: 'newMatches', label: 'Nouvelles correspondances', desc: 'Quand un profil correspond à vos critères', icon: <Users className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />, color: 'bg-emerald-500' },
                    { id: 'profileVisits', label: 'Visites de profil', desc: 'Quand quelqu\'un consulte votre profil', icon: <Eye className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />, color: 'bg-purple-500' },
                    { id: 'likesReceived', label: 'Likes reçus', desc: 'Quand quelqu\'un aime votre profil', icon: <Heart className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />, color: 'bg-red-500' },
                    { id: 'addedToFavorites', label: 'Ajouts aux favoris', desc: 'Quand quelqu\'un vous ajoute en favori', icon: <Star className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />, color: 'bg-amber-500' },
                    { id: 'offersPromotions', label: 'Offres et promotions', desc: 'Recevoir nos offres spéciales', icon: <Gift className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />, color: 'bg-pink-500' },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 py-1 sm:py-2 border-b border-neutral-50 last:border-0">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className={`${item.color} p-2 sm:p-2.5 rounded-xl text-white shadow-sm shrink-0`}>
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-neutral-800 text-xs sm:text-sm truncate">{item.label}</h3>
                          <p className="text-neutral-400 text-[10px] sm:text-xs truncate">{item.desc}</p>
                        </div>
                      </div>
                      <Toggle enabled={notificationToggles[item.id]} onToggle={() => toggleNotification(item.id)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Section */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-neutral-100 p-4 sm:p-8">
                <h2 className="text-xs sm:text-sm font-bold text-neutral-800 mb-4 sm:mb-8">Email</h2>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="bg-slate-500 p-2 sm:p-2.5 rounded-xl text-white shadow-sm shrink-0">
                    <Mail className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-neutral-800 text-xs sm:text-sm truncate">Notifications par email</h3>
                      <p className="text-neutral-400 text-[10px] sm:text-xs truncate">Recevoir aussi les notifications par email</p>
                    </div>
                  </div>
                  <Toggle enabled={notificationToggles.emailNotifications} onToggle={() => toggleNotification('emailNotifications')} />
                </div>
              </div>

              {/* Silent Mode Section */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-neutral-100 p-4 sm:p-8">
                <h2 className="text-xs sm:text-sm font-bold text-neutral-800 mb-4 sm:mb-8">Mode silencieux</h2>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="bg-indigo-500 p-2 sm:p-2.5 rounded-xl text-white shadow-sm shrink-0">
                      <Moon className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-neutral-800 text-xs sm:text-sm truncate">Activer le mode silencieux</h3>
                      <p className="text-neutral-400 text-[10px] sm:text-xs truncate">Désactiver les notifications pendant certaines heures</p>
                    </div>
                  </div>
                  <Toggle enabled={notificationToggles.silentMode} onToggle={() => toggleNotification('silentMode')} />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-center sm:justify-end pt-2 sm:pt-4">
                <button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 text-sm sm:text-base">
                  <Save className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  Enregistrer
                </button>
              </div>
            </motion.div>
          )}

          {activeSection === 'security' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Blocked Users Section */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                <div className="p-4 sm:p-8 border-b border-neutral-50 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-[10px] sm:text-[11px] font-bold text-neutral-400 tracking-widest uppercase mb-1">Utilisateurs bloqués</h2>
                    <p className="text-neutral-400 text-[10px] sm:text-xs truncate">Les utilisateurs bloqués ne peuvent ni vous écrire ni voir votre profil</p>
                  </div>
                  <div className="bg-neutral-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-neutral-500 text-[10px] sm:text-xs font-bold shrink-0">0</div>
                </div>
                <div className="p-10 sm:p-16 flex flex-col items-center justify-center text-center">
                  <UserX className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-200 mb-3 sm:mb-4" strokeWidth={1.5} />
                  <p className="text-neutral-400 text-xs sm:text-sm font-medium">Aucun utilisateur bloqué</p>
                </div>
              </div>

              {/* Reports Sent Section */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                <div className="p-4 sm:p-8 border-b border-neutral-50 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-[10px] sm:text-[11px] font-bold text-neutral-400 tracking-widest uppercase mb-1">Signalements envoyés</h2>
                    <p className="text-neutral-400 text-[10px] sm:text-xs truncate">Historique de vos signalements de conversations</p>
                  </div>
                  <div className="bg-neutral-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-neutral-500 text-[10px] sm:text-xs font-bold shrink-0">0</div>
                </div>
                <div className="p-10 sm:p-16 flex flex-col items-center justify-center text-center">
                  <Flag className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-200 mb-3 sm:mb-4" strokeWidth={1.5} />
                  <p className="text-neutral-400 text-xs sm:text-sm font-medium">Aucun signalement envoyé</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection !== 'account' && activeSection !== 'privacy' && activeSection !== 'notifications' && activeSection !== 'security' && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-neutral-100 p-8 sm:p-12 text-center">
              <p className="text-neutral-400 text-xs sm:text-sm italic">Cette section sera disponible prochainement.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
