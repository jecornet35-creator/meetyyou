import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  CreditCard, DollarSign, TrendingUp, AlertTriangle, 
  Download, Eye, RefreshCw, Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-orange-100 text-orange-700',
};

export default function AdminTransactions() {
  const queryClient = useQueryClient();
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: transactions = [] } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 500),
  });

  const refundMutation = useMutation({
    mutationFn: ({ id, reason }) => 
      base44.entities.Transaction.update(id, {
        status: 'refunded',
        refund_reason: reason,
        refund_date: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
      setSelectedTransaction(null);
      toast.success('Remboursement effectué');
    },
  });

  const totalRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const pendingTransactions = transactions.filter(t => t.status === 'pending').length;
  const fraudDetected = transactions.filter(t => t.fraud_detected).length;
  const refundedAmount = transactions
    .filter(t => t.status === 'refunded')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const filteredTransactions = transactions.filter(t => 
    t.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefund = (transaction) => {
    const reason = prompt('Raison du remboursement:');
    if (reason) {
      refundMutation.mutate({ id: transaction.id, reason });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar currentPage="AdminTransactions" />
      
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500 mt-1">Gérez les paiements et les remboursements</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalRevenue.toFixed(2)}€</p>
                <p className="text-sm text-gray-500">Revenu total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <CreditCard className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingTransactions}</p>
                <p className="text-sm text-gray-500">En attente</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{fraudDetected}</p>
                <p className="text-sm text-gray-500">Fraudes détectées</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-full">
                <RefreshCw className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{refundedAmount.toFixed(2)}€</p>
                <p className="text-sm text-gray-500">Remboursé</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder="Rechercher par email, ID transaction, facture..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Méthode</TableHead>
                <TableHead>Fraude</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="text-sm">
                    {format(new Date(transaction.created_date), 'dd/MM/yy HH:mm', { locale: fr })}
                  </TableCell>
                  <TableCell className="text-sm">{transaction.user_email}</TableCell>
                  <TableCell className="text-sm">{transaction.plan_name}</TableCell>
                  <TableCell className="font-medium">
                    {transaction.amount}€
                    {transaction.discount_amount > 0 && (
                      <span className="text-xs text-green-600 ml-1">
                        (-{transaction.discount_amount}€)
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[transaction.status]}>
                      {transaction.status === 'pending' && 'En attente'}
                      {transaction.status === 'completed' && 'Complété'}
                      {transaction.status === 'failed' && 'Échoué'}
                      {transaction.status === 'refunded' && 'Remboursé'}
                      {transaction.status === 'cancelled' && 'Annulé'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{transaction.payment_method || '-'}</TableCell>
                  <TableCell>
                    {transaction.fraud_detected ? (
                      <div className="flex items-center gap-1 text-red-600">
                        <Shield className="w-4 h-4" />
                        <span className="text-xs">{transaction.fraud_score}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTransaction(transaction)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {transaction.status === 'completed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleRefund(transaction)}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Transaction Detail Dialog */}
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails de la transaction</DialogTitle>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">ID Transaction:</span>
                    <p>{selectedTransaction.transaction_id || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Facture:</span>
                    <p>{selectedTransaction.invoice_number || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Utilisateur:</span>
                    <p>{selectedTransaction.user_email}</p>
                  </div>
                  <div>
                    <span className="font-medium">Plan:</span>
                    <p>{selectedTransaction.plan_name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Montant:</span>
                    <p>{selectedTransaction.amount}€</p>
                  </div>
                  <div>
                    <span className="font-medium">Fournisseur:</span>
                    <p>{selectedTransaction.payment_provider || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium">IP:</span>
                    <p>{selectedTransaction.ip_address || 'N/A'}</p>
                  </div>
                  {selectedTransaction.promo_code && (
                    <div>
                      <span className="font-medium">Code promo:</span>
                      <p>{selectedTransaction.promo_code}</p>
                    </div>
                  )}
                  {selectedTransaction.fraud_detected && (
                    <div className="col-span-2">
                      <span className="font-medium text-red-600">Fraude détectée:</span>
                      <p className="text-red-600">{selectedTransaction.fraud_reason}</p>
                      <p className="text-sm">Score: {selectedTransaction.fraud_score}/100</p>
                    </div>
                  )}
                  {selectedTransaction.status === 'refunded' && (
                    <div className="col-span-2">
                      <span className="font-medium">Remboursement:</span>
                      <p>{selectedTransaction.refund_reason}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(selectedTransaction.refund_date), 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </p>
                    </div>
                  )}
                </div>
                {selectedTransaction.invoice_url && (
                  <Button className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger la facture
                  </Button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}