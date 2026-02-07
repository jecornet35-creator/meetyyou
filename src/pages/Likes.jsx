import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Header from '@/components/layout/Header';
import ProfileCard from '@/components/profiles/ProfileCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function Likes() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week'
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(async (user) => {
      setCurrentUser(user);
      const profiles = await base44.entities.Profile.filter({ created_by: user.email });
      if (profiles[0]) {
        setUserProfile(profiles[0]);
      }
    });
  }, []);

  const { data: likes = [], isLoading } = useQuery({
    queryKey: ['likes', userProfile?.id],
    queryFn: async () => {
      if (!userProfile) return [];
      const likesData = await base44.entities.Like.filter({ 
        liked_profile_id: userProfile.id 
      });
      return likesData.sort((a, b) => new Date(b.liked_at || b.created_date) - new Date(a.liked_at || a.created_date));
    },
    enabled: !!userProfile,
  });

  const { data: likerProfiles = [] } = useQuery({
    queryKey: ['likerProfiles', likes],
    queryFn: async () => {
      if (!likes.length) return [];
      const profileIds = [...new Set(likes.map(l => l.liker_profile_id))];
      const profiles = await Promise.all(
        profileIds.map(id => base44.entities.Profile.filter({ id }))
      );
      return profiles.flat();
    },
    enabled: likes.length > 0,
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      for (const like of likes) {
        await base44.entities.Like.delete(like.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['likes'] });
      toast.success('Historique supprimé');
      setShowDeleteDialog(false);
    },
  });

  const filterByDate = (likesData) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return likesData.filter(like => {
      const likeDate = new Date(like.liked_at || like.created_date);
      if (dateFilter === 'today') {
        return likeDate >= today;
      } else if (dateFilter === 'week') {
        return likeDate >= weekAgo;
      }
      return true;
    });
  };

  const filteredLikes = filterByDate(likes);
  const displayProfiles = filteredLikes.map(like => {
    return likerProfiles.find(p => p.id === like.liker_profile_id);
  }).filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header user={userProfile} />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Likes Reçus ({filteredLikes.length})
            </h1>
            {likes.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer l'historique
              </Button>
            )}
          </div>

          {/* Filtres */}
          <div className="flex gap-2">
            <Button
              variant={dateFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateFilter('all')}
              className={dateFilter === 'all' ? 'bg-amber-500 hover:bg-amber-600' : ''}
            >
              Tous
            </Button>
            <Button
              variant={dateFilter === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateFilter('today')}
              className={dateFilter === 'today' ? 'bg-amber-500 hover:bg-amber-600' : ''}
            >
              Ce jour
            </Button>
            <Button
              variant={dateFilter === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateFilter('week')}
              className={dateFilter === 'week' ? 'bg-amber-500 hover:bg-amber-600' : ''}
            >
              Cette semaine
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array(15).fill(0).map((_, i) => (
              <Skeleton key={i} className="rounded-lg h-80" />
            ))}
          </div>
        ) : displayProfiles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              {dateFilter === 'all' 
                ? 'Aucun like reçu pour le moment.' 
                : dateFilter === 'today'
                ? 'Aucun like reçu aujourd\'hui.'
                : 'Aucun like reçu cette semaine.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayProfiles.map((profile) => (
              <ProfileCard 
                key={profile.id} 
                profile={profile}
              />
            ))}
          </div>
        )}
      </main>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'historique ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer tout l'historique des likes reçus ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAllMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}