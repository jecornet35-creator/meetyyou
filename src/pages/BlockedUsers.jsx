import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserX, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
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

export default function BlockedUsers() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userToUnblock, setUserToUnblock] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: blockedUsers = [], isLoading } = useQuery({
    queryKey: ['blockedUsers', currentUser?.email],
    queryFn: async () => {
      if (!currentUser) return [];
      return base44.entities.BlockedUser.filter({ blocker_email: currentUser.email }, '-created_date');
    },
    enabled: !!currentUser,
  });

  const unblockMutation = useMutation({
    mutationFn: async (blockId) => {
      await base44.entities.BlockedUser.delete(blockId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
      toast.success('Utilisateur débloqué');
      setUserToUnblock(null);
    },
  });

  if (!currentUser) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Utilisateurs bloqués</h1>
          <p className="text-gray-600">Gérez votre liste d'utilisateurs bloqués</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : blockedUsers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <UserX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur bloqué</h3>
            <p className="text-gray-600">Vous n'avez bloqué aucun utilisateur pour le moment.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm divide-y">
            {blockedUsers.map((blocked) => (
              <div key={blocked.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{blocked.blocked_user_name || blocked.blocked_email}</h3>
                  <p className="text-sm text-gray-600 mt-1">{blocked.blocked_email}</p>
                  {blocked.reason && (
                    <p className="text-xs text-gray-500 mt-2 italic">Raison: {blocked.reason}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Bloqué le {new Date(blocked.created_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setUserToUnblock(blocked)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Débloquer
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">À propos du blocage</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>Les utilisateurs bloqués ne peuvent plus vous envoyer de messages</li>
                <li>Ils ne peuvent plus voir votre profil</li>
                <li>Vous ne verrez plus leurs profils dans les résultats de recherche</li>
                <li>Le blocage est réversible à tout moment</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Unblock confirmation dialog */}
      <AlertDialog open={!!userToUnblock} onOpenChange={() => setUserToUnblock(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Débloquer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir débloquer <strong>{userToUnblock?.blocked_user_name || userToUnblock?.blocked_email}</strong> ?
              Cette personne pourra à nouveau interagir avec vous.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => unblockMutation.mutate(userToUnblock.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Débloquer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}