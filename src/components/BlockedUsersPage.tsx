import { 
  ArrowLeft, 
  Shield, 
  UserX,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { toast } from 'sonner';

export default function BlockedUsersPage({ onBack }) {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlockedUsers = async () => {
    try {
      const data = await api.get('block_list');
      setBlockedUsers(data || []);
    } catch (error) {
      console.error("Failed to fetch blocked users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const handleUnblock = async (userId) => {
    if (window.confirm("Voulez-vous vraiment débloquer cet utilisateur ?")) {
      try {
        const updatedList = blockedUsers.filter(u => u.blockedUserId !== userId);
        await api.save('block_list', updatedList);
        setBlockedUsers(updatedList);
        toast.success("Utilisateur débloqué");
      } catch (error) {
        toast.error("Erreur lors du déblocage");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-orange-500"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 text-neutral-800">
          <Shield className="w-6 h-6 text-orange-500" />
          <h1 className="text-2xl font-bold">Utilisateurs bloqués</h1>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        {/* Description Header */}
        <div className="p-8 border-b border-neutral-100 bg-neutral-50/30">
          <p className="text-neutral-500 text-sm leading-relaxed">
            Les utilisateurs bloqués ne peuvent pas vous envoyer de messages ni voir votre profil. 
            Vous avez bloqué <span className="font-bold text-neutral-800">{blockedUsers.length}</span> utilisateur(s).
          </p>
        </div>

        {loading ? (
          <div className="p-20 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : blockedUsers.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {blockedUsers.map((user) => (
              <div key={user.id} className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-4">
                  <img 
                    src={user.blockedUserPhoto} 
                    alt={user.blockedUserName} 
                    className="w-12 h-12 rounded-full object-cover border border-neutral-200"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="font-bold text-neutral-800">{user.blockedUserName}</h3>
                    <p className="text-xs text-neutral-400">Bloqué le {new Date(user.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleUnblock(user.blockedUserId)}
                  className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                  Débloquer
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mb-6 text-neutral-300">
              <UserX className="w-12 h-12" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-medium text-neutral-400">
              Vous n'avez bloqué aucun utilisateur.
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
