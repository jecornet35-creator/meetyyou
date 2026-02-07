import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  CreditCard, Crown, Star, User, TrendingUp, DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const planColors = {
  free: 'bg-gray-100 text-gray-700',
  premium: 'bg-amber-100 text-amber-700',
  vip: 'bg-purple-100 text-purple-700',
};

const statusColors = {
  active: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-700',
};

export default function AdminSubscriptions() {
  const { data: subscriptions = [] } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: () => base44.entities.Subscription.list('-created_date', 200),
  });

  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const premiumCount = subscriptions.filter(s => s.plan === 'premium' && s.status === 'active').length;
  const vipCount = subscriptions.filter(s => s.plan === 'vip' && s.status === 'active').length;
  const totalRevenue = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar currentPage="AdminSubscriptions" />
      
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Abonnements</h1>
          <p className="text-gray-500 mt-1">Gérez les abonnements des utilisateurs</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-sm text-gray-500">Abonnements actifs</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <Star className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{premiumCount}</p>
                <p className="text-sm text-gray-500">Premium</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vipCount}</p>
                <p className="text-sm text-gray-500">VIP</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalRevenue}€</p>
                <p className="text-sm text-gray-500">Revenu mensuel</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Début</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Renouvellement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{sub.user_email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={planColors[sub.plan]}>
                      {sub.plan === 'free' && 'Gratuit'}
                      {sub.plan === 'premium' && 'Premium'}
                      {sub.plan === 'vip' && 'VIP'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[sub.status]}>
                      {sub.status === 'active' && 'Actif'}
                      {sub.status === 'cancelled' && 'Annulé'}
                      {sub.status === 'expired' && 'Expiré'}
                      {sub.status === 'pending' && 'En attente'}
                    </Badge>
                  </TableCell>
                  <TableCell>{sub.amount ? `${sub.amount}€` : '-'}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {sub.start_date ? format(new Date(sub.start_date), 'dd/MM/yy', { locale: fr }) : '-'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {sub.end_date ? format(new Date(sub.end_date), 'dd/MM/yy', { locale: fr }) : '-'}
                  </TableCell>
                  <TableCell>
                    {sub.auto_renew ? (
                      <Badge className="bg-green-100 text-green-700">Auto</Badge>
                    ) : (
                      <Badge variant="outline">Manuel</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}