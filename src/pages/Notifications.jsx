import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Star, Eye, Users, Check, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const iconMap = {
  like: { icon: Heart, color: 'text-red-500 bg-red-50' },
  message: { icon: MessageCircle, color: 'text-blue-500 bg-blue-50' },
  match: { icon: Users, color: 'text-purple-500 bg-purple-50' },
  profile_view: { icon: Eye, color: 'text-gray-500 bg-gray-50' },
  favorite: { icon: Star, color: 'text-amber-500 bg-amber-50' },
};

export default function Notifications() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const currentUser = await base44.auth.me();
      return base44.entities.Notification.filter(
        { user_email: currentUser.email },
        '-created_date',
        100
      );
    },
    initialData: [],
  });

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (event.type === 'create' && event.data.user_email === user.email) {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }
    });

    return unsubscribe;
  }, [user, queryClient]);

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      await Promise.all(
        unreadNotifications.map(n => base44.entities.Notification.update(n.id, { is_read: true }))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-gray-500 mt-1">
                Vous avez {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="gap-2"
            >
              <Check className="w-4 h-4" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              Chargement...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Aucune notification</p>
              <p className="text-gray-400 text-sm mt-1">
                Vos notifications apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const iconConfig = iconMap[notification.type] || iconMap.message;
                const Icon = iconConfig.icon;

                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.is_read ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Profile photo */}
                      {notification.from_profile_photo ? (
                        <img
                          src={notification.from_profile_photo}
                          alt={notification.from_profile_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconConfig.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-gray-600 text-sm mt-1">
                              {notification.message}
                            </p>
                            <p className="text-gray-400 text-xs mt-2">
                              {format(new Date(notification.created_date), 'PPp', { locale: fr })}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <Badge className="bg-amber-500 shrink-0">Nouveau</Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                          {notification.link && (
                            <Link to={notification.link}>
                              <Button size="sm" variant="outline" className="text-xs">
                                Voir
                              </Button>
                            </Link>
                          )}
                          {!notification.is_read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsReadMutation.mutate(notification.id)}
                              disabled={markAsReadMutation.isPending}
                              className="text-xs"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Marquer comme lu
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotificationMutation.mutate(notification.id)}
                            disabled={deleteNotificationMutation.isPending}
                            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}