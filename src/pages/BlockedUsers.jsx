import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Shield, ShieldOff, ArrowLeft, UserX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function BlockedUsers() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: blockedList = [], isLoading } = useQuery({
    queryKey: ['blockedUsers'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.BlockedUser.filter({ blocker_email: user.email });
    },
  });

  const unblockMutation = useMutation({
    mutationFn: (id) => base44.entities.BlockedUser.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
      toast.success('Utilisateur débloqué');
    },
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to={createPageUrl('Home')} className="text-white/70 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Shield className="w-5 h-5" />
          <h1 className="text-lg font-semibold">Utilisateurs bloqués</h1>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <p className="text-gray-500 text-sm">
              Les utilisateurs bloqués ne peuvent pas vous envoyer de messages ni voir votre profil.
              Vous avez bloqué <strong>{blockedList.length}</strong> utilisateur(s).
            </p>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Chargement...</div>
          ) : blockedList.length === 0 ? (
            <div className="p-12 text-center">
              <UserX className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Vous n'avez bloqué aucun utilisateur.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {blockedList.map((entry) => (
                <li key={entry.id} className="flex items-center gap-4 px-6 py-4">
                  <img
                    src={entry.blocked_photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
                    alt={entry.blocked_display_name}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{entry.blocked_display_name || 'Utilisateur'}</p>
                    <p className="text-xs text-gray-400">{entry.blocked_email}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => unblockMutation.mutate(entry.id)}
                    disabled={unblockMutation.isPending}
                  >
                    <ShieldOff className="w-4 h-4" />
                    Débloquer
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}