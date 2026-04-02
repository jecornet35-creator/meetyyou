import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  MoreVertical, 
  MapPin,
  CheckCircle2,
  User,
  Trash2,
  Eye,
  Ban,
  MessageSquare,
  X,
  Calendar,
  Globe,
  Info,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { api } from '../lib/api';

export default function UserManagement({ onMessageUser }) {
  const [filter, setFilter] = useState('Tous');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get('profiles');
      if (data) {
        setUsers(data.map((u: any) => ({
          ...u,
          status: u.is_online ? 'En ligne' : 'Hors ligne',
          statusColor: u.is_online ? 'bg-blue-100 text-blue-600' : 'bg-neutral-100 text-neutral-600',
          registered: u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : 'N/A',
          lastSeen: u.is_online ? 'Maintenant' : 'N/A'
        })));
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (action: string, user: any) => {
    setOpenMenuId(null);
    switch (action) {
      case 'delete':
        if (window.confirm(`Voulez-vous vraiment supprimer l'utilisateur ${user.name} ? Cette action est irréversible.`)) {
          try {
            await api.deleteUser(user.id);
            toast.success(`Utilisateur ${user.name} supprimé avec succès`);
            fetchUsers(); // Refresh list
          } catch (error) {
            console.error("Failed to delete user:", error);
            toast.error("Erreur lors de la suppression de l'utilisateur");
          }
        }
        break;
      case 'ban':
        const isBanning = !user.is_banned;
        if (window.confirm(`Voulez-vous vraiment ${isBanning ? 'bannir' : 'débannir'} l'utilisateur ${user.name} ?`)) {
          try {
            await api.banUser(user.id, isBanning);
            toast.success(`Utilisateur ${user.name} ${isBanning ? 'banni' : 'débanni'} avec succès`);
            fetchUsers();
          } catch (error) {
            console.error("Failed to ban/unban user:", error);
            toast.error("Erreur lors du changement de statut");
          }
        }
        break;
      case 'view':
        setSelectedUser(user);
        setIsProfileModalOpen(true);
        break;
      case 'message':
        if (onMessageUser) {
          onMessageUser(user);
        } else {
          toast.info(`Envoyer un message à ${user.name}`);
        }
        break;
    }
  };

  const filteredUsers = users.filter(u => {
    if (filter === 'Tous') return !u.is_banned;
    if (filter === 'Vérifiés') return u.is_verified && !u.is_banned;
    if (filter === 'Non vérifiés') return !u.is_verified && !u.is_banned;
    if (filter === 'En ligne') return u.is_online && !u.is_banned;
    if (filter === 'Bannis') return u.is_banned;
    return true;
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8"
    >
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Gestion des utilisateurs</h1>
          <p className="text-neutral-500">{users.length} utilisateurs au total</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] text-white rounded-lg hover:bg-neutral-800 transition-colors">
          <Download className="w-[18px] h-[18px]" />
          <span className="font-medium">Exporter</span>
        </button>
      </header>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-[18px] h-[18px]" />
          <input 
            type="text" 
            placeholder="Rechercher par nom, ville..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['Tous', 'Vérifiés', 'Non vérifiés', 'En ligne', 'Bannis'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-orange-500 text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100">
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Localisation</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Inscription</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Dernière connexion</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-400">Chargement...</td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.photo} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-full object-cover border border-neutral-100"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-neutral-900">{user.name}</p>
                          {user.is_banned && (
                            <span className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Banni</span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500">
                          {user.gender}{user.gender && ', '}{user.age} ans
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-neutral-900 font-medium">{user.city}</p>
                      <p className="text-xs text-neutral-500">{user.country}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.is_banned ? 'bg-red-100 text-red-600' : user.statusColor}`}>
                      {user.is_banned ? 'Banni' : user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {user.registered}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {user.lastSeen}
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                      className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors"
                    >
                      <MoreVertical className="w-[18px] h-[18px]" />
                    </button>

                    <AnimatePresence>
                      {openMenuId === user.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setOpenMenuId(null)}
                          />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-6 top-12 w-48 bg-white rounded-xl shadow-xl border border-neutral-100 z-20 py-2 overflow-hidden"
                          >
                            <button 
                              onClick={() => handleAction('view', user)}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
                            >
                              <Eye className="text-blue-500 w-4 h-4" />
                              Voir profil
                            </button>
                            <button 
                              onClick={() => handleAction('message', user)}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
                            >
                              <MessageSquare className="text-emerald-500 w-4 h-4" />
                              Message
                            </button>
                            <div className="h-px bg-neutral-100 my-1" />
                            <button 
                              onClick={() => handleAction('ban', user)}
                              className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${user.is_banned ? 'text-emerald-600 hover:bg-emerald-50' : 'text-orange-600 hover:bg-orange-50'}`}
                            >
                              <Ban className="w-4 h-4" />
                              {user.is_banned ? 'Débannir' : 'Bannir'}
                            </button>
                            <button 
                              onClick={() => handleAction('delete', user)}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Supprimer
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Detail Modal */}
      <AnimatePresence>
        {isProfileModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-xl">
                    <User className="text-orange-600 w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900">Détails du profil</h3>
                </div>
                <button 
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-2 hover:bg-neutral-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="flex flex-col md:flex-row gap-8 mb-8">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg shrink-0">
                    <img 
                      src={selectedUser.photo} 
                      alt={selectedUser.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-1">{selectedUser.profile_title || 'Sans titre'}</h2>
                    <p className="text-neutral-500 mb-4">{selectedUser.gender}, {selectedUser.age} ans</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <User className="text-orange-500 w-4 h-4" />
                        <span className="font-medium">Prénom:</span> {selectedUser.first_name || selectedUser.name}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Eye className="text-orange-500 w-4 h-4" />
                        <span className="font-medium">Nom d'affichage:</span> {selectedUser.display_name || selectedUser.name}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <User className="text-orange-500 w-4 h-4" />
                        <span className="font-medium">Je suis:</span> {selectedUser.gender || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Calendar className="text-orange-500 w-4 h-4" />
                        <span className="font-medium">Date de naissance:</span> {selectedUser.birth_date || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
                    <h4 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                      <Globe className="text-orange-500 w-[18px] h-[18px]" />
                      Localisation
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] text-neutral-400 uppercase font-bold mb-1">Pays</p>
                        <p className="text-sm font-medium text-neutral-700">{selectedUser.country || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-400 uppercase font-bold mb-1">État / Région</p>
                        <p className="text-sm font-medium text-neutral-700">{selectedUser.state || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-400 uppercase font-bold mb-1">Ville</p>
                        <p className="text-sm font-medium text-neutral-700">{selectedUser.city || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-neutral-900 mb-2 flex items-center gap-2">
                      <Info className="text-orange-500 w-[18px] h-[18px]" />
                      A glimpse of yourself
                    </h4>
                    <p className="text-sm text-neutral-600 leading-relaxed bg-white p-4 rounded-xl border border-neutral-100 italic">
                      "{selectedUser.bio || 'Aucune description fournie.'}"
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-neutral-900 mb-2 flex items-center gap-2">
                      <Heart className="text-orange-500 w-[18px] h-[18px]" />
                      What you are looking for in partner
                    </h4>
                    <p className="text-sm text-neutral-600 leading-relaxed bg-white p-4 rounded-xl border border-neutral-100 italic">
                      "{selectedUser.looking_for_partner || 'Non spécifié.'}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-neutral-100 bg-neutral-50 flex justify-end gap-3">
                <button 
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-6 py-2 text-sm font-bold text-neutral-500 hover:bg-neutral-200 rounded-xl transition-all"
                >
                  Fermer
                </button>
                <button 
                  onClick={() => {
                    toast.info(`Action de message pour ${selectedUser.name}`);
                    setIsProfileModalOpen(false);
                  }}
                  className="px-6 py-2 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-100"
                >
                  Contacter
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
