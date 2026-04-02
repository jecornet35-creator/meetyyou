import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Shield, 
  Check, 
  X, 
  Users, 
  Search, 
  UserPlus,
  MoreVertical,
  Trash2,
  Edit2,
  Mail,
  User,
  Plus,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { toast } from 'sonner';

const adminPermissions = [
  "Gérer les utilisateurs (bannir, suspendre, supprimer)",
  "Gérer les abonnements et paiements",
  "Accéder aux statistiques complètes",
  "Gérer les admins et modérateurs",
  "Configurer le site",
  "Accès aux logs de sécurité",
  "Modérer les contenus",
  "Gérer les tickets support"
];

const moderatorPermissions = [
  "Voir la liste des utilisateurs",
  "Traiter les signalements",
  "Modérer les photos",
  "Répondre aux tickets support",
  "Vérifier les profils"
];

const moderatorRestricted = [
  "Gestion des abonnements/paiements",
  "Gestion des admins",
  "Configuration du site",
  "Logs de sécurité",
  "Suppression de comptes"
];

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'moderator'
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const data = await api.get('admins');
      setAdmins(data || []);
    } catch (error) {
      console.error("Failed to fetch admins:", error);
      toast.error("Erreur lors du chargement des administrateurs");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (admin = null) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({
        name: admin.name,
        email: admin.email,
        role: admin.role
      });
    } else {
      setEditingAdmin(null);
      setFormData({
        name: '',
        email: '',
        role: 'moderator'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const data = await api.get('admins');
      let updatedData;
      
      if (editingAdmin) {
        updatedData = data.map(a => a.id === editingAdmin.id ? { ...a, ...formData } : a);
        toast.success("Administrateur mis à jour");
      } else {
        const newAdmin = {
          id: Date.now(),
          ...formData,
          created_at: new Date().toISOString()
        };
        updatedData = [...(data || []), newAdmin];
        toast.success("Nouvel administrateur ajouté");
      }
      
      await api.save('admins', updatedData);
      setAdmins(updatedData);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save admin:", error);
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id) => {
    if (id === 1) { // Prevent deleting the main admin
      toast.error("Vous ne pouvez pas supprimer l'administrateur principal");
      return;
    }
    
    if (!window.confirm("Voulez-vous vraiment supprimer cet administrateur ?")) return;
    
    try {
      const data = await api.get('admins');
      const updatedData = data.filter(a => a.id !== id);
      await api.save('admins', updatedData);
      setAdmins(updatedData);
      toast.success("Administrateur supprimé");
    } catch (error) {
      console.error("Failed to delete admin:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const filteredAdmins = admins.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8"
    >
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Gestion des Admins & Modérateurs</h1>
        <p className="text-neutral-500">Gérez les accès et permissions de votre équipe</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Admin Role Card */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-50 text-red-500 rounded-xl">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900">Administrateur</h3>
              <p className="text-xs text-neutral-400">Accès complet à toutes les fonctionnalités</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
              <Check className="w-3 h-3" /> Autorisations
            </p>
            {adminPermissions.map((perm, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span>{perm}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Moderator Role Card */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900">Modérateur</h3>
              <p className="text-xs text-neutral-400">Accès limité à la modération de contenu</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                <Check className="w-3 h-3" /> Autorisations
              </p>
              {moderatorPermissions.map((perm, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                  <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{perm}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest flex items-center gap-1.5">
                <X className="w-3 h-3" /> Restreint
              </p>
              {moderatorRestricted.map((perm, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-neutral-400">
                  <X className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                  <span>{perm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team List Section */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Users className="text-orange-500 w-5 h-5" />
            <h3 className="font-bold text-neutral-900">Équipe ({admins.length})</h3>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-100 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
              />
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors shrink-0"
            >
              <UserPlus className="w-[18px] h-[18px]" />
              Ajouter
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredAdmins.length > 0 ? (
            filteredAdmins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between p-4 rounded-xl border border-neutral-50 hover:bg-neutral-50/50 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                    admin.role === 'admin' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {admin.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-neutral-900">{admin.name}</p>
                      {admin.is_me && (
                        <span className="px-2 py-0.5 bg-neutral-100 text-neutral-500 text-[10px] font-bold rounded">Vous</span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400">{admin.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className={`px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border ${
                    admin.role === 'admin' 
                      ? 'bg-red-50 text-red-500 border-red-100' 
                      : 'bg-blue-50 text-blue-500 border-blue-100'
                  }`}>
                    {admin.role === 'admin' ? <Crown className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                    {admin.role === 'admin' ? 'Administrateur' : 'Modérateur'}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleOpenModal(admin)}
                      className="p-2 text-neutral-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                      title="Modifier"
                    >
                      <Edit2 className="w-[18px] h-[18px]" />
                    </button>
                    {!admin.is_me && (
                      <button 
                        onClick={() => handleDelete(admin.id)}
                        className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Supprimer"
                      >
                        <Trash2 className="w-[18px] h-[18px]" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-neutral-400">
              Aucun administrateur trouvé
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-neutral-900">
                  {editingAdmin ? 'Modifier l\'administrateur' : 'Ajouter un administrateur'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-1.5">Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-[18px] h-[18px]" />
                    <input 
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                      placeholder="Ex: Jean Dupont"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-1.5">Adresse email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-[18px] h-[18px]" />
                    <input 
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                      placeholder="email@exemple.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-1.5">Rôle</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'moderator' })}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        formData.role === 'moderator' 
                          ? 'border-blue-500 bg-blue-50 text-blue-600' 
                          : 'border-neutral-100 hover:border-neutral-200 text-neutral-400'
                      }`}
                    >
                      <Shield className="w-[18px] h-[18px]" />
                      <span className="font-bold text-sm">Modérateur</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'admin' })}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        formData.role === 'admin' 
                          ? 'border-red-500 bg-red-50 text-red-600' 
                          : 'border-neutral-100 hover:border-neutral-200 text-neutral-400'
                      }`}
                    >
                      <Crown className="w-[18px] h-[18px]" />
                      <span className="font-bold text-sm">Admin</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 text-sm font-bold text-neutral-500 hover:bg-neutral-50 rounded-xl transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
                  >
                    {editingAdmin ? 'Mettre à jour' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
