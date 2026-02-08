import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, Users, Shield, Activity } from 'lucide-react';
import { format, subDays, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState('7');

  const { data: reports = [] } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => base44.entities.Report.list('-created_date', 500),
  });

  const { data: moderationActions = [] } = useQuery({
    queryKey: ['moderation-actions'],
    queryFn: () => base44.entities.ModerationAction.list('-created_date', 500),
  });

  const { data: adminRoles = [] } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => base44.entities.AdminRole.list(),
  });

  // Filtrer par plage de dates
  const filteredReports = useMemo(() => {
    if (dateRange === 'all') return reports;
    const cutoffDate = subDays(new Date(), parseInt(dateRange));
    return reports.filter(r => r.created_date && isAfter(new Date(r.created_date), cutoffDate));
  }, [reports, dateRange]);

  const filteredActions = useMemo(() => {
    if (dateRange === 'all') return moderationActions;
    const cutoffDate = subDays(new Date(), parseInt(dateRange));
    return moderationActions.filter(a => a.created_date && isAfter(new Date(a.created_date), cutoffDate));
  }, [moderationActions, dateRange]);

  // Statistiques des signalements par type
  const reportsByType = useMemo(() => {
    const counts = {};
    filteredReports.forEach(report => {
      counts[report.type] = (counts[report.type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      type: type === 'profile' ? 'Profil' :
            type === 'message' ? 'Message' :
            type === 'photo' ? 'Photo' :
            type === 'spam' ? 'Spam' :
            type === 'fake' ? 'Faux profil' :
            type === 'harassment' ? 'Harcèlement' :
            type === 'inappropriate' ? 'Inapproprié' : 'Autre',
      count
    }));
  }, [filteredReports]);

  // Actions de modération au fil du temps
  const actionsOverTime = useMemo(() => {
    const days = parseInt(dateRange) === 7 ? 7 : parseInt(dateRange) === 30 ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayActions = filteredActions.filter(a => {
        if (!a.created_date) return false;
        const actionDate = new Date(a.created_date);
        return isAfter(actionDate, dayStart) && isBefore(actionDate, dayEnd);
      });
      
      data.push({
        date: format(date, 'dd MMM', { locale: fr }),
        warnings: dayActions.filter(a => a.action_type === 'warning').length,
        suspensions: dayActions.filter(a => a.action_type === 'temporary_suspension').length,
        bans: dayActions.filter(a => a.action_type === 'permanent_ban').length,
        total: dayActions.length
      });
    }
    
    return data;
  }, [filteredActions, dateRange]);

  // Modérateurs les plus actifs
  const topModerators = useMemo(() => {
    const counts = {};
    filteredActions.forEach(action => {
      const moderator = action.moderator_name || action.moderator_email;
      counts[moderator] = (counts[moderator] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredActions]);

  // Raisons de signalement les plus fréquentes
  const topReasons = useMemo(() => {
    const counts = {};
    filteredReports.forEach(report => {
      const reason = report.reason || 'Non spécifiée';
      counts[reason] = (counts[reason] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredReports]);

  // Distribution des actions
  const actionDistribution = useMemo(() => {
    const counts = {
      warning: 0,
      temporary_suspension: 0,
      permanent_ban: 0,
      content_removal: 0,
      other: 0
    };
    
    filteredActions.forEach(action => {
      if (counts.hasOwnProperty(action.action_type)) {
        counts[action.action_type]++;
      } else {
        counts.other++;
      }
    });
    
    return [
      { name: 'Avertissements', value: counts.warning },
      { name: 'Suspensions', value: counts.temporary_suspension },
      { name: 'Bannissements', value: counts.permanent_ban },
      { name: 'Suppressions', value: counts.content_removal },
      { name: 'Autres', value: counts.other }
    ].filter(item => item.value > 0);
  }, [filteredActions]);

  // Stats rapides
  const stats = useMemo(() => ({
    totalReports: filteredReports.length,
    pendingReports: filteredReports.filter(r => r.status === 'pending').length,
    totalActions: filteredActions.length,
    activeModerators: new Set(filteredActions.map(a => a.moderator_email)).size
  }), [filteredReports, filteredActions]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentPage="AdminAnalytics" />
      
      <div className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rapports d'analyse</h1>
            <p className="text-gray-500 mt-1">Analyses consolidées des activités de modération</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 derniers jours</SelectItem>
                <SelectItem value="30">30 derniers jours</SelectItem>
                <SelectItem value="90">90 derniers jours</SelectItem>
                <SelectItem value="all">Tout l'historique</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Signalements</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalReports}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">En attente</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingReports}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Actions prises</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalActions}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Modérateurs actifs</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.activeModerators}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Signalements par type */}
          <Card>
            <CardHeader>
              <CardTitle>Signalements par type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportsByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribution des actions */}
          <Card>
            <CardHeader>
              <CardTitle>Distribution des actions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={actionDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {actionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Actions au fil du temps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Actions de modération au fil du temps</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={actionsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="warnings" stroke="#f59e0b" name="Avertissements" strokeWidth={2} />
                <Line type="monotone" dataKey="suspensions" stroke="#3b82f6" name="Suspensions" strokeWidth={2} />
                <Line type="monotone" dataKey="bans" stroke="#ef4444" name="Bannissements" strokeWidth={2} />
                <Line type="monotone" dataKey="total" stroke="#8b5cf6" name="Total" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tableaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Modérateurs les plus actifs */}
          <Card>
            <CardHeader>
              <CardTitle>Modérateurs les plus actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topModerators.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">Aucune donnée disponible</p>
                ) : (
                  topModerators.map((moderator, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900">{moderator.name}</span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">{moderator.count}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Raisons de signalement les plus fréquentes */}
          <Card>
            <CardHeader>
              <CardTitle>Raisons de signalement fréquentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topReasons.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">Aucune donnée disponible</p>
                ) : (
                  topReasons.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 flex-1">{item.reason}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(item.count / topReasons[0].count) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-900 w-8 text-right">{item.count}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}