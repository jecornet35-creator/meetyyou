import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface ManualSubscriptionPageProps {
  onBack: () => void;
}

export default function ManualSubscriptionPage({ onBack }: ManualSubscriptionPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    plan: 'Premium',
    duration: '1', // months
    startDate: new Date().toISOString().split('T')[0],
    amount: '0.00',
    reason: 'Geste commercial'
  });

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery.length < 2) {
        setUsers([]);
        return;
      }
      
      setLoading(true);
      try {
        const allUsers = await api.get('profiles') || [];
        const filtered = allUsers.filter(u => 
          (u.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
          (u.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
        ).slice(0, 5);
        setUsers(filtered);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      toast.error("Veuillez sélectionner un utilisateur");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Update user profile to set is_subscribed
      const allProfiles = await api.get('profiles');
      const updatedProfiles = allProfiles.map(p => 
        p.id === selectedUser.id ? { ...p, is_subscribed: true } : p
      );
      await api.save('profiles', updatedProfiles);

      // 2. Add transaction record
      const transactions = await api.get('transactions') || [];
      const newTransaction = {
        id: Date.now(),
        user_id: selectedUser.id,
        user_email: selectedUser.email,
        plan: formData.plan,
        amount: formData.amount + '€',
        status: 'Complété',
        type: 'Manuel',
        reason: formData.reason,
        created_at: new Date().toISOString(),
        end_date: new Date(new Date().setMonth(new Date().getMonth() + parseInt(formData.duration))).toISOString()
      };
      await api.save('transactions', [...transactions, newTransaction]);

      toast.success(`Abonnement ${formData.plan} ajouté avec succès à ${selectedUser.name}`);
      onBack();
    } catch (error) {
      console.error("Error adding manual subscription:", error);
      toast.error("Une erreur est survenue lors de l'ajout de l'abonnement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-4xl mx-auto"
    >
      <header className="mb-8 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-neutral-500" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Ajout manuel d'abonnement</h1>
          <p className="text-neutral-500">Attribuez un abonnement à un utilisateur sans passer par le tunnel de paiement</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Selection */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
            <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-500" />
              Utilisateur
            </h3>
            
            {!selectedUser ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Rechercher par nom ou email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                    </div>
                  ) : users.length > 0 ? (
                    users.map(user => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-orange-50 rounded-xl transition-all border border-transparent hover:border-orange-100 text-left"
                      >
                        <img 
                          src={user.photo} 
                          alt={user.name} 
                          className="w-10 h-10 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-neutral-900 truncate">{user.name}</p>
                          <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                        </div>
                      </button>
                    ))
                  ) : searchQuery.length >= 2 ? (
                    <p className="text-center py-4 text-xs text-neutral-400 italic">Aucun utilisateur trouvé</p>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 relative">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="absolute top-2 right-2 text-orange-500 hover:text-orange-600 font-bold text-xs"
                >
                  Modifier
                </button>
                <div className="flex items-center gap-4">
                  <img 
                    src={selectedUser.photo} 
                    alt={selectedUser.name} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-neutral-900 truncate">{selectedUser.name}</p>
                    <p className="text-xs text-neutral-500 truncate">{selectedUser.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">Compte identifié</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
            <h4 className="font-bold text-orange-800 text-sm mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Note importante
            </h4>
            <p className="text-xs text-orange-700 leading-relaxed">
              L'ajout manuel d'un abonnement contourne le système de paiement Stripe. Cette action sera enregistrée dans les logs d'audit de l'administration.
            </p>
          </div>
        </div>

        {/* Right Column: Subscription Details */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-neutral-100 shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-neutral-400" />
                  Type d'abonnement
                </label>
                <select 
                  value={formData.plan}
                  onChange={(e) => setFormData({...formData, plan: e.target.value})}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                >
                  <option value="Premium">Premium</option>
                  <option value="VIP">VIP</option>
                  <option value="Elite">Elite</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                  Durée (mois)
                </label>
                <select 
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                >
                  <option value="1">1 mois</option>
                  <option value="3">3 mois</option>
                  <option value="6">6 mois</option>
                  <option value="12">12 mois</option>
                  <option value="999">À vie (illimité)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">Date de début</label>
                <input 
                  type="date" 
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">Montant facturé (optionnel)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">€</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Raison de l'ajout manuel</label>
              <textarea 
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                placeholder="Ex: Geste commercial, erreur de paiement, test..."
                className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm h-24 resize-none"
              />
            </div>

            <div className="pt-4 border-t border-neutral-100 flex justify-end gap-4">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 text-sm font-bold text-neutral-500 hover:bg-neutral-50 rounded-xl transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedUser}
                className={`px-8 py-3 bg-orange-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center gap-2 ${
                  (submitting || !selectedUser) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600 hover:scale-105 active:scale-95'
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmer l'abonnement
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
