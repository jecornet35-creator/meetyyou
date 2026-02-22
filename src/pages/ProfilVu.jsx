import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Check, Trash2 } from 'lucide-react';
import { format, startOfDay, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

const TIME_FILTERS = [
  { value: 'today', label: 'Ce jour' },
  { value: 'week', label: 'Cette semaine' },
  { value: 'all', label: 'Tous' },
];

export default function ProfilVu() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [timeFilter, setTimeFilter] = useState('today');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications-views'],
    queryFn: async () => {
      const currentUser = await base44.auth.me();
      return base44.entities.Notification.filter({ user_email: currentUser.email, type: 'profile_view' }, '-created_date', 200);
    },
    initialData: [],
  });

  useEffect(() => {
    if (!user) return;
    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (event.data?.user_email === user.email && event.data?.type === 'profile_view') {
        queryClient.invalidateQueries({ queryKey: ['notifications-views'] });
      }
    });
    return unsubscribe;
  }, [user, queryClient]);

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications-views'] }),
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications-views'] }),
  });

  const filtered = useMemo(() => {
    const now = new Date();
    if (timeFilter === 'today') {
      const start = startOfDay(now);
      return notifications.filter(n => new Date(n.created_date) >= start);
    } else if (timeFilter === 'week') {
      const start = startOfWeek(now, { locale: fr });
      return notifications.filter(n => new Date(n.created_date) >= start);
    }
    return notifications;
  }, [notifications, timeFilter]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Time filter bar */}
        <div className="flex gap-1 bg-white rounded-xl shadow p-1 mb-6">
          {TIME_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setTimeFilter(f.value)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${
                timeFilter === f.value ? 'bg-amber-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profil Vu</h1>
            {unreadCount > 0 && (
              <p className="text-gray-500 text-sm mt-0.5">{unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Aucune vue de profil</p>
              <p className="text-gray-400 text-sm mt-1">Les visites de votre profil apparaîtront ici</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-amber-50/30' : ''}`}
                >
                  <div className="flex gap-4">
                    {notification.from_profile_photo ? (
                      <img src={notification.from_profile_photo} alt={notification.from_profile_name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-gray-500 bg-gray-50">
                        <Eye className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-gray-900">{notification.title}</p>
                          <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                          <p className="text-gray-400 text-xs mt-2">
                            {format(new Date(notification.created_date), 'PPp', { locale: fr })}
                          </p>
                        </div>
                        {!notification.is_read && <Badge className="bg-amber-500 shrink-0">Nouveau</Badge>}
                      </div>
                      <div className="flex gap-2 mt-3">
                        {notification.link && (
                          <Link to={notification.link}>
                            <Button size="sm" variant="outline" className="text-xs">Voir le profil</Button>
                          </Link>
                        )}
                        {!notification.is_read && (
                          <Button size="sm" variant="ghost" onClick={() => markAsReadMutation.mutate(notification.id)} disabled={markAsReadMutation.isPending} className="text-xs">
                            <Check className="w-3 h-3 mr-1" />Lu
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNotificationMutation.mutate(notification.id)}
                          disabled={deleteNotificationMutation.isPending}
                          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}