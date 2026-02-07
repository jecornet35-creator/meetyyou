import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { X, MessageCircle, Heart, Eye, Star, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const iconMap = {
  message: MessageCircle,
  like: Heart,
  profile_view: Eye,
  favorite: Star,
  match: UserCheck,
};

const colorMap = {
  message: 'bg-blue-500',
  like: 'bg-red-500',
  profile_view: 'bg-purple-500',
  favorite: 'bg-amber-500',
  match: 'bg-green-500',
};

export default function NotificationToast() {
  const [toasts, setToasts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  // Load preferences
  useEffect(() => {
    if (!currentUser) return;
    
    base44.entities.NotificationPreferences.filter({ created_by: currentUser.email })
      .then(prefs => {
        if (prefs[0]) setPreferences(prefs[0]);
        else setPreferences({ push_enabled: true, new_messages: true, new_matches: true, profile_views: true, likes: true, favorites: true });
      })
      .catch(() => {});
  }, [currentUser]);

  // Subscribe to new notifications
  useEffect(() => {
    if (!currentUser || !preferences?.push_enabled) return;

    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (event.type === 'create' && event.data.user_email === currentUser.email && !event.data.is_read) {
        // Check if this notification type is enabled
        const typeMap = {
          message: preferences.new_messages,
          like: preferences.likes,
          profile_view: preferences.profile_views,
          favorite: preferences.favorites,
          match: preferences.new_matches,
        };
        
        if (typeMap[event.data.type] !== false) {
          // Check quiet hours
          if (preferences.quiet_hours_enabled) {
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const start = preferences.quiet_hours_start || '22:00';
            const end = preferences.quiet_hours_end || '08:00';
            
            if (start > end) {
              if (currentTime >= start || currentTime <= end) return;
            } else {
              if (currentTime >= start && currentTime <= end) return;
            }
          }

          setToasts(prev => [...prev, { ...event.data, id: event.id, timestamp: Date.now() }]);
          
          // Auto-remove after 5 seconds
          setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== event.id));
          }, 5000);
        }
        
        queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] });
      }
    });

    return unsubscribe;
  }, [currentUser, preferences, queryClient]);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 space-y-2 max-w-md">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type] || MessageCircle;
          
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800 text-white rounded-lg shadow-2xl overflow-hidden cursor-pointer hover:bg-gray-750 transition-colors"
              onClick={() => {
                if (toast.link) {
                  window.location.href = toast.link;
                  removeToast(toast.id);
                }
              }}
            >
              <div className="flex items-center gap-3 p-4">
                {/* Photo de profil */}
                {toast.from_profile_photo ? (
                  <img 
                    src={toast.from_profile_photo} 
                    alt="" 
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-700 flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                
                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">
                    {toast.type === 'like' && 'Like Received'}
                    {toast.type === 'profile_view' && 'Profile View'}
                    {toast.type === 'message' && 'New Message'}
                    {toast.type === 'favorite' && 'New Favorite'}
                    {toast.type === 'match' && 'New Match'}
                  </p>
                  <p className="text-sm text-gray-300 mt-0.5">
                    {toast.message}
                  </p>
                  {toast.link && (
                    <p className="text-xs text-blue-400 mt-1 hover:text-blue-300">
                      {toast.type === 'like' && `View ${toast.from_profile_name?.split(' ')[0]}'s profile.`}
                      {toast.type === 'profile_view' && `View ${toast.from_profile_name?.split(' ')[0]}'s profile.`}
                      {toast.type === 'message' && 'Read message.'}
                      {toast.type === 'favorite' && `View ${toast.from_profile_name?.split(' ')[0]}'s profile.`}
                      {toast.type === 'match' && 'Start conversation.'}
                    </p>
                  )}
                </div>

                {/* Icône de type */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={`p-2 rounded-full ${
                    toast.type === 'like' ? 'bg-red-500/20' : 
                    toast.type === 'profile_view' ? 'bg-purple-500/20' :
                    toast.type === 'message' ? 'bg-blue-500/20' :
                    toast.type === 'favorite' ? 'bg-amber-500/20' :
                    'bg-green-500/20'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      toast.type === 'like' ? 'text-red-400 fill-red-400' : 
                      toast.type === 'profile_view' ? 'text-purple-400' :
                      toast.type === 'message' ? 'text-blue-400' :
                      toast.type === 'favorite' ? 'text-amber-400 fill-amber-400' :
                      'text-green-400'
                    }`} />
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeToast(toast.id);
                    }} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}