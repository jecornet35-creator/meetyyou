import { 
  ArrowLeft, 
  Heart, 
  Eye, 
  Star,
  UserX,
  MessageCircle,
  Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { api } from '../lib/api';
import { toast } from 'sonner';

export default function UserListPage({ type, onBack, onProfileClick, currentUserEmail }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('today'); // 'today', 'week', 'all'
  const socketRef = useRef(null);

  const getTitle = () => {
    switch (type) {
      case 'likes': return 'Likes';
      case 'views': return 'Profil Vu';
      case 'favorites': return 'Favoris';
      default: return 'Liste';
    }
  };

  const getIcon = (size = 20) => {
    const className = `w-${size/4} h-${size/4}`;
    switch (type) {
      case 'likes': return <Heart className={`text-red-500 fill-red-500 ${className}`} />;
      case 'views': return <Eye className={`text-blue-500 ${className}`} />;
      case 'favorites': return <Star className={`text-yellow-500 fill-yellow-500 ${className}`} />;
      default: return <Eye className={className} />;
    }
  };

  const getEmptyMessage = () => {
    switch (type) {
      case 'likes': return 'Aucun like reçu';
      case 'views': return 'Aucune vue de profil';
      case 'favorites': return 'Aucun favori';
      default: return 'Liste vide';
    }
  };

  const getEmptySubMessage = () => {
    switch (type) {
      case 'likes': return 'Les likes de votre profil apparaîtront ici';
      case 'views': return 'Les visites de votre profil apparaîtront ici';
      case 'favorites': return 'Les profils que vous avez mis en favoris apparaîtront ici';
      default: return '';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const collectionMap = {
          'likes': 'notifications',
          'views': 'notifications',
          'favorites': 'notifications'
        };
        
        const data = await api.get(collectionMap[type] || 'notifications');
        
        const typeMap = {
          'likes': 'like',
          'views': 'profile_view',
          'favorites': 'favorite'
        };
        
        let filtered = (data || []).filter(item => 
          item.type === typeMap[type] && 
          item.user_email === (currentUserEmail || 'jlcornet878@gmail.com')
        );
        
        const mappedUsers = filtered.map(item => ({
          id: item.id,
          fromUserName: item.from_profile_name,
          fromUserPhoto: item.from_profile_photo,
          fromUserAge: item.from_profile_age || '?',
          fromUserCity: item.from_profile_city || '',
          timestamp: item.created_date,
          fromUser: {
            id: item.from_profile_id,
            name: item.from_profile_name,
            photo: item.from_profile_photo,
            age: item.from_profile_age,
            city: item.from_profile_city
          }
        }));

        setUsers(mappedUsers);
      } catch (error) {
        console.error("Failed to fetch user list:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const socket = io(window.location.origin);
    socketRef.current = socket;

    socket.on('connect', () => {
      if (currentUserEmail) {
        socket.emit('join', currentUserEmail);
      }
    });

    socket.on('notification', (notification) => {
      const typeMap = {
        'likes': 'like',
        'views': 'profile_view',
        'favorites': 'favorite'
      };

      if (notification.type === typeMap[type]) {
        const newUser = {
          id: notification.id,
          fromUserName: notification.from_profile_name,
          fromUserPhoto: notification.from_profile_photo,
          fromUserAge: notification.from_profile_age || '?',
          fromUserCity: notification.from_profile_city || '',
          timestamp: notification.created_date,
          fromUser: {
            id: notification.from_profile_id,
            name: notification.from_profile_name,
            photo: notification.from_profile_photo,
            age: notification.from_profile_age,
            city: notification.from_profile_city
          }
        };
        setUsers(prev => [newUser, ...prev]);
      }
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [type, currentUserEmail]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      const data = await api.get('notifications');
      const updatedData = (data || []).filter(item => item.id !== id);
      await api.save('notifications', updatedData);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success("Élément supprimé avec succès");
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleClearAll = async () => {
    try {
      const data = await api.get('notifications');
      const typeMap = {
        'likes': 'like',
        'views': 'profile_view',
        'favorites': 'favorite'
      };
      const updatedData = (data || []).filter(item => item.type !== typeMap[type]);
      await api.save('notifications', updatedData);
      setUsers([]);
      toast.success("Liste effacée avec succès");
    } catch (error) {
      console.error("Failed to clear list:", error);
      toast.error("Erreur lors de l'effacement");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8">
      {/* Header with Tabs */}
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-orange-500 shrink-0"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="flex-1">
          <div className="bg-white rounded-xl p-1 flex shadow-sm border border-neutral-200">
            <button 
              onClick={() => setFilter('today')}
              className={`flex-1 py-1.5 sm:py-2 text-[10px] sm:text-sm font-bold rounded-lg transition-all ${filter === 'today' ? 'bg-orange-500 text-white shadow-md' : 'text-neutral-500 hover:bg-neutral-50'}`}
            >
              Ce jour
            </button>
            <button 
              onClick={() => setFilter('week')}
              className={`flex-1 py-1.5 sm:py-2 text-[10px] sm:text-sm font-bold rounded-lg transition-all ${filter === 'week' ? 'bg-orange-500 text-white shadow-md' : 'text-neutral-500 hover:bg-neutral-50'}`}
            >
              Semaine
            </button>
            <button 
              onClick={() => setFilter('all')}
              className={`flex-1 py-1.5 sm:py-2 text-[10px] sm:text-sm font-bold rounded-lg transition-all ${filter === 'all' ? 'bg-orange-500 text-white shadow-md' : 'text-neutral-500 hover:bg-neutral-50'}`}
            >
              Tous
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-neutral-800">{getTitle()}</h1>
          <p className="text-neutral-500 text-[10px] sm:text-sm mt-1">{users.length} nouveaux</p>
        </div>
        {users.length > 0 && (
          <button 
            onClick={handleClearAll}
            className="text-[10px] sm:text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            Effacer
          </button>
        )}
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-neutral-200 overflow-hidden min-h-[300px] sm:min-h-[400px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : users.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {users.map((item) => (
              <div 
                key={item.id} 
                onClick={() => onProfileClick(item.fromUser)}
                className="p-3 sm:p-6 flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="relative shrink-0">
                    <img 
                      src={item.fromUserPhoto || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"} 
                      alt={item.fromUserName} 
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-white p-0.5 sm:p-1 rounded-full shadow-sm">
                      {getIcon(12)}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm sm:text-lg text-neutral-800 group-hover:text-orange-600 transition-colors truncate">
                      {item.fromUserName}
                    </h3>
                    <p className="text-[10px] sm:text-sm text-neutral-500 truncate">
                      {item.fromUserAge} ans • {item.fromUserCity || 'Conakry'}
                    </p>
                    <p className="text-[8px] sm:text-[10px] text-neutral-400 mt-0.5">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 sm:gap-2 shrink-0">
                  <button 
                    onClick={(e) => handleDelete(e, item.id)}
                    className="p-1.5 sm:p-3 rounded-full bg-neutral-50 text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-all"
                    title="Supprimer"
                  >
                    <Trash2 className="w-[14px] h-[14px] sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 sm:p-12">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-neutral-50 rounded-full flex items-center justify-center mb-4 sm:mb-6 text-neutral-200">
              {getIcon(32)}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 mb-2">
              {getEmptyMessage()}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xs mx-auto">
              {getEmptySubMessage()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
