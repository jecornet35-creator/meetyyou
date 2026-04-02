import React from 'react';
import { 
  CreditCard, 
  Star, 
  Crown, 
  Euro,
  User,
  CheckCircle2,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';

const subscriptions = [
  { id: 1, email: 'jecornet35@gmail.com', plan: 'Premium', status: 'Actif', amount: '9.99€', start: '24/02/26', end: '24/03/26', renewal: 'Auto' },
  { id: 2, email: 'jlcornet878@gmail.com', plan: 'Premium', status: 'Annulé', amount: '9.99€', start: '22/02/26', end: '22/03/26', renewal: 'Auto' },
];

const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
  <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex items-center gap-4 flex-1 min-w-[200px]">
    <div className={`p-4 rounded-xl ${bgColor} ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <h3 className="text-2xl font-bold text-neutral-900">{value}</h3>
      <p className="text-sm text-neutral-500 font-medium">{label}</p>
    </div>
  </div>
);

export default function SubscriptionManagement() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8"
    >
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Abonnements</h1>
          <p className="text-neutral-500">Gérez les abonnements des utilisateurs</p>
        </div>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('admin:changeView', { detail: 'manual_subscription' }))}
          className="px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition-all flex items-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          Ajouter manuellement
        </button>
      </header>

      {/* Stats Grid */}
      <div className="flex flex-wrap gap-6 mb-8">
        <StatCard icon={CreditCard} label="Abonnements actifs" value="1" color="text-emerald-600" bgColor="bg-emerald-50" />
        <StatCard icon={Star} label="Premium" value="1" color="text-orange-500" bgColor="bg-orange-50" />
        <StatCard icon={Crown} label="VIP" value="0" color="text-purple-600" bgColor="bg-purple-50" />
        <StatCard icon={Euro} label="Revenu mensuel" value="9.99€" color="text-blue-600" bgColor="bg-blue-50" />
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100">
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Début</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Fin</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Renouvellement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="text-neutral-400 w-3.5 h-3.5" />
                      <span className="text-sm text-neutral-600">{sub.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-lg text-xs font-bold">
                      {sub.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      sub.status === 'Actif' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-neutral-900">
                    {sub.amount}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500">
                    {sub.start}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500">
                    {sub.end}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-xs font-bold flex items-center gap-1 w-fit">
                      {sub.renewal}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
