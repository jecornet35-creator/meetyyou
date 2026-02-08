import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { 
  Users, Shield, MessageCircle, CreditCard, BarChart3, Settings, 
  FileText, Bell, Bot, Lock, HeadphonesIcon, ChevronDown, ChevronRight,
  Heart, Home, AlertTriangle, Flag, Ban, CheckCircle, Eye, Image,
  DollarSign, Ticket, Globe, Database
} from 'lucide-react';

const menuItems = [
  {
    id: 'users',
    label: 'Gestion des utilisateurs',
    icon: Users,
    subItems: [
      { label: 'Liste des utilisateurs', page: 'AdminUsers' },
      { label: 'Vérification des profils', page: 'AdminVerification' },
      { label: 'Gestion des photos', page: 'AdminPhotos' },
      { label: 'Comptes bannis', page: 'AdminBanned' },
    ]
  },
  {
    id: 'moderation',
    label: 'Modération & sécurité',
    icon: Shield,
    subItems: [
      { label: 'Signalements', page: 'AdminReports' },
      { label: 'Conversations signalées', page: 'AdminFlaggedMessages' },
      { label: 'Modération automatique', page: 'AdminAutoModeration' },
      { label: 'Détection de fraude', page: 'AdminFraud' },
      { label: 'Journal d\'audit', page: 'AdminAuditLog' },
    ]
  },
  {
    id: 'messages',
    label: 'Messages & interactions',
    icon: MessageCircle,
    subItems: [
      { label: 'Supervision des messages', page: 'AdminMessages' },
      { label: 'Statistiques messages', page: 'AdminMessageStats' },
      { label: 'Gestion des matchs', page: 'AdminMatches' },
    ]
  },
  {
    id: 'subscriptions',
    label: 'Abonnements & paiements',
    icon: CreditCard,
    subItems: [
      { label: 'Plans d\'abonnement', page: 'AdminSubscriptionPlans' },
      { label: 'Abonnements actifs', page: 'AdminSubscriptions' },
      { label: 'Transactions', page: 'AdminTransactions' },
      { label: 'Codes promo', page: 'AdminPromoCodes' },
    ]
  },
  {
    id: 'analytics',
    label: 'Statistiques & analytics',
    icon: BarChart3,
    subItems: [
      { label: 'Tableau de bord', page: 'AdminDashboard' },
      { label: 'Rapports de modération', page: 'AdminAnalytics' },
      { label: 'Utilisateurs actifs', page: 'AdminActiveUsers' },
      { label: 'Rapports', page: 'AdminReportsExport' },
    ]
  },
  {
    id: 'settings',
    label: 'Paramètres généraux',
    icon: Settings,
    subItems: [
      { label: 'Configuration du site', page: 'AdminConfig' },
      { label: 'Règles de matching', page: 'AdminMatchingRules' },
      { label: 'Maintenance', page: 'AdminMaintenance' },
    ]
  },
  {
    id: 'content',
    label: 'Contenus & communication',
    icon: FileText,
    subItems: [
      { label: 'Pages CMS', page: 'AdminCMS' },
      { label: 'Notifications push', page: 'AdminPushNotifications' },
      { label: 'Emails', page: 'AdminEmails' },
    ]
  },
  {
    id: 'support',
    label: 'Support & assistance',
    icon: HeadphonesIcon,
    subItems: [
      { label: 'Tickets support', page: 'AdminTickets' },
      { label: 'Réponses prédéfinies', page: 'AdminCannedResponses' },
    ]
  },
  {
    id: 'security',
    label: 'Sécurité & conformité',
    icon: Lock,
    subItems: [
      { label: 'RGPD', page: 'AdminGDPR' },
      { label: 'Logs de sécurité', page: 'AdminSecurityLogs' },
      { label: 'Gestion des admins', page: 'AdminManagement' },
    ]
  },
];

export default function AdminSidebar({ currentPage }) {
  const [expandedItems, setExpandedItems] = useState(['users', 'moderation', 'subscriptions', 'analytics']);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [userRole, setUserRole] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(async (user) => {
      setCurrentUser(user);
      const roles = await base44.entities.AdminRole.filter({ user_email: user.email });
      setUserRole(roles[0] || null);
    });
  }, []);

  const toggleExpand = (id) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const hasPermission = (page) => {
    // TODO: Temporairement désactivé pour débloquer l'accès
    return true;
    
    /* 
    if (!userRole) return true;
    if (userRole.role === 'admin') return true;
    
    const permissionMap = {
      'AdminUsers': 'users',
      'AdminVerification': 'verification',
      'AdminPhotos': 'photos',
      'AdminBanned': 'users',
      'AdminReports': 'reports',
      'AdminFlaggedMessages': 'messages',
      'AdminAutoModeration': 'reports',
      'AdminFraud': 'reports',
      'AdminAuditLog': 'admin_management',
      'AdminMessages': 'messages',
      'AdminMessageStats': 'messages',
      'AdminMatches': 'users',
      'AdminSubscriptionPlans': 'subscriptions',
      'AdminSubscriptions': 'subscriptions',
      'AdminTransactions': 'transactions',
      'AdminPromoCodes': 'promo_codes',
      'AdminDashboard': true,
      'AdminAnalytics': true,
      'AdminActiveUsers': 'users',
      'AdminReportsExport': true,
      'AdminConfig': 'admin_management',
      'AdminMatchingRules': 'admin_management',
      'AdminMaintenance': 'admin_management',
      'AdminCMS': 'emails',
      'AdminPushNotifications': 'emails',
      'AdminEmails': 'emails',
      'AdminTickets': 'tickets',
      'AdminCannedResponses': 'tickets',
      'AdminGDPR': 'admin_management',
      'AdminSecurityLogs': 'admin_management',
      'AdminManagement': 'admin_management'
    };
    
    const permission = permissionMap[page];
    if (permission === true) return true;
    return permission ? userRole.permissions?.[permission] : false;
    */
  };

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <Link to={createPageUrl('Home')} className="flex items-center gap-2">
          <Heart className="w-8 h-8 text-amber-500 fill-amber-500" />
          <span className="font-bold text-xl">Meetyyou</span>
        </Link>
        <p className="text-xs text-gray-500 mt-1">Administration</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedItems.includes(item.id);
          
          return (
            <div key={item.id} className="mb-1">
              <button
                onClick={() => toggleExpand(item.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              
              {isExpanded && (
                <div className="bg-gray-800/50">
                  {item.subItems.filter(subItem => hasPermission(subItem.page)).map((subItem) => (
                    <Link
                      key={subItem.page}
                      to={createPageUrl(subItem.page)}
                      className={`block px-4 py-2 pl-12 text-sm transition-colors ${
                        currentPage === subItem.page
                          ? 'bg-amber-600 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <Link 
          to={createPageUrl('Home')}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm"
        >
          <Home className="w-4 h-4" />
          Retour au site
        </Link>
      </div>
    </div>
  );
}