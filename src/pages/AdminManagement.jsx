import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Shield, Edit, Trash2, UserCog } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminManagement() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    role: 'moderator',
    permissions: {
      users: true,
      photos: true,
      messages: true,
      reports: true,
      verification: true,
      subscriptions: false,
      transactions: false,
      promo_codes: false,
      emails: false,
      tickets: true,
      admin_management: false
    }
  });

  React.useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: adminRoles = [] } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => base44.entities.AdminRole.list('-created_date', 100),
  });

  const { data: myRole } = useQuery({
    queryKey: ['my-admin-role', currentUser?.email],
    queryFn: async () => {
      if (!currentUser) return null;
      const roles = await base44.entities.AdminRole.filter({ user_email: currentUser.email });
      return roles[0] || null;
    },
    enabled: !!currentUser,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AdminRole.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      setIsCreateOpen(false);
      resetForm();
      toast.success('Administrateur créé avec succès');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AdminRole.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      setEditingRole(null);
      toast.success('Permissions mises à jour');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AdminRole.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      toast.success('Administrateur supprimé');
    },
  });

  const resetForm = () => {
    setFormData({
      email: '',
      role: 'moderator',
      permissions: {
        users: true,
        photos: true,
        messages: true,
        reports: true,
        verification: true,
        subscriptions: false,
        transactions: false,
        promo_codes: false,
        emails: false,
        tickets: true,
        admin_management: false
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRole) {
      updateMutation.mutate({ id: editingRole.id, data: formData });
    } else {
      createMutation.mutate({
        user_email: formData.email,
        role: formData.role,
        permissions: formData.permissions,
        is_active: true
      });
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      email: role.user_email,
      role: role.role,
      permissions: role.permissions
    });
    setIsCreateOpen(true);
  };

  const handleToggleActive = (role) => {
    updateMutation.mutate({
      id: role.id,
      data: { is_active: !role.is_active }
    });
  };

  const isAdmin = myRole?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar currentPage="AdminManagement" />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h2>
            <p className="text-gray-600">Seuls les administrateurs peuvent accéder à cette page.</p>
          </div>
        </div>
      </div>
    );
  }

  const permissionLabels = {
    users: 'Gestion des utilisateurs',
    photos: 'Modération des photos',
    messages: 'Messages signalés',
    reports: 'Signalements',
    verification: 'Demandes de vérification',
    subscriptions: 'Gestion des abonnements',
    transactions: 'Transactions',
    promo_codes: 'Codes promo',
    emails: 'Modèles d\'emails',
    tickets: 'Tickets de support',
    admin_management: 'Gestion des administrateurs'
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentPage="AdminManagement" />
      
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des administrateurs</h1>
            <p className="text-gray-500 mt-1">{adminRoles.length} administrateurs et modérateurs</p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) {
              setEditingRole(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-amber-500 hover:bg-amber-600">
                <UserPlus className="w-4 h-4" />
                Nouvel administrateur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingRole ? 'Modifier les permissions' : 'Créer un administrateur'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={!!editingRole}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Rôle</label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrateur (tous les accès)</SelectItem>
                      <SelectItem value="moderator">Modérateur (accès limités)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.role === 'moderator' && (
                  <div>
                    <label className="text-sm font-medium mb-3 block">Permissions</label>
                    <div className="space-y-3 border rounded-lg p-4">
                      {Object.keys(permissionLabels).map(key => (
                        <div key={key} className="flex items-center justify-between">
                          <label className="text-sm text-gray-700">{permissionLabels[key]}</label>
                          <Switch
                            checked={formData.permissions[key]}
                            onCheckedChange={(checked) => setFormData({
                              ...formData,
                              permissions: {...formData.permissions, [key]: checked}
                            })}
                            disabled={key === 'admin_management'}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Note: Seuls les administrateurs peuvent gérer les autres administrateurs
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" className="bg-amber-500 hover:bg-amber-600">
                    {editingRole ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.user_email}</TableCell>
                  <TableCell>
                    <Badge className={role.role === 'admin' ? 'bg-amber-500' : 'bg-blue-500'}>
                      {role.role === 'admin' ? 'Administrateur' : 'Modérateur'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={role.is_active ? 'default' : 'outline'} className={role.is_active ? 'bg-green-500' : ''}>
                      {role.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {role.role === 'admin' ? (
                      <span className="text-sm text-gray-600">Tous les accès</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(role.permissions || {})
                          .filter(([_, value]) => value)
                          .slice(0, 3)
                          .map(([key]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {permissionLabels[key]?.split(' ')[0] || key}
                            </Badge>
                          ))}
                        {Object.values(role.permissions || {}).filter(Boolean).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{Object.values(role.permissions || {}).filter(Boolean).length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(role.created_date).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(role)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(role)}
                      >
                        <UserCog className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(role.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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