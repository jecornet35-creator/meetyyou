import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Star, Trash2 } from 'lucide-react';
import { startOfDay, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

const TIME_FILTERS = [
  { value: 'today', label: 'Ce jour' },
  { value: 'week', label: 'Cette semaine' },
  { value: 'all', label: 'Tous' },
];

export default function Favoris() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [timeFilter, setTimeFilter] = useState('today');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const currentUser = await base44.auth.me();
      return base44.entities.Notification.filter({ user_email: currentUser.email, type: 'favorite' }, '-created_date', 200);
    },
    initialData: [],
  });

  const filtered = useMemo(() => {
    const now = new Date();
    if (timeFilter === 'today') {
      const start = startOfDay(now);
      return favorites.filter(n => new Date(n.created_date) >= start);
    } else if (timeFilter === 'week') {
      const start = startOfWeek(now, { locale: fr });
      return favorites.filter(n => new Date(n.created_date) >= start);
    }
    return favorites;
  }, [favorites, timeFilter]);

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(filtered.map(n => base44.entities.Notification.delete(n.id)));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

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
            <h1 className="text-2xl font-bold text-gray-900">Favoris</h1>
            {filtered.length > 0 && (
              <p className="text-gray-500 text-sm mt-0.5">{filtered.length} favori{filtered.length > 1 ? 's' : ''}</p>
            )}
          </div>
          {filtered.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteAllMutation.mutate()}
              disabled={deleteAllMutation.isPending}
              className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Tout supprimer
            </Button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Aucun favori</p>
              <p className="text-gray-400 text-sm mt-1">Les profils mis en favoris apparaîtront ici</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((notif) => (
                <div key={notif.id} className="p-4 hover:bg-gray-50 transition-colors flex gap-4">
                  {notif.from_profile_photo ? (
                    <img src={notif.from_profile_photo} alt={notif.from_profile_name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-amber-400 font-bold text-lg flex-shrink-0">
                      {notif.from_profile_name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{notif.from_profile_name}</p>
                    <p className="text-gray-500 text-sm">{notif.message}</p>
                    <div className="flex gap-2 mt-3">
                      {notif.from_profile_id && (
                        <Link to={`/ProfileDetail?id=${notif.from_profile_id}`}>
                          <Button size="sm" variant="outline" className="text-xs">Voir le profil</Button>
                        </Link>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteNotificationMutation.mutate(notif.id)}
                        disabled={deleteNotificationMutation.isPending}
                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />Supprimer
                      </Button>
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