import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, UserCheck, UserX, MessageCircle, Heart, Eye, 
  AlertTriangle, CreditCard, TrendingUp, Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {trend && (
            <p className={`text-sm mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% vs mois dernier
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: profiles = [] } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: () => base44.entities.Profile.list('-created_date', 1000),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => base44.entities.Report.list('-created_date', 100),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: () => base44.entities.Message.list('-created_date', 1000),
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: () => base44.entities.Subscription.list('-created_date', 100),
  });

  // Stats calculations
  const totalUsers = profiles.length;
  const verifiedUsers = profiles.filter(p => p.is_verified).length;
  const onlineUsers = profiles.filter(p => p.is_online).length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const premiumUsers = subscriptions.filter(s => s.plan !== 'free' && s.status === 'active').length;

  // Chart data
  const userActivityData = [
    { name: 'Lun', users: 120 },
    { name: 'Mar', users: 150 },
    { name: 'Mer', users: 180 },
    { name: 'Jeu', users: 165 },
    { name: 'Ven', users: 200 },
    { name: 'Sam', users: 280 },
    { name: 'Dim', users: 240 },
  ];

  const genderData = [
    { name: 'Hommes', value: profiles.filter(p => p.gender === 'homme').length || 45 },
    { name: 'Femmes', value: profiles.filter(p => p.gender === 'femme').length || 55 },
  ];

  const COLORS = ['#3b82f6', '#ec4899'];

  const recentActivity = [
    { type: 'new_user', text: 'Nouveau membre inscrit', time: 'Il y a 5 min' },
    { type: 'report', text: 'Signalement reçu', time: 'Il y a 12 min' },
    { type: 'match', text: '15 nouveaux matchs', time: 'Il y a 30 min' },
    { type: 'payment', text: 'Abonnement Premium', time: 'Il y a 1h' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar currentPage="AdminDashboard" />
      
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">Vue d'ensemble de votre plateforme</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Utilisateurs totaux"
            value={totalUsers}
            icon={Users}
            color="bg-blue-500"
            trend={12}
          />
          <StatCard
            title="Utilisateurs en ligne"
            value={onlineUsers}
            icon={Activity}
            color="bg-green-500"
          />
          <StatCard
            title="Profils vérifiés"
            value={verifiedUsers}
            icon={UserCheck}
            color="bg-amber-500"
          />
          <StatCard
            title="Signalements en attente"
            value={pendingReports}
            icon={AlertTriangle}
            color="bg-red-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Activité hebdomadaire</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gender Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition par genre</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Statistiques rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <MessageCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{messages.length}</p>
                  <p className="text-sm text-gray-500">Messages</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">1,234</p>
                  <p className="text-sm text-gray-500">Matchs</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <CreditCard className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{premiumUsers}</p>
                  <p className="text-sm text-gray-500">Premium</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Eye className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">8,456</p>
                  <p className="text-sm text-gray-500">Vues profils</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'report' ? 'bg-red-500' :
                      activity.type === 'payment' ? 'bg-green-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.text}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}