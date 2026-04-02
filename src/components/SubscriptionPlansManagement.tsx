import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Save, 
  ChevronRight,
  Zap,
  Crown,
  Rocket,
  Star,
  LayoutGrid,
  List,
  Gift,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface Feature {
  text: string;
  included: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  currency: string;
  period: string;
  badge?: string;
  economy?: string;
  color: string;
  btnColor: string;
  type: 'booster' | 'subscription';
  popular?: boolean;
  features: Feature[];
  btnText: string;
}

interface GlobalSettings {
  freeAccessActive: boolean;
  freeAccessStartDate: string | null;
  freeAccessEndDate: string | null;
  freeAccessName: string;
}

export default function SubscriptionPlansManagement() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    freeAccessActive: false,
    freeAccessStartDate: null,
    freeAccessEndDate: null,
    freeAccessName: "Promotion Spéciale"
  });
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const [plansData, settingsData] = await Promise.all([
        api.get('subscription_plans'),
        api.get('global_settings')
      ]);
      setPlans(plansData || []);
      if (settingsData) {
        setGlobalSettings(settingsData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGlobalSettings = async () => {
    try {
      await api.save('global_settings', globalSettings);
      toast.success("Paramètres globaux enregistrés");
    } catch (error) {
      console.error("Failed to save global settings:", error);
      toast.error("Erreur lors de l'enregistrement des paramètres globaux");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    try {
      let updatedPlans;
      if (plans.find(p => p.id === editingPlan.id)) {
        updatedPlans = plans.map(p => p.id === editingPlan.id ? editingPlan : p);
      } else {
        updatedPlans = [...plans, editingPlan];
      }

      await api.save('subscription_plans', updatedPlans);
      setPlans(updatedPlans);
      setIsModalOpen(false);
      setEditingPlan(null);
      toast.success("Plan enregistré avec succès");
    } catch (error) {
      console.error("Failed to save plan:", error);
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce plan ?")) return;

    try {
      const updatedPlans = plans.filter(p => p.id !== id);
      await api.save('subscription_plans', updatedPlans);
      setPlans(updatedPlans);
      toast.success("Plan supprimé");
    } catch (error) {
      console.error("Failed to delete plan:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const openEditModal = (plan?: SubscriptionPlan) => {
    if (plan) {
      setEditingPlan({ ...plan });
    } else {
      setEditingPlan({
        id: Math.random().toString(36).substr(2, 9),
        name: "",
        subtitle: "",
        price: "",
        currency: "€",
        period: "/ mois",
        color: "from-blue-500 to-blue-600",
        btnColor: "bg-blue-600 hover:bg-blue-700",
        type: 'subscription',
        features: [
          { text: "Fonctionnalité 1", included: true },
          { text: "Fonctionnalité 2", included: false }
        ],
        btnText: "S'abonner"
      });
    }
    setIsModalOpen(true);
  };

  const addFeature = () => {
    if (!editingPlan) return;
    setEditingPlan({
      ...editingPlan,
      features: [...editingPlan.features, { text: "", included: true }]
    });
  };

  const updateFeature = (index: number, field: keyof Feature, value: any) => {
    if (!editingPlan) return;
    const newFeatures = [...editingPlan.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setEditingPlan({ ...editingPlan, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    if (!editingPlan) return;
    setEditingPlan({
      ...editingPlan,
      features: editingPlan.features.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
              <CreditCard className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900">Plans d'abonnement</h1>
          </div>
          <p className="text-neutral-500">Gérez les offres et les tarifs de votre plateforme</p>
        </div>
        <button 
          onClick={() => openEditModal()}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-sm shadow-orange-200"
        >
          <Plus className="w-5 h-5" />
          Nouveau plan
        </button>
      </header>

      {/* Global Free Access Section */}
      <div className="bg-white rounded-[32px] shadow-sm border border-neutral-100 p-8 mb-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Accès Libre Global (Promotion)</h2>
            <p className="text-sm text-neutral-500">Permettez à tous les utilisateurs d'accéder aux fonctionnalités Premium gratuitement</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Nom de l'événement</label>
            <input 
              type="text" 
              value={globalSettings.freeAccessName}
              onChange={(e) => setGlobalSettings({ ...globalSettings, freeAccessName: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              placeholder="ex: Fête de Pâques"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Date de début</label>
            <input 
              type="date" 
              value={globalSettings.freeAccessStartDate || ''}
              onChange={(e) => setGlobalSettings({ ...globalSettings, freeAccessStartDate: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Date de fin</label>
            <input 
              type="date" 
              value={globalSettings.freeAccessEndDate || ''}
              onChange={(e) => setGlobalSettings({ ...globalSettings, freeAccessEndDate: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            />
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setGlobalSettings({ ...globalSettings, freeAccessActive: !globalSettings.freeAccessActive })}
              className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                globalSettings.freeAccessActive 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                  : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
              }`}
            >
              {globalSettings.freeAccessActive ? <Check className="w-4.5 h-4.5" /> : <X className="w-4.5 h-4.5" />}
              {globalSettings.freeAccessActive ? 'Activé' : 'Désactivé'}
            </button>
            <button 
              onClick={handleSaveGlobalSettings}
              className="p-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
              title="Enregistrer les paramètres"
            >
              <Save className="w-5 h-5" />
            </button>
          </div>
        </div>

        {globalSettings.freeAccessActive && (
          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700 text-sm">
            <Calendar className="w-4.5 h-4.5" />
            <span>L'accès libre est actuellement <strong>actif</strong>. Tous les utilisateurs non-abonnés peuvent utiliser les fonctionnalités Premium.</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-[32px] shadow-sm border border-neutral-100 overflow-hidden group">
            <div className={`bg-gradient-to-br ${plan.color} p-6 text-white relative`}>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                  {plan.type === 'booster' ? <Rocket className="w-6 h-6" /> : plan.id === 'vip' ? <Crown className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEditModal(plan)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-md transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(plan.id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg backdrop-blur-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-black mb-1">{plan.name}</h3>
              <p className="text-white/80 text-xs mb-4">{plan.subtitle}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black">{plan.price}{plan.currency}</span>
                <span className="text-white/70 text-xs">{plan.period}</span>
              </div>
            </div>
            
            <div className="p-6">
              <ul className="space-y-3 mb-6">
                {plan.features.slice(0, 4).map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs">
                    {feature.included ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-neutral-300" />
                    )}
                    <span className={feature.included ? 'text-neutral-700' : 'text-neutral-400'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
                {plan.features.length > 4 && (
                  <li className="text-xs text-neutral-400 italic">
                    + {plan.features.length - 4} autres fonctionnalités...
                  </li>
                )}
              </ul>
              
              <div className={`w-full ${plan.btnColor} text-white text-center font-bold py-3 rounded-xl text-sm opacity-50`}>
                {plan.btnText}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isModalOpen && editingPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-neutral-900">
                  {plans.find(p => p.id === editingPlan.id) ? "Modifier le plan" : "Nouveau plan"}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Nom du plan</label>
                    <input 
                      type="text" 
                      value={editingPlan.name}
                      onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Sous-titre</label>
                    <input 
                      type="text" 
                      value={editingPlan.subtitle}
                      onChange={(e) => setEditingPlan({ ...editingPlan, subtitle: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Prix</label>
                    <input 
                      type="text" 
                      value={editingPlan.price}
                      onChange={(e) => setEditingPlan({ ...editingPlan, price: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Période (ex: / mois)</label>
                    <input 
                      type="text" 
                      value={editingPlan.period}
                      onChange={(e) => setEditingPlan({ ...editingPlan, period: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Type</label>
                    <select 
                      value={editingPlan.type}
                      onChange={(e) => setEditingPlan({ ...editingPlan, type: e.target.value as any })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    >
                      <option value="subscription">Abonnement</option>
                      <option value="booster">Booster / À la carte</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Badge (optionnel)</label>
                    <input 
                      type="text" 
                      value={editingPlan.badge || ""}
                      onChange={(e) => setEditingPlan({ ...editingPlan, badge: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Fonctionnalités</label>
                    <button 
                      type="button"
                      onClick={addFeature}
                      className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Ajouter
                    </button>
                  </div>
                  <div className="space-y-3">
                    {editingPlan.features.map((feature, idx) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <button 
                          type="button"
                          onClick={() => updateFeature(idx, 'included', !feature.included)}
                          className={`p-2 rounded-lg transition-colors ${feature.included ? 'bg-emerald-100 text-emerald-600' : 'bg-neutral-100 text-neutral-400'}`}
                        >
                          {feature.included ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                        <input 
                          type="text" 
                          value={feature.text}
                          onChange={(e) => updateFeature(idx, 'text', e.target.value)}
                          className="flex-1 px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm"
                          placeholder="Description de la fonctionnalité"
                        />
                        <button 
                          type="button"
                          onClick={() => removeFeature(idx)}
                          className="p-2 text-neutral-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Couleur dégradé (Tailwind)</label>
                    <input 
                      type="text" 
                      value={editingPlan.color}
                      onChange={(e) => setEditingPlan({ ...editingPlan, color: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-xs font-mono"
                      placeholder="from-blue-500 to-blue-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Texte du bouton</label>
                    <input 
                      type="text" 
                      value={editingPlan.btnText}
                      onChange={(e) => setEditingPlan({ ...editingPlan, btnText: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </form>

              <div className="p-6 border-t border-neutral-100 bg-neutral-50 flex justify-end gap-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 text-neutral-500 font-bold hover:bg-neutral-100 rounded-xl transition-all"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSave}
                  className="px-8 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Enregistrer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
