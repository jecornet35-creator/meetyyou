import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Star, Eye, Users, Check, Trash2 } from 'lucide-react';
import { format, startOfDay, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

const iconMap = {
  like: { icon: Heart, color: 'text-red-500 bg-red-50' },
  message: { icon: MessageCircle, color: 'text-blue-500 bg-blue-50' },
  match: { icon: Users, color: 'text-purple-500 bg-purple-50' },
  profile_view: { icon: Eye, color: 'text-gray-500 bg-gray-50' },
  favorite: { icon: Star, color: 'text-amber-500 bg-amber-50' },
};

const TIME_FILTERS = [
  { value: 'today', label: 'Ce jour' },
  { value: 'week', label: 'Cette semaine' },
  { value: 'all', label: 'Tous' },
];

function NotificationList({ notifications, type, deleteNotificationMutation, markAsReadMutation }) {
  const [timeFilter, setTimeFilter] = useState('today');

  const filtered = useMemo(() => {
    const now = new Date();
    let list = notifications.filter(n => n.type === type);
    if (timeFilter === 'today') {
      const start = startOfDay(now);
      list = list.filter(n => new Date(n.created_date) >= start);
    } else if (timeFilter === 'week') {
      const start = startOfWeek(now, { locale: fr });
      list = list.filter(n => new Date(n.created_date) >= start);
    }
    return list;
  }, [notifications, type, timeFilter]);

  const emptyIcon = type === 'profile_view' ? <Eye className="w-8 h-8 text-gray-400" /> : <Heart className="w-8 h-8 text-gray-400" />;

  return (
    <>
      {/* Time filter bar */}
      <div className="flex gap-2 p-4 border-b bg-gray-50">
        {TIME_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setTimeFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              timeFilter === f.value
                ? 'bg-amber-500 text-white shadow'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {emptyIcon}
          </div>
          <p className="text-gray-500 text-lg">Aucune notification</p>
          <p className="text-gray-400 text-sm mt-1">Vos notifications apparaîtront ici</p>
        </div>
      ) : (
        <div className="divide-y">
          {filtered.map((notification) => {
            const iconConfig = iconMap[notification.type] || iconMap.message;
            const Icon = iconConfig.icon;
            return (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-amber-50/30' : ''}`}
              >
                <div className="flex gap-4">
                  {notification.from_profile_photo ? (
                    <img src={notification.from_profile_photo} alt={notification.from_profile_name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconConfig.color}`}>
                      <Icon className="w-6 h-6" />
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
                          <Button size="sm" variant="outline" className="text-xs">Voir</Button>
                        </Link>
                      )}
                      {!notification.is_read && (
                        <Button size="sm" variant="ghost" onClick={() => markAsReadMutation.mutate(notification.id)} disabled={markAsReadMutation.isPending} className="text-xs">
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
    </>
  );
}

export default function Notifications() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  // Read ?tab= from URL: 'views' | 'likes' | undefined (general)
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'general');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const currentUser = await base44.auth.me();
      return base44.entities.Notification.filter({ user_email: currentUser.email }, '-created_date', 200);
    },
    initialData: [],
  });

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const generalNotifications = notifications.filter(n => n.type !== 'profile_view' && n.type !== 'like');
  const unreadCount = generalNotifications.filter(n => !n.is_read).length;

  const tabs = [
    { id: 'general', label: 'Notifications' },
    { id: 'views', label: 'Profil Vu' },
    { id: 'likes', label: 'Likes' },
  ];

  const timeFilters = [
    { value: 'today', label: 'Ce jour' },
    { value: 'week', label: 'Cette semaine' },
    { value: 'all', label: 'Tous' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Tab bar: shown only on general tab */}
        {activeTab === 'general' && (
          <div className="flex gap-1 bg-white rounded-xl shadow p-1 mb-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === tab.id ? 'bg-amber-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'general' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                {unreadCount > 0 && (
                  <p className="text-gray-500 text-sm mt-0.5">
                    {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                  </p>
                )}
              </div>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={() => markAllAsReadMutation.mutate()} disabled={markAllAsReadMutation.isPending} className="gap-2">
                  <Check className="w-4 h-4" />
                  Tout marquer comme lu
                </Button>
              )}
            </div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">Chargement...</div>
              ) : generalNotifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">Aucune notification</p>
                  <p className="text-gray-400 text-sm mt-1">Vos notifications apparaîtront ici</p>
                </div>
              ) : (
                <div className="divide-y">
                  {generalNotifications.map((notification) => {
                    const iconConfig = iconMap[notification.type] || iconMap.message;
                    const Icon = iconConfig.icon;
                    return (
                      <div key={notification.id} className={`p-4 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-amber-50/30' : ''}`}>
                        <div className="flex gap-4">
                          {notification.from_profile_photo ? (
                            <img src={notification.from_profile_photo} alt={notification.from_profile_name} className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconConfig.color}`}>
                              <Icon className="w-6 h-6" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium text-gray-900">{notification.title}</p>
                                <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                                <p className="text-gray-400 text-xs mt-2">{format(new Date(notification.created_date), 'PPp', { locale: fr })}</p>
                              </div>
                              {!notification.is_read && <Badge className="bg-amber-500 shrink-0">Nouveau</Badge>}
                            </div>
                            <div className="flex gap-2 mt-3">
                              {notification.link && (
                                <Link to={notification.link}><Button size="sm" variant="outline" className="text-xs">Voir</Button></Link>
                              )}
                              {!notification.is_read && (
                                <Button size="sm" variant="ghost" onClick={() => markAsReadMutation.mutate(notification.id)} disabled={markAsReadMutation.isPending} className="text-xs">
                                  <Check className="w-3 h-3 mr-1" />Marquer comme lu
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" onClick={() => deleteNotificationMutation.mutate(notification.id)} disabled={deleteNotificationMutation.isPending} className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="w-3 h-3 mr-1" />Supprimer
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
          </>
        )}

        {(activeTab === 'views' || activeTab === 'likes') && (
          <>
            {/* Filter bar replaces tab bar */}
            <div className="flex gap-1 bg-white rounded-xl shadow p-1 mb-6">
              {timeFilters.map(f => (
                <button
                  key={f.value}
                  onClick={() => {/* handled inside NotificationList */}}
                  className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold text-gray-400 cursor-default"
                >
                  {f.label}
                </button>
              ))}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {activeTab === 'views' ? 'Profil Vu' : 'Likes'}
            </h1>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <NotificationList
                notifications={notifications}
                type={activeTab === 'views' ? 'profile_view' : 'like'}
                deleteNotificationMutation={deleteNotificationMutation}
                markAsReadMutation={markAsReadMutation}
              />
            </div>
            <button onClick={() => setActiveTab('general')} className="mt-4 text-sm text-amber-600 hover:underline">
              ← Retour aux notifications
            </button>
          </>
        )}
      </main>
    </div>
  );
}