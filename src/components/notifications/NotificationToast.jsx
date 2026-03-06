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
          
          // Auto-remove after `duration` ms
          setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== event.id));
          }, duration);
        }
        
        queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] });
      }
    });

    return unsubscribe;
  }, [currentUser, preferences, queryClient]);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Show only the latest toast at bottom
  const latestToast = toasts[toasts.length - 1];

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      <AnimatePresence>
        {latestToast && (
          <motion.div
            key={latestToast.id}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="pointer-events-auto w-full max-w-lg bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            <Link
              to={latestToast.link || '#'}
              onClick={() => removeToast(latestToast.id)}
              className="flex items-center gap-3 px-4 py-3"
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {latestToast.from_profile_photo ? (
                  <img
                    src={latestToast.from_profile_photo}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorMap[latestToast.type] || 'bg-gray-400'}`}>
                    {React.createElement(iconMap[latestToast.type] || MessageCircle, { className: 'w-5 h-5 text-white' })}
                  </div>
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 leading-tight">{latestToast.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-snug">{latestToast.message}</p>
              </div>

              {/* Icon */}
              <div className="flex-shrink-0 flex items-center gap-2">
                {latestToast.type === 'like' && (
                  <Heart className="w-5 h-5 text-red-400" />
                )}
                {latestToast.type === 'favorite' && (
                  <Star className="w-5 h-5 text-amber-400" />
                )}
                <button
                  onClick={(e) => { e.preventDefault(); removeToast(latestToast.id); }}
                  className="text-gray-300 hover:text-gray-500 ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </Link>

            {/* Progress bar */}
            <motion.div
              className={`h-0.5 ${colorMap[latestToast.type] || 'bg-gray-400'}`}
              initial={{ scaleX: 1, originX: 0 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}