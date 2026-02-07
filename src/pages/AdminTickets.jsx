import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Ticket, Clock, CheckCircle, MessageCircle, User, 
  CreditCard, Settings, AlertTriangle, Send
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const categoryIcons = {
  account: User,
  payment: CreditCard,
  technical: Settings,
  report: AlertTriangle,
  feature: Ticket,
  other: MessageCircle,
};

const statusColors = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  waiting_user: 'bg-purple-100 text-purple-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
};

export default function AdminTickets() {
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState('');

  const { data: tickets = [] } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: () => base44.entities.SupportTicket.list('-created_date', 100),
  });

  const updateTicketMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SupportTicket.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
    },
  });

  const handleReply = () => {
    if (!reply.trim() || !selectedTicket) return;
    
    const newResponses = [
      ...(selectedTicket.responses || []),
      {
        sender: 'support',
        message: reply,
        date: new Date().toISOString(),
      }
    ];
    
    updateTicketMutation.mutate({
      id: selectedTicket.id,
      data: { responses: newResponses, status: 'waiting_user' }
    });
    
    setReply('');
    setSelectedTicket({ ...selectedTicket, responses: newResponses });
  };

  const handleStatusChange = (ticketId, newStatus) => {
    updateTicketMutation.mutate({ id: ticketId, data: { status: newStatus } });
  };

  const openCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar currentPage="AdminTickets" />
      
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tickets Support</h1>
          <p className="text-gray-500 mt-1">Gérez les demandes d'assistance</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Ticket className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{openCount}</p>
                <p className="text-sm text-gray-500">Ouverts</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressCount}</p>
                <p className="text-sm text-gray-500">En cours</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tickets.filter(t => t.status === 'resolved').length}</p>
                <p className="text-sm text-gray-500">Résolus</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-full">
                <MessageCircle className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tickets.length}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-lg shadow">
          {tickets.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Aucun ticket support
            </div>
          ) : (
            <div className="divide-y">
              {tickets.map((ticket) => {
                const CategoryIcon = categoryIcons[ticket.category] || Ticket;
                return (
                  <div 
                    key={ticket.id} 
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <CategoryIcon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{ticket.subject}</h3>
                            <Badge className={statusColors[ticket.status]}>
                              {ticket.status === 'open' && 'Ouvert'}
                              {ticket.status === 'in_progress' && 'En cours'}
                              {ticket.status === 'waiting_user' && 'Attente réponse'}
                              {ticket.status === 'resolved' && 'Résolu'}
                              {ticket.status === 'closed' && 'Fermé'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-1">{ticket.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                            <span>{ticket.user_email}</span>
                            <span>
                              {ticket.created_date && format(new Date(ticket.created_date), 'dd MMM yyyy', { locale: fr })}
                            </span>
                            <span>{(ticket.responses || []).length} réponses</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {ticket.status === 'open' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(ticket.id, 'in_progress');
                            }}
                          >
                            Prendre en charge
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Ticket Detail Dialog */}
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTicket?.subject}</DialogTitle>
            </DialogHeader>
            
            {selectedTicket && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[selectedTicket.status]}>
                    {selectedTicket.status}
                  </Badge>
                  <span className="text-sm text-gray-500">{selectedTicket.user_email}</span>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">{selectedTicket.description}</p>
                </div>
                
                {/* Responses */}
                <div className="space-y-3">
                  {(selectedTicket.responses || []).map((response, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg ${
                        response.sender === 'support' 
                          ? 'bg-amber-50 ml-8' 
                          : 'bg-gray-50 mr-8'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">
                          {response.sender === 'support' ? 'Support' : 'Utilisateur'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {response.date && format(new Date(response.date), 'dd/MM HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm">{response.message}</p>
                    </div>
                  ))}
                </div>
                
                {/* Reply */}
                {selectedTicket.status !== 'closed' && (
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Votre réponse..."
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleReply} className="bg-amber-500 hover:bg-amber-600">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    variant="outline"
                    onClick={() => handleStatusChange(selectedTicket.id, 'resolved')}
                  >
                    Marquer résolu
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleStatusChange(selectedTicket.id, 'closed')}
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}