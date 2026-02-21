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

export default function NotificationToast({ duration = 5000 }) {
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
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type] || MessageCircle;
          const bgColor = colorMap[toast.type] || 'bg-gray-500';
          
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl border overflow-hidden"
            >
              <div className="flex items-start gap-3 p-4">
                <div className={`${bgColor} p-2 rounded-full`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{toast.title}</p>
                  <p className="text-gray-600 text-xs mt-1 truncate">{toast.message}</p>
                  {toast.from_profile_name && (
                    <div className="flex items-center gap-2 mt-2">
                      {toast.from_profile_photo && (
                        <img src={toast.from_profile_photo} alt="" className="w-6 h-6 rounded-full object-cover" />
                      )}
                      <span className="text-xs text-gray-500">{toast.from_profile_name}</span>
                    </div>
                  )}
                </div>
                <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {toast.link && (
                <Link 
                  to={toast.link}
                  onClick={() => removeToast(toast.id)}
                  className="block px-4 py-2 bg-gray-50 text-amber-600 text-xs font-medium hover:bg-gray-100"
                >
                  Voir →
                </Link>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}