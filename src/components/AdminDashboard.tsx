import React, { useState } from 'react';
import { 
  Heart, 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  MessageSquare, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Headphones, 
  Lock, 
  ChevronDown, 
  ChevronRight,
  LogOut,
  Activity,
  CheckCircle2,
  Search,
  Bell,
  UserCheck,
  Ban,
  TrendingUp,
  HeartIcon,
  Eye
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

import UserManagement from './UserManagement';
import ProfileVerification from './ProfileVerification';
import PhotoManagement from './PhotoManagement';
import ReportManagement from './ReportManagement';
import ReportedConversations from './ReportedConversations';
import SubscriptionManagement from './SubscriptionManagement';
import EmailManagement from './EmailManagement';
import AdminManagement from './AdminManagement';
import AutomationsPage from './AutomationsPage';
import SubscriptionPlansManagement from './SubscriptionPlansManagement';
import ChatPage from './ChatPage';
import ManualSubscriptionPage from './ManualSubscriptionPage';

const weeklyData = [
  { name: 'Lun', value: 120 },
  { name: 'Mar', value: 150 },
  { name: 'Mer', value: 180 },
  { name: 'Jeu', value: 165 },
  { name: 'Ven', value: 200 },
  { name: 'Sam', value: 280 },
  { name: 'Dim', value: 240 },
];

const genderData = [
  { name: 'Hommes', value: 8, color: '#3b82f6' },
  { name: 'Femmes', value: 92, color: '#ec4899' },
];

const stats = [
  { label: 'Utilisateurs totaux', value: '17', change: '+12% vs mois dernier', icon: Users, color: 'bg-blue-500' },
  { label: 'Utilisateurs en ligne', value: '10', icon: Activity, color: 'bg-emerald-500' },
  { label: 'Profils vérifiés', value: '6', icon: UserCheck, color: 'bg-orange-500' },
  { label: 'Signalements en attente', value: '0', icon: AlertTriangle, color: 'bg-red-500' },
];

const quickStats = [
  { label: 'Messages', value: '5', icon: MessageSquare, color: 'text-blue-500', bgColor: 'bg-blue-50' },
  { label: 'Matchs', value: '1,234', icon: HeartIcon, color: 'text-red-500', bgColor: 'bg-red-50' },
  { label: 'Premium', value: '1', icon: CreditCard, color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
  { label: 'Vues profils', value: '8,456', icon: Eye, color: 'text-purple-500', bgColor: 'bg-purple-50' },
];

const recentActivity = [
  { type: 'info', text: 'Nouveau membre inscrit', time: 'Il y a 5 min', dotColor: 'bg-blue-500' },
  { type: 'alert', text: 'Signalement reçu', time: 'Il y a 12 min', dotColor: 'bg-red-500' },
  { type: 'info', text: '15 nouveaux matchs', time: 'Il y a 30 min', dotColor: 'bg-blue-500' },
  { type: 'success', text: 'Abonnement Premium', time: 'Il y a 1h', dotColor: 'bg-emerald-500' },
];

interface SidebarItemProps {
  icon: any;
  label: string;
  active?: boolean;
  hasSubmenu?: boolean;
  subItems?: string[];
  onSubItemClick?: (item: string) => void;
}

const SidebarItem = ({ icon: Icon, label, active = false, hasSubmenu = false, subItems = [], onSubItemClick }: SidebarItemProps) => {
  const [isOpen, setIsOpen] = useState(active);

  return (
    <div className="mb-1">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${active ? 'bg-orange-500 text-white' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        {hasSubmenu && (
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && hasSubmenu && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-neutral-900/50 ml-4 mt-1 rounded-lg"
          >
            {subItems.map((item, i) => (
              <button 
                key={i}
                onClick={() => onSubItemClick?.(item)}
                className="w-full text-left px-4 py-2 text-xs text-neutral-500 hover:text-white transition-colors"
              >
                {item}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function AdminDashboard({ onBack, socket }) {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'users', 'verification', 'photos', 'reports', 'reported_conversations', 'subscriptions', 'emails', 'admin_management', 'chat'
  const [selectedChatUser, setSelectedChatUser] = useState<any>(null);

  React.useEffect(() => {
    const handleViewChange = (e: any) => {
      setCurrentView(e.detail);
    };
    window.addEventListener('admin:changeView', handleViewChange);
    return () => window.removeEventListener('admin:changeView', handleViewChange);
  }, []);

  const handleMessageUser = (user: any) => {
    setSelectedChatUser(user);
    setCurrentView('chat');
  };

  const renderContent = () => {
    if (currentView === 'users') {
      return <UserManagement onMessageUser={handleMessageUser} />;
    }

    if (currentView === 'chat' && selectedChatUser) {
      return (
        <div className="p-8">
          <ChatPage 
            profile={selectedChatUser} 
            isSubscribed={true} 
            onBack={() => setCurrentView('users')} 
            onSubscriptionClick={() => {}} 
            socket={socket} 
            currentUserName="Administrateur"
          />
        </div>
      );
    }

    if (currentView === 'verification') {
      return <ProfileVerification />;
    }

    if (currentView === 'photos') {
      return <PhotoManagement />;
    }

    if (currentView === 'reports') {
      return <ReportManagement />;
    }

    if (currentView === 'reported_conversations') {
      return <ReportedConversations />;
    }

    if (currentView === 'subscriptions') {
      return <SubscriptionManagement />;
    }

    if (currentView === 'emails') {
      return <EmailManagement />;
    }

    if (currentView === 'admin_management') {
      return <AdminManagement />;
    }

    if (currentView === 'automations') {
      return <AutomationsPage />;
    }

    if (currentView === 'subscription_plans') {
      return <SubscriptionPlansManagement />;
    }

    if (currentView === 'manual_subscription') {
      return <ManualSubscriptionPage onBack={() => setCurrentView('subscriptions')} />;
    }

    return (
      <div className="p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Tableau de bord</h1>
            <p className="text-neutral-500">Vue d'ensemble de votre plateforme</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-[18px] h-[18px]" />
              <input 
                type="text" 
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all w-64"
              />
            </div>
            <button className="p-2 bg-white border border-neutral-200 rounded-lg text-neutral-500 hover:text-orange-500 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
              <div className="text-right">
                <p className="text-sm font-bold text-neutral-900 leading-none">Admin</p>
                <p className="text-[10px] text-neutral-500 mt-1">jlcornet878@gmail.com</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex justify-between items-start"
            >
              <div>
                <p className="text-sm font-medium text-neutral-500 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-neutral-900">{stat.value}</h3>
                {stat.change && (
                  <p className="text-xs font-medium text-emerald-500 mt-2">{stat.change}</p>
                )}
              </div>
              <div className={`p-3 rounded-xl ${stat.color} text-white`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-neutral-900">Activité hebdomadaire</h3>
              <select className="text-xs bg-neutral-50 border border-neutral-200 rounded px-2 py-1 outline-none">
                <option>7 derniers jours</option>
                <option>30 derniers jours</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
            <h3 className="font-bold text-neutral-900 mb-6">Répartition par genre</h3>
            <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-xs font-medium text-neutral-400">Total</p>
                <p className="text-2xl font-bold text-neutral-900">100%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
            <h3 className="font-bold text-neutral-900 mb-6">Statistiques rapides</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickStats.map((stat, i) => (
                <div key={i} className="p-4 rounded-xl border border-neutral-50 flex flex-col items-center text-center">
                  <div className={`p-3 rounded-full ${stat.bgColor} ${stat.color} mb-3`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                  <p className="text-xs text-neutral-400 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
            <h3 className="font-bold text-neutral-900 mb-6">Activité récente</h3>
            <div className="space-y-6">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex gap-4">
                  <div className="relative">
                    <div className={`w-3 h-3 rounded-full ${activity.dotColor} mt-1.5`}></div>
                    {i !== recentActivity.length - 1 && (
                      <div className="absolute top-4.5 left-1.5 w-px h-10 bg-neutral-100 -translate-x-1/2"></div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900">{activity.text}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      {/* Sidebar */}
      <aside className="w-72 bg-[#1e293b] text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-neutral-800">
          <div className="flex items-center gap-2 mb-1 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
            <Heart className="text-orange-500 fill-orange-500 w-7 h-7" />
            <span className="text-xl font-bold tracking-tight">Meetyyou</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Administration</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="mb-6">
            <SidebarItem 
              icon={Users} 
              label="Gestion des utilisateurs" 
              active={currentView === 'users' || currentView === 'verification' || currentView === 'photos'}
              hasSubmenu 
              subItems={['Liste des utilisateurs', 'Vérification des profils', 'Gestion des photos', 'Comptes bannis']}
              onSubItemClick={(item) => {
                if (item === 'Liste des utilisateurs') setCurrentView('users');
                if (item === 'Vérification des profils') setCurrentView('verification');
                if (item === 'Gestion des photos') setCurrentView('photos');
              }}
            />
            <SidebarItem 
              icon={ShieldCheck} 
              label="Modération & sécurité" 
              active={currentView === 'reports' || currentView === 'reported_conversations'}
              hasSubmenu 
              subItems={['Signalements', 'Conversations signalées', 'Détection de fraude', 'Journal d\'audit']}
              onSubItemClick={(item) => {
                if (item === 'Signalements') setCurrentView('reports');
                if (item === 'Conversations signalées') setCurrentView('reported_conversations');
              }}
            />
            <SidebarItem icon={MessageSquare} label="Messages & interactions" hasSubmenu subItems={['Templates de messages', 'Filtres de mots-clés']} />
            <SidebarItem 
              icon={CreditCard} 
              label="Abonnements & paiements" 
              active={currentView === 'subscriptions' || currentView === 'subscription_plans' || currentView === 'manual_subscription'}
              hasSubmenu 
              subItems={['Transactions', 'Plans d\'abonnement', 'Codes promo', 'Ajout manuel']} 
              onSubItemClick={(item) => {
                if (item === 'Transactions') setCurrentView('subscriptions');
                if (item === 'Plans d\'abonnement') setCurrentView('subscription_plans');
                if (item === 'Ajout manuel') setCurrentView('manual_subscription');
              }}
            />
            <SidebarItem 
              icon={BarChart3} 
              label="Statistiques & analytics" 
              active={currentView === 'dashboard'}
              hasSubmenu 
              subItems={['Tableau de bord', 'Utilisateurs actifs', 'Taux de conversion']}
              onSubItemClick={(item) => {
                if (item === 'Tableau de bord') setCurrentView('dashboard');
              }}
            />
          </div>

          <div className="pt-4 border-t border-neutral-800">
            <p className="px-4 mb-4 text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Rapports</p>
            <SidebarItem icon={Settings} label="Paramètres généraux" hasSubmenu subItems={['Configuration site', 'API Keys']} />
            <SidebarItem 
              icon={Lock} 
              label="Contenus & communication" 
              active={currentView === 'emails' || currentView === 'automations'}
              hasSubmenu 
              subItems={['Pages statiques', 'Emails système', 'Automation']} 
              onSubItemClick={(item) => {
                if (item === 'Emails système') setCurrentView('emails');
                if (item === 'Automation') setCurrentView('automations');
              }}
            />
            <SidebarItem icon={Headphones} label="Support & assistance" hasSubmenu subItems={['Tickets en attente', 'FAQ']} />
            <SidebarItem 
              icon={ShieldCheck} 
              label="Sécurité & conformité" 
              active={currentView === 'admin_management'}
              hasSubmenu 
              subItems={['RGPD', 'Logs de sécurité', 'Gestion des Admin']} 
              onSubItemClick={(item) => {
                if (item === 'Gestion des Admin') setCurrentView('admin_management');
              }}
            />
          </div>
        </div>

        <div className="p-4 border-t border-neutral-800">
          <button 
            onClick={onBack}
            className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Retour au site</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}} />
    </div>
  );
}
