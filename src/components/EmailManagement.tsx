import React, { useState } from 'react';
import { 
  Mail, 
  BookOpen, 
  Users, 
  User, 
  Send, 
  Settings, 
  History,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

const templates = [
  { id: 1, title: 'Vérification de profil', description: 'Vérifiez votre profil Meetyyou', tag: 'Modération', tagColor: 'text-red-600 bg-red-50' },
  { id: 2, title: 'Rappel d\'activité', description: 'Des profils vous attendent sur Meetyyou', tag: 'Réactivation', tagColor: 'text-orange-600 bg-orange-50' },
  { id: 3, title: 'Promotion Premium', description: 'Offre spéciale - Passez Premium !', tag: 'Promotion', tagColor: 'text-emerald-600 bg-emerald-50' },
  { id: 4, title: 'Bienvenue', description: 'Bienvenue sur Meetyyou !', tag: 'Inscription', tagColor: 'text-blue-600 bg-blue-50' },
];

export default function EmailManagement() {
  const [activeTab, setActiveTab] = useState('Envoyer');
  const [recipientType, setRecipientType] = useState('Tous');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8"
    >
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Gestion des Emails</h1>
        <p className="text-neutral-500">Gérez vos modèles d'emails et envoyez des campagnes</p>
      </header>

      {/* Top Navigation */}
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('Envoyer')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'Envoyer' 
              ? 'bg-orange-500 text-white shadow-md' 
              : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          <Mail className="w-[18px] h-[18px]" />
          Envoyer un email
        </button>
        <button 
          onClick={() => setActiveTab('Modèles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'Modèles' 
              ? 'bg-orange-500 text-white shadow-md' 
              : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          <BookOpen className="w-[18px] h-[18px]" />
          Modèles d'emails
          <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'Modèles' ? 'bg-white/20' : 'bg-neutral-100 text-neutral-500'}`}>4</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Composer Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recipient Selector */}
          <div className="flex gap-4 p-1 bg-white border border-neutral-100 rounded-xl shadow-sm">
            <button 
              onClick={() => setRecipientType('Tous')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                recipientType === 'Tous' 
                  ? 'bg-orange-50 text-orange-600 border border-orange-200' 
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              <Users className="w-[18px] h-[18px]" />
              Tous les utilisateurs
              <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${recipientType === 'Tous' ? 'bg-orange-200/50' : 'bg-neutral-100'}`}>3</span>
            </button>
            <button 
              onClick={() => setRecipientType('Individuel')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                recipientType === 'Individuel' 
                  ? 'bg-orange-50 text-orange-600 border border-orange-200' 
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              <User className="w-[18px] h-[18px]" />
              Individuel
            </button>
          </div>

          {/* Composer Card */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-50 flex items-center gap-2">
              <Mail className="text-orange-500 w-[18px] h-[18px]" />
              <h3 className="font-bold text-neutral-900">Composer l'email</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Sujet</label>
                <input 
                  type="text" 
                  placeholder="Objet de l'email..."
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-neutral-700">Message</label>
                  <span className="text-[10px] text-neutral-400">Utilisez {"{name}"} pour personnaliser</span>
                </div>
                <textarea 
                  placeholder="Rédigez votre message ici..."
                  rows={10}
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm resize-none"
                />
              </div>
            </div>
            <div className="p-6 bg-neutral-50/50 flex justify-between items-center">
              <p className="text-xs text-neutral-400 font-medium">Envoi à 3 utilisateur(s)</p>
              <button className="flex items-center gap-2 px-6 py-2.5 bg-orange-200 text-white rounded-lg text-sm font-bold cursor-not-allowed">
                <Send className="w-4 h-4" />
                Envoyer
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-6">
          {/* Templates Card */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-neutral-900">Modèles enregistrés</h3>
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 rounded-lg text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-colors">
                <BookOpen className="w-3.5 h-3.5" />
                Gérer
              </button>
            </div>
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="p-4 border border-neutral-50 rounded-xl hover:border-orange-100 hover:bg-orange-50/10 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-bold text-neutral-900 group-hover:text-orange-600 transition-colors">{template.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${template.tagColor}`}>
                      {template.tag}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">{template.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* History Card */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
            <h3 className="font-bold text-neutral-900 mb-6">Historique d'envoi</h3>
            <div className="py-10 flex flex-col items-center justify-center text-center">
              <History className="text-neutral-100 mb-2 w-8 h-8" />
              <p className="text-sm text-neutral-400">Aucun email envoyé</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
