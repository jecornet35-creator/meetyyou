/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import { io } from 'socket.io-client';
import { api } from './lib/api';
import Home from './components/Home';
import Register from './components/Register';
import ProfilePage from './components/ProfilePage';
import EditProfile from './components/EditProfile';
import PhotosPage from './components/PhotosPage';
import HobbiesPage from './components/HobbiesPage';
import PersonalityQuestionsPage from './components/PersonalityQuestionsPage';
import VerifyProfilePage from './components/VerifyProfilePage';
import BlockedUsersPage from './components/BlockedUsersPage';
import SettingsPage from './components/SettingsPage';
import HelpPage from './components/HelpPage';
import SubscriptionPage from './components/SubscriptionPage';
import CorrespondencePage from './components/CorrespondencePage';
import ChatPage from './components/ChatPage';
import ConversationsPage from './components/ConversationsPage';
import UserListPage from './components/UserListPage';
import AdminDashboard from './components/AdminDashboard';
import TermsOfUse from './components/TermsOfUse';
import AboutUs from './components/AboutUs';
import SimpleFiltersModal from './components/SimpleFiltersModal';
import AdvancedFiltersPage from './components/AdvancedFiltersPage';
import { 
  Heart, 
  MessageCircle, 
  User, 
  Search, 
  Bell, 
  MapPin,
  CheckCircle2,
  Menu,
  X,
  Settings,
  Camera,
  Sparkles,
  HelpCircle,
  Shield,
  Zap,
  ChevronDown,
  Star,
  Eye,
  Trash2,
  Home as HomeIcon,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isSimpleFiltersModalOpen, setIsSimpleFiltersModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [advancedFilters, setAdvancedFilters] = useState(null);
  const [temporaryFilters, setTemporaryFilters] = useState(null);
  const [blockedUserIds, setBlockedUserIds] = useState([]);
  const [view, setView] = useState('discover'); // 'discover', 'profile', 'edit-profile', 'photos', 'hobbies', 'personality', 'verify', 'blocked', 'settings', 'help', 'subscription', 'admin', 'advanced-filters', 'chat', 'likes', 'views', 'favorites', 'messages'
  const [listType, setListType] = useState(null); // 'likes', 'views', 'favorites'

  const [likesCount, setLikesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const socketRef = useRef(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [freeAccessActive, setFreeAccessActive] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setView('discover');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setView('discover');
  };

  useEffect(() => {
    if (socketRef.current && isLoggedIn && currentUser?.email) {
      console.log('Joining room:', currentUser.email);
      socketRef.current.emit('join', currentUser.email);
    }
  }, [isLoggedIn, currentUser]);

  useEffect(() => {
    setTemporaryFilters(null);
  }, [isLoggedIn]);

  const checkAccess = () => {
    if (isSubscribed || freeAccessActive) return true;
    toast.error("Fonctionnalité Premium", {
      description: "Vous devez être abonné pour effectuer cette action.",
      action: {
        label: "S'abonner",
        onClick: () => setView('subscription')
      }
    });
    return false;
  };

  const handleLike = async (profile) => {
    if (!checkAccess()) return;
    toast.success(`Vous avez liké le profil de ${profile.name}`, {
      description: "Une notification a été envoyée au profil.",
      icon: <Heart className="text-red-500 fill-red-500 w-4 h-4" />
    });
    
    // Save notification for the other user
    await api.add('notifications', {
      user_email: profile.id, // Notification for the profile being liked
      type: 'like',
      title: `${myProfile.name} a liké votre profil`,
      message: "A liké votre profil",
      from_profile_id: 'my-id',
      from_profile_name: myProfile.name,
      from_profile_photo: myProfile.photo,
      from_profile_age: myProfile.age,
      from_profile_city: myProfile.city,
      is_read: false,
      created_date: new Date().toISOString()
    });
  };

  const handleFavorite = async (profile) => {
    if (!checkAccess()) return;
    toast.success(`${profile.name} a été ajouté à vos favoris`, {
      description: "Une notification a été envoyée au profil.",
      icon: <Star className="text-yellow-500 fill-yellow-500 w-4 h-4" />
    });

    // Save notification for the other user
    await api.add('notifications', {
      user_email: profile.id, // Notification for the profile being favorited
      type: 'favorite',
      title: `${myProfile.name} vous a ajouté en favori`,
      message: "Vous a ajouté en favori",
      from_profile_id: 'my-id',
      from_profile_name: myProfile.name,
      from_profile_photo: myProfile.photo,
      from_profile_age: myProfile.age,
      from_profile_city: myProfile.city,
      is_read: false,
      created_date: new Date().toISOString()
    });
  };

  const handleViewProfile = async (profile) => {
    setSelectedProfile(profile);
    setView('profile');
    toast.info(`Vous visitez le profil de ${profile.name}`, {
      description: "Le profil a été informé de votre visite."
    });

    // Save notification for the other user
    await api.add('notifications', {
      user_email: profile.id, // Notification for the profile being viewed
      type: 'profile_view',
      title: `${myProfile.name} a consulté votre profil`,
      message: "A regardé votre profil",
      from_profile_id: 'my-id',
      from_profile_name: myProfile.name,
      from_profile_photo: myProfile.photo,
      from_profile_age: myProfile.age,
      from_profile_city: myProfile.city,
      is_read: false,
      created_date: new Date().toISOString()
    });
  };

  const handleMessage = (profile) => {
    setSelectedProfile(profile);
    setView('chat');
  };

  const myProfile = {
    name: "Jean-Pierre Martin",
    email: "jlcornet878@gmail.com",
    age: 42,
    city: "Lyon",
    country: "France",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=4&w=800&h=800&q=80",
    gender: "man",
    looking_for: "woman",
    search_type: "Mariage",
    is_verified: true,
    online: true
  };

  useEffect(() => {
    const loadFilters = async () => {
      const savedFilters = await api.get('advanced_filters');
      if (savedFilters) {
        setAdvancedFilters(savedFilters);
      }
    };
    loadFilters();
  }, []);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        const [subs, settings] = await Promise.all([
          api.get('subscriptions'),
          api.get('global_settings')
        ]);
        
        // Check if user has active subscription
        const mySub = (subs || []).find(s => s.user_email === currentUser?.email && s.status === 'active');
        setIsSubscribed(!!mySub);

        // Check global free access
        if (settings && settings.freeAccessActive) {
          const now = new Date();
          const start = settings.freeAccessStartDate ? new Date(settings.freeAccessStartDate) : null;
          const end = settings.freeAccessEndDate ? new Date(settings.freeAccessEndDate) : null;
          
          if ((!start || now >= start) && (!end || now <= end)) {
            setFreeAccessActive(true);
          } else {
            setFreeAccessActive(false);
          }
        } else {
          setFreeAccessActive(false);
        }
      } catch (error) {
        console.error("Failed to check subscription:", error);
      }
    };
    if (isLoggedIn) {
      checkSubscriptionStatus();
    }
  }, [isLoggedIn, view]);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchCounts = async () => {
        try {
          const notifications = await api.get('notifications');
          const myNotifications = (notifications || []).filter(n => n.user_email === currentUser?.email);
          
          setLikesCount(myNotifications.filter(n => n.type === 'like').length);
          setViewsCount(myNotifications.filter(n => n.type === 'profile_view').length);
          setFavoritesCount(myNotifications.filter(n => n.type === 'favorite').length);
        } catch (error) {
          console.error("Failed to fetch notification counts:", error);
        }
      };
      fetchCounts();

      // Initialize Socket.io
      const socket = io(window.location.origin);
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        if (currentUser?.email) {
          socket.emit('join', currentUser.email);
        }
      });

      socket.on('notification', (notification) => {
        console.log('Received real-time notification:', notification);
        
        // Update counts immediately
        if (notification.type === 'like') {
          setLikesCount(prev => prev + 1);
          toast.success("Nouveau Like !", {
            description: notification.title,
            icon: <Heart className="text-red-500 fill-red-500 w-4 h-4" />
          });
        } else if (notification.type === 'profile_view') {
          setViewsCount(prev => prev + 1);
          toast.info("Nouvelle visite !", {
            description: notification.title,
            icon: <Eye className="text-blue-500 w-4 h-4" />
          });
        } else if (notification.type === 'favorite') {
          setFavoritesCount(prev => prev + 1);
          toast.success("Nouveau Favori !", {
            description: notification.title,
            icon: <Star className="text-yellow-500 fill-yellow-500 w-4 h-4" />
          });
        }
      });

      socket.on('user:banned', () => {
        console.log('User has been banned. Logging out.');
        handleLogout();
        toast.error("Compte Banni", {
          description: "Votre compte a été banni par un administrateur."
        });
      });

      return () => {
        if (socket) socket.disconnect();
      };
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchAdvancedFilters = async () => {
        const filters = await api.get('advanced_filters');
        if (filters) setAdvancedFilters(filters);
      };
      fetchAdvancedFilters();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchData = async () => {
        try {
          // Fetch blocked users first
          const blockedData = await api.get('block_list');
          const blockedIds = (blockedData || []).map(u => u.blockedUserId);
          setBlockedUserIds(blockedIds);

          // Fetch correspondence for base filtering
          const correspondenceData = await api.get('correspondance');
          // For demo purposes, we'll use the first correspondence or one matching our user
          const myCorrespondence = (correspondenceData || []).find(c => c.created_by === currentUser?.email) || (correspondenceData && correspondenceData[0]);

          let data = await api.get('profiles');
          
          // Filter out blocked users
          data = data.filter(profile => !blockedIds.includes(profile.id));
          
          // Base filtering by looking_for from correspondence (if not overridden by filters)
          if (!temporaryFilters && !advancedFilters && myCorrespondence && myCorrespondence.looking_for) {
            const lookingFor = myCorrespondence.looking_for.toLowerCase();
            data = data.filter(profile => {
              if (lookingFor === 'women' || lookingFor === 'femmes') return profile.gender === 'femme' || profile.gender === 'woman';
              if (lookingFor === 'men' || lookingFor === 'hommes') return profile.gender === 'homme' || profile.gender === 'man';
              return true;
            });
          }

          // Apply filters (Temporary filters have priority)
          const currentFilters = temporaryFilters || advancedFilters;
          
          if (currentFilters) {
            data = data.filter(profile => {
              // Age filtering
              if (currentFilters.ageMin && currentFilters.ageMin !== '-' && profile.age < parseInt(currentFilters.ageMin)) return false;
              if (currentFilters.ageMax && currentFilters.ageMax !== '-' && profile.age > parseInt(currentFilters.ageMax)) return false;
              
              // Gender filtering
              if (currentFilters.lookingFor === 'Femme' || currentFilters.lookingFor === 'Femmes') {
                if (!(profile.gender === 'femme' || profile.gender === 'woman')) return false;
              }
              if (currentFilters.lookingFor === 'Homme' || currentFilters.lookingFor === 'Hommes') {
                if (!(profile.gender === 'homme' || profile.gender === 'man')) return false;
              }
              
              // Localisation
              if (currentFilters.country && !profile.country?.toLowerCase().includes(currentFilters.country.toLowerCase())) return false;
              if (currentFilters.city && !profile.city?.toLowerCase().includes(currentFilters.city.toLowerCase())) return false;
              
              // Appearance (Advanced filters only)
              if (currentFilters.bodyType && !currentFilters.bodyType.includes('Pas de préférence')) {
                if (!currentFilters.bodyType.includes(profile.body_type)) return false;
              }
              if (currentFilters.ethnicity && !currentFilters.ethnicity.includes('Pas de préférence')) {
                if (!currentFilters.ethnicity.includes(profile.ethnicity)) return false;
              }
              
              // Mode de vie (Advanced filters only)
              if (currentFilters.smoking && currentFilters.smoking !== 'Pas de préférence') {
                if (profile.smoking !== currentFilters.smoking) return false;
              }
              if (currentFilters.drinking && currentFilters.drinking !== 'Pas de préférence') {
                if (profile.drinking !== currentFilters.drinking) return false;
              }
              
              return true;
            });
          }
          
          // Sort by online status (Online users first)
          data.sort((a, b) => {
            if (a.is_online === b.is_online) return 0;
            return a.is_online ? -1 : 1;
          });
          
          setProfiles(data);
        } catch (error) {
          console.error("Failed to fetch profiles:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isLoggedIn, advancedFilters, temporaryFilters, view]);

  if (view === 'admin') {
    return <AdminDashboard onBack={() => setView('discover')} socket={socketRef.current} />;
  }

  if (!isLoggedIn) {
    if (showRegister) {
      return (
        <Register 
          onBack={() => setShowRegister(false)} 
          onRegisterSuccess={() => {
            setShowRegister(false);
            setIsLoggedIn(true);
          }} 
        />
      );
    }
    if (view === 'terms') {
      return <TermsOfUse onBack={() => setView('discover')} />;
    }
    if (view === 'about') {
      return <AboutUs onBack={() => setView('discover')} />;
    }
    return (
      <Home 
        onLogin={handleLogin} 
        onRegister={() => setShowRegister(true)} 
        onAdminClick={() => setView('admin')}
        onTermsClick={() => setView('terms')}
        onAboutClick={() => setView('about')}
      />
    );
  }

  const menuItems = [
    { icon: <User className="w-[18px] h-[18px]" />, label: "Voir le profil", onClick: () => { setSelectedProfile(null); setView('profile'); } },
    { icon: <Settings className="w-[18px] h-[18px]" />, label: "Modifier Mon Profil", onClick: () => setView('edit-profile') },
    { icon: <Camera className="w-[18px] h-[18px]" />, label: "Photos", onClick: () => setView('photos') },
    { icon: <Sparkles className="w-[18px] h-[18px]" />, label: "Loisirs et Intérêts", onClick: () => setView('hobbies') },
    { icon: <HelpCircle className="w-[18px] h-[18px]" />, label: "Questions Sur Votre Personnalité", onClick: () => setView('personality') },
    { icon: <CheckCircle2 className="w-[18px] h-[18px]" />, label: "Vérifier mon profil", onClick: () => setView('verify') },
    { icon: <Shield className="w-[18px] h-[18px]" />, label: "Utilisateurs bloqués", onClick: () => setView('blocked') },
    { icon: <Settings className="w-[18px] h-[18px]" />, label: "Paramètres", onClick: () => setView('settings'), active: true },
    { icon: <HelpCircle className="w-[18px] h-[18px]" />, label: "Aide", onClick: () => setView('help') },
    { icon: <Zap className="w-[18px] h-[18px]" />, label: "Abonnez-vous", onClick: () => setView('subscription') },
    { icon: <Heart className="w-[18px] h-[18px]" />, label: "Correspondance", onClick: () => setView('correspondance') },
    { icon: <Shield className="w-[18px] h-[18px]" />, label: "Dashboard Admin", onClick: () => setView('admin') },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 font-sans text-neutral-900">
      {/* Main Header */}
      <Toaster position="top-right" expand={true} richColors />
      <header className="bg-orange-500 text-white px-4 py-2 sticky top-0 z-50 shadow-md">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 lg:gap-8">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {
                setTemporaryFilters(null);
                setView('discover');
                setActiveTab('discover');
              }}
            >
              <Heart className="text-white fill-white w-6 h-6 sm:w-7 sm:h-7" />
              <span className="text-xl sm:text-2xl font-bold tracking-tight">Meetyyou</span>
            </div>

            {/* User Profile Trigger - Hidden on mobile, moved to bottom nav or sidebar if needed, but keeping here for now with adjustments */}
            <div 
              className="relative flex items-center gap-2 sm:gap-3 cursor-pointer hover:bg-white/10 p-1 rounded-lg transition-colors"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80" 
                alt="Profile" 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white/50"
              />
              <div className="hidden md:block leading-tight">
                <div className="font-bold text-xs sm:text-sm">Bienvenue</div>
                <div className="text-[10px] sm:text-[11px] text-white/80">Complétez vos critères</div>
              </div>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl py-2 text-neutral-700 overflow-hidden border border-neutral-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {menuItems.map((item, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => {
                          if (item.onClick) item.onClick();
                          setIsUserMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-4 px-4 py-2.5 text-sm hover:bg-neutral-50 transition-colors ${item.active ? 'text-orange-500 font-medium' : 'text-neutral-600'}`}
                      >
                        <span className={item.active ? 'text-orange-500' : 'text-neutral-400'}>{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                    <div className="h-px bg-neutral-100 my-1"></div>
                    <button 
                      onClick={() => {
                        setShowLogoutConfirmation(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-4 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Déconnexion
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center gap-2 sm:gap-6">
            <div className="hidden xl:flex items-center gap-6 text-[13px] font-medium">
              <div 
                onClick={() => setView('messages')}
                className="flex items-center gap-1 cursor-pointer hover:text-white/80"
              >
                Messages <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-md min-w-[18px] text-center">0</span>
              </div>
              <div 
                onClick={() => { setListType('likes'); setView('likes'); }}
                className="flex items-center gap-1 cursor-pointer hover:text-white/80"
              >
                Likes <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-md min-w-[18px] text-center">{likesCount}</span>
              </div>
              <div 
                onClick={() => { setListType('views'); setView('views'); }}
                className="flex items-center gap-1 cursor-pointer hover:text-white/80"
              >
                Profils vus <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-md min-w-[18px] text-center">{viewsCount}</span>
              </div>
              <div 
                onClick={() => { setListType('favorites'); setView('favorites'); }}
                className="flex items-center gap-1 cursor-pointer hover:text-white/80"
              >
                Favoris <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-md min-w-[18px] text-center">{favoritesCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={() => setView('subscription')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold shadow-sm transition-all"
              >
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="white" />
                <span className="hidden xs:inline">Premium</span>
              </button>
              <button className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors relative">
                <Bell className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
                <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-2 h-2 bg-red-500 rounded-full border border-orange-500"></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="bg-white border-b border-neutral-200 px-4 py-2 sm:py-3 sticky top-[48px] sm:top-[56px] z-40">
        <div className="max-w-[1600px] mx-auto flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
          <div className="relative shrink-0">
            <button 
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm font-medium hover:bg-neutral-100 transition-all"
            >
              <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Trier
              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
            
            {/* Filter Dropdown */}
            <AnimatePresence>
              {isFilterMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 text-neutral-700 overflow-hidden border border-neutral-200 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    onClick={() => {
                      setIsFilterMenuOpen(false);
                      setIsSimpleFiltersModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 transition-colors"
                  >
                    Filtres simples
                  </button>
                  <button 
                    onClick={() => {
                      setIsFilterMenuOpen(false);
                      setView('advanced-filters');
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 transition-colors"
                  >
                    Filtres avancés
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button 
            onClick={() => setView('correspondance')}
            className="shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm font-medium hover:bg-neutral-100 transition-all text-orange-600"
          >
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-orange-600" />
            Correspondance
          </button>
          <button className="shrink-0 p-1.5 sm:p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all shadow-sm">
            <Heart className="w-[18px] h-[18px] sm:w-5 sm:h-5" fill="white" />
          </button>
        </div>
      </div>

      <SimpleFiltersModal 
        isOpen={isSimpleFiltersModalOpen} 
        onClose={() => setIsSimpleFiltersModalOpen(false)} 
        initialFilters={temporaryFilters}
        onSave={(filters) => {
          setTemporaryFilters(filters);
          setIsSimpleFiltersModalOpen(false);
          toast.success("Filtre temporaire appliqué", {
            description: "Ce filtre sera désactivé à votre prochaine connexion ou en cliquant sur le logo."
          });
        }}
      />

      <main className="max-w-[1600px] mx-auto px-4 py-4 sm:py-6 pb-24 sm:pb-6">
        {view === 'profile' ? (
          <ProfilePage 
            profile={selectedProfile || myProfile} 
            isOwnProfile={!selectedProfile}
            isSubscribed={isSubscribed || freeAccessActive}
            onBack={() => setView('discover')} 
            onLike={() => handleLike(selectedProfile || myProfile)}
            onFavorite={() => handleFavorite(selectedProfile || myProfile)}
            onMessage={() => handleMessage(selectedProfile || myProfile)}
          />
        ) : view === 'chat' ? (
          <ChatPage 
            profile={selectedProfile || myProfile} 
            isSubscribed={isSubscribed || freeAccessActive}
            onBack={() => setView('profile')} 
            onSubscriptionClick={() => setView('subscription')}
            socket={socketRef.current}
          />
        ) : view === 'messages' ? (
          <ConversationsPage 
            onBack={() => setView('discover')} 
            currentUserEmail={myProfile?.email || ''}
            onChatClick={(conv) => {
              setSelectedProfile({
                id: conv.participant_id,
                name: conv.participant_name,
                photo: conv.participant_photo,
                online: conv.online
              });
              setView('chat');
            }}
          />
        ) : view === 'likes' || view === 'views' || view === 'favorites' ? (
          (isSubscribed || freeAccessActive) ? (
            <UserListPage 
              type={view} 
              onBack={() => setView('discover')} 
              currentUserEmail={myProfile?.email || ''}
              onProfileClick={(profile) => {
                setSelectedProfile(profile);
                setView('profile');
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-neutral-200">
              <div className="p-4 bg-orange-100 text-orange-600 rounded-full mb-6">
                <Zap className="w-10 h-10 sm:w-12 sm:h-12" fill="currentColor" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Fonctionnalité Premium</h2>
              <p className="text-neutral-500 text-center max-w-md mb-8">
                Vous devez être abonné pour voir qui vous a liké, qui a visité votre profil ou vos favoris.
              </p>
              <button 
                onClick={() => setView('subscription')}
                className="px-8 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
              >
                Découvrir les offres
              </button>
            </div>
          )
        ) : view === 'advanced-filters' ? (
          <AdvancedFiltersPage 
            onBack={() => setView('discover')} 
            onSave={(filters) => {
              setAdvancedFilters(filters);
              setView('discover');
            }} 
          />
        ) : view === 'edit-profile' ? (
          <EditProfile onBack={() => setView('discover')} onViewProfile={() => setView('profile')} />
        ) : view === 'photos' ? (
          <PhotosPage onBack={() => setView('discover')} />
        ) : view === 'hobbies' ? (
          <HobbiesPage onBack={() => setView('discover')} />
        ) : view === 'personality' ? (
          <PersonalityQuestionsPage onBack={() => setView('discover')} />
        ) : view === 'verify' ? (
          <VerifyProfilePage onBack={() => setView('discover')} />
        ) : view === 'blocked' ? (
          <BlockedUsersPage onBack={() => setView('discover')} />
        ) : view === 'settings' ? (
          <SettingsPage onBack={() => setView('discover')} />
        ) : view === 'help' ? (
          <HelpPage onBack={() => setView('discover')} />
        ) : view === 'subscription' ? (
          <SubscriptionPage onBack={() => setView('discover')} />
        ) : view === 'correspondance' ? (
          <CorrespondencePage 
            onBack={() => setView('discover')} 
            onViewMatches={(criteria) => {
              // Apply criteria as filters
              setAdvancedFilters({
                lookingFor: criteria.looking_for === 'women' ? 'Femmes' : criteria.looking_for === 'men' ? 'Hommes' : 'Les deux',
                ageMin: criteria.age_min || '-',
                ageMax: criteria.age_max || '-',
                country: criteria.country || '',
                state: criteria.state_province || '',
                city: criteria.city || '',
                // Map other fields if needed
                bodyType: ['Pas de préférence'],
                ethnicity: ['Pas de préférence'],
                appearance: ['Pas de préférence'],
                smoking: 'Pas de préférence',
                drinking: 'Pas de préférence',
                relocate: 'Pas de préférence',
                children: 'Pas de préférence',
                income: 'Pas de préférence',
                education: 'Pas de préférence',
                english: 'Pas de préférence',
                french: 'Pas de préférence',
                religion: ['Pas de préférence'],
                zodiac: ['Pas de préférence'],
                relationType: ['Pas de préférence']
              });
              setView('discover');
            }} 
          />
        ) : loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {profiles.map((profile) => (
              <motion.div 
                key={profile.id}
                whileHover={{ y: -4 }}
                onClick={() => handleViewProfile(profile)}
                className="bg-white rounded-xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img 
                    src={profile.photo} 
                    alt={profile.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Badge Vérifié */}
                  {profile.is_verified && (
                    <div className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Vérifié
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                    <div className="flex items-center gap-2 text-white">
                      <h3 className="font-bold text-lg">{profile.name}</h3>
                      {profile.is_verified && <CheckCircle2 className="text-orange-400 w-3.5 h-3.5" />}
                    </div>
                    <div className="text-white/90 text-xs font-medium">
                      {profile.age} • {profile.city || 'Conakry'}, {profile.country || 'Guinée'}
                    </div>
                    <div className="text-orange-400 text-[11px] font-bold mt-1 uppercase tracking-wider">
                      Recherche : {profile.search_type || 'Mariage'}
                    </div>
                  </div>
                  
                  {/* Photo count badge */}
                  <div className="absolute bottom-3 right-3 bg-black/40 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Camera className="w-2.5 h-2.5" />
                    {Math.floor(Math.random() * 5) + 1}
                  </div>
                </div>
                
                <div className="p-3 flex justify-between items-center border-t border-neutral-50">
                  <div className="flex gap-4 text-neutral-400">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(profile);
                      }}
                      className="hover:text-orange-500 transition-colors"
                    >
                      <Heart className="w-[18px] h-[18px]" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMessage(profile);
                      }}
                      className="hover:text-orange-500 transition-colors"
                    >
                      <MessageCircle className="w-[18px] h-[18px]" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavorite(profile);
                      }}
                      className="hover:text-orange-500 transition-colors"
                    >
                      <Star className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-6 py-3 z-50 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => { setView('discover'); setActiveTab('discover'); }}
          className={`flex flex-col items-center gap-1 ${view === 'discover' ? 'text-orange-500' : 'text-neutral-400'}`}
        >
          <HomeIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium">Accueil</span>
        </button>
        <button 
          onClick={() => setView('messages')}
          className={`flex flex-col items-center gap-1 ${view === 'messages' || view === 'chat' ? 'text-orange-500' : 'text-neutral-400'}`}
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </div>
          <span className="text-[10px] font-medium">Messages</span>
        </button>
        <button 
          onClick={() => { setListType('likes'); setView('likes'); }}
          className={`flex flex-col items-center gap-1 ${view === 'likes' ? 'text-orange-500' : 'text-neutral-400'}`}
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            {likesCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full">{likesCount}</span>}
          </div>
          <span className="text-[10px] font-medium">Likes</span>
        </button>
        <button 
          onClick={() => { setListType('views'); setView('views'); }}
          className={`flex flex-col items-center gap-1 ${view === 'views' ? 'text-orange-500' : 'text-neutral-400'}`}
        >
          <div className="relative">
            <Eye className="w-5 h-5" />
            {viewsCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full">{viewsCount}</span>}
          </div>
          <span className="text-[10px] font-medium">Visites</span>
        </button>
        <button 
          onClick={() => { setSelectedProfile(null); setView('profile'); }}
          className={`flex flex-col items-center gap-1 ${view === 'profile' && !selectedProfile ? 'text-orange-500' : 'text-neutral-400'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Profil</span>
        </button>
      </nav>

      {/* Logout Confirmation Dialog */}
      <AnimatePresence>
        {showLogoutConfirmation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Déconnexion</h3>
              <p className="text-neutral-500 mb-8">
                Êtes-vous sûr de vouloir vous déconnecter ?
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setShowLogoutConfirmation(false)}
                  className="flex-1 px-6 py-3 bg-neutral-100 text-neutral-600 font-bold rounded-xl hover:bg-neutral-200 transition-all"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    setShowLogoutConfirmation(false);
                    handleLogout();
                  }}
                  className="flex-1 px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-200"
                >
                  Me déconnecter
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
