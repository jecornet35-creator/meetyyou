import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Flag, Clock, CheckCircle, XCircle, Eye, AlertTriangle, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const reasonLabels = {
  harassment: 'Harcèlement',
  spam: 'Spam',
  inappropriate: 'Contenu inapproprié',
  scam: 'Arnaque / escroquerie',
  other: 'Autre',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  reviewing: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  dismissed: 'bg-gray-100 text-gray-700',
};

const statusLabels = {
  pending: 'En attente',
  reviewing: 'En cours',
  resolved: 'Résolu',
  dismissed: 'Rejeté',
};

export default function AdminFlaggedMessages() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: flagged = [], isLoading } = useQuery({
    queryKey: ['flagged-conversations'],
    queryFn: () => base44.entities.FlaggedConversation.list('-created_date', 100),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FlaggedConversation.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['flagged-conversations'] }),
  });

  const filtered = statusFilter === 'all' ? flagged : flagged.filter(f => f.status === statusFilter);

  const pendingCount = flagged.filter(f => f.status === 'pending').length;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar currentPage="AdminFlaggedMessages" />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Conversations signalées</h1>
          <p className="text-gray-500 mt-1">Examinez les conversations signalées par les utilisateurs</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full"><Clock className="w-6 h-6 text-yellow-600" /></div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-gray-500">En attente</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full"><CheckCircle className="w-6 h-6 text-green-600" /></div>
              <div>
                <p className="text-2xl font-bold">{flagged.filter(f => f.status === 'resolved').length}</p>
                <p className="text-sm text-gray-500">Résolus</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full"><Flag className="w-6 h-6 text-red-600" /></div>
              <div>
                <p className="text-2xl font-bold">{flagged.length}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'reviewing', 'resolved', 'dismissed'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${statusFilter === s ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border'}`}
            >
              {s === 'all' ? 'Tous' : statusLabels[s]}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card><CardContent className="p-12 text-center text-gray-500">Chargement...</CardContent></Card>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-gray-400">
                <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>Aucune conversation signalée</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map(item => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-red-100 rounded-full flex-shrink-0">
                        <Flag className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-gray-900">{reasonLabels[item.reason] || item.reason}</span>
                          <Badge className={statusColors[item.status]}>{statusLabels[item.status]}</Badge>
                        </div>
                        {item.details && (
                          <p className="text-sm text-gray-600 mb-2 italic">"{item.details}"</p>
                        )}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span>Signalé par : <span className="font-medium text-gray-700">{item.reporter_email}</span></span>
                          <span>Signalé : <span className="font-medium text-gray-700">{item.reported_user_name || item.reported_user_email}</span></span>
                          <span>{item.created_date && format(new Date(item.created_date), 'dd MMM yyyy HH:mm', { locale: fr })}</span>
                        </div>
                      </div>
                    </div>

                    {item.status === 'pending' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateMutation.mutate({ id: item.id, data: { status: 'reviewing' } })}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Examiner
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600"
                          onClick={() => updateMutation.mutate({ id: item.id, data: { status: 'resolved' } })}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Résoudre
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateMutation.mutate({ id: item.id, data: { status: 'dismissed' } })}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rejeter
                        </Button>
                      </div>
                    )}
                    {item.status === 'reviewing' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600"
                          onClick={() => updateMutation.mutate({ id: item.id, data: { status: 'resolved' } })}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Résoudre
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateMutation.mutate({ id: item.id, data: { status: 'dismissed' } })}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rejeter
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}