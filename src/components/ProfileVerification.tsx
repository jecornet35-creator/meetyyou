import React, { useState } from 'react';
import { 
  Clock, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  ShieldAlert,
  Star,
  Mail,
  Camera,
  FileText,
  Inbox
} from 'lucide-react';
import { motion } from 'motion/react';

const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
  <div className={`${bgColor} p-6 rounded-2xl border border-neutral-100 flex flex-col gap-2 min-w-[200px] flex-1`}>
    <div className="flex items-center gap-2 text-neutral-500">
      <Icon className={`${color} w-[18px] h-[18px]`} />
      <span className="text-sm font-medium">{label}</span>
    </div>
    <span className={`text-4xl font-bold ${color}`}>{value}</span>
  </div>
);

export default function ProfileVerification() {
  const [activeTab, setActiveTab] = useState('À réviser');

  const tabs = [
    { label: 'À réviser', count: 0, icon: Eye },
    { label: 'En attente IA', count: 0, icon: Clock },
    { label: 'Approuvés', count: 0, icon: CheckCircle2 },
    { label: 'Rejetés', count: 0, icon: XCircle },
    { label: 'Tous', count: 0, icon: Inbox },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8"
    >
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <ShieldCheck className="text-orange-500 w-8 h-8" />
          <h1 className="text-3xl font-bold text-neutral-900">Vérification des profils</h1>
        </div>
        <p className="text-neutral-500">Gérez les demandes de vérification photo et document</p>
      </header>

      {/* Stats Grid */}
      <div className="flex flex-wrap gap-6 mb-8">
        <StatCard icon={Clock} label="En attente" value="0" color="text-yellow-600" bgColor="bg-yellow-50/50" />
        <StatCard icon={Eye} label="À réviser" value="0" color="text-purple-600" bgColor="bg-purple-50/50" />
        <StatCard icon={CheckCircle2} label="Approuvés" value="0" color="text-emerald-600" bgColor="bg-emerald-50/50" />
        <StatCard icon={XCircle} label="Rejetés" value="0" color="text-red-600" bgColor="bg-red-50/50" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.label 
                ? 'bg-orange-500 text-white shadow-md' 
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {tab.label === 'En attente IA' && <Clock className="w-3.5 h-3.5" />}
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-20 flex flex-col items-center justify-center text-center mb-8">
        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="text-neutral-200 w-10 h-10" />
        </div>
        <p className="text-neutral-500 text-lg">Aucune demande dans cette catégorie</p>
      </div>

      {/* Verification Levels */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8">
        <div className="flex items-center gap-2 mb-6">
          <Star className="text-orange-500 w-5 h-5" />
          <h3 className="font-bold text-neutral-900">Niveaux de vérification</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <Mail className="text-purple-600 w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-neutral-900">Basique</p>
              <p className="text-sm text-neutral-500">Profil standard, email confirmé</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="text-emerald-600 w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-neutral-900">Vérifié</p>
              <p className="text-sm text-neutral-500">Selfie correspond à la photo de profil</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="text-orange-600 w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-neutral-900">Hautement vérifié</p>
              <p className="text-sm text-neutral-500">Document officiel + selfie validés</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
