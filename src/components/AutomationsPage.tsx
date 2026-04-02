import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Plus, 
  CheckCircle2, 
  Mail, 
  UserPlus, 
  CreditCard, 
  UserCheck, 
  Clock, 
  ChevronRight,
  Settings2,
  AlertCircle,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface Automation {
  id: string;
  trigger: string;
  name: string;
  description: string;
  category: string;
  active: boolean;
  emailsSent: number;
  icon: any;
}

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'INSCRIPTION', name: 'INSCRIPTION' },
    { id: 'ABONNEMENT', name: 'ABONNEMENT' },
    { id: 'PROFIL', name: 'PROFIL' },
    { id: 'RÉACTIVATION', name: 'RÉACTIVATION' }
  ];

  const triggerTemplates = [
    { 
      id: 'new_registration', 
      name: 'Nouvelle inscription', 
      description: "Envoyé dès qu'un utilisateur crée son compte", 
      category: 'INSCRIPTION',
      icon: UserPlus 
    },
    { 
      id: 'premium_subscription', 
      name: 'Abonnement Premium', 
      description: "Envoyé quand un utilisateur passe Premium", 
      category: 'ABONNEMENT',
      icon: CreditCard 
    },
    { 
      id: 'vip_subscription', 
      name: 'Abonnement VIP', 
      description: "Envoyé quand un utilisateur passe VIP", 
      category: 'ABONNEMENT',
      icon: Zap 
    },
    { 
      id: 'subscription_expired', 
      name: 'Abonnement expiré', 
      description: "Envoyé quand un abonnement arrive à expiration", 
      category: 'ABONNEMENT',
      icon: Clock 
    },
    { 
      id: 'profile_verified', 
      name: 'Profil vérifié', 
      description: "Envoyé quand un profil est validé par un admin", 
      category: 'PROFIL',
      icon: UserCheck 
    },
    { 
      id: 'inactive_7_days', 
      name: 'Inactif 7 jours', 
      description: "Envoyé si l'utilisateur n'est pas connecté depuis 7 jours", 
      category: 'RÉACTIVATION',
      icon: Clock 
    },
    { 
      id: 'inactive_30_days', 
      name: 'Inactif 30 jours', 
      description: "Envoyé si l'utilisateur n'est pas connecté depuis 30 jours", 
      category: 'RÉACTIVATION',
      icon: Clock 
    }
  ];

  useEffect(() => {
    const fetchAutomations = async () => {
      try {
        const data = await api.get('email_automations');
        setAutomations(data || []);
      } catch (error) {
        console.error("Failed to fetch automations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAutomations();
  }, []);

  const handleConfigure = (template: any) => {
    toast.info(`Configuration de l'automatisation : ${template.name}`, {
      description: "Cette fonctionnalité sera bientôt disponible."
    });
  };

  const activeCount = automations.filter(a => a.active).length;
  const totalEmailsSent = automations.reduce((acc, curr) => acc + (curr.emailsSent || 0), 0);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <Zap className="w-7 h-7" fill="currentColor" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900">Automatisations Email</h1>
          </div>
          <p className="text-neutral-500">Configurez les emails envoyés automatiquement selon les actions des utilisateurs</p>
        </div>
        <button 
          onClick={() => toast.info("Nouvelle automatisation", { description: "Bientôt disponible" })}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-sm shadow-orange-200"
        >
          <Plus className="w-5 h-5" />
          Nouvelle automatisation
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-4">
          <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-bold text-neutral-900">{automations.length}</p>
            <p className="text-sm text-neutral-500">Automatisations configurées</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-500 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-bold text-neutral-900">{activeCount}</p>
            <p className="text-sm text-neutral-500">Actives</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-bold text-neutral-900">{totalEmailsSent}</p>
            <p className="text-sm text-neutral-500">Emails envoyés au total</p>
          </div>
        </div>
      </div>

      {/* Categories and Templates */}
      {categories.map((category) => (
        <div key={category.id} className="mb-12">
          <h2 className="text-xs font-bold text-neutral-400 tracking-widest uppercase mb-6 flex items-center gap-2">
            {category.name}
            <div className="h-px flex-1 bg-neutral-100"></div>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {triggerTemplates
              .filter(t => t.category === category.id)
              .map((template, i) => {
                const isConfigured = automations.find(a => a.trigger === template.id);
                const Icon = template.icon;
                
                return (
                  <motion.div 
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 hover:border-orange-200 transition-all group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-xl ${category.id === 'INSCRIPTION' ? 'bg-blue-50 text-blue-500' : category.id === 'ABONNEMENT' ? 'bg-orange-50 text-orange-500' : category.id === 'PROFIL' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-neutral-800">{template.name}</h3>
                    </div>
                    <p className="text-sm text-neutral-500 mb-6 min-h-[40px]">
                      {template.description}
                    </p>
                    <button 
                      onClick={() => handleConfigure(template)}
                      className="w-full py-3 border border-dashed border-neutral-200 rounded-xl text-neutral-500 text-sm font-bold hover:bg-neutral-50 hover:border-neutral-300 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Configurer
                    </button>
                  </motion.div>
                );
              })}
          </div>
        </div>
      ))}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
        <div className="flex gap-4">
          <div className="text-blue-500 mt-1">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-blue-900 mb-2">Comment ça fonctionne ?</h4>
            <p className="text-sm text-blue-700 leading-relaxed">
              Ces automatisations s'activent via la fonction backend <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-800 font-mono text-xs">triggerEmailAutomation</code>. Appelez-la avec le bon déclencheur depuis votre code (ex: après une inscription, après un paiement) et l'email sera envoyé automatiquement au bon utilisateur.
            </p>
            <div className="mt-4 p-3 bg-white/50 rounded-lg border border-blue-100">
              <code className="text-xs text-blue-500 font-mono">
                Ex: {'{'} trigger: "new_registration", user_email: "...", user_name: "..." {'}'}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
