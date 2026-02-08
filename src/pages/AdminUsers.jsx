import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, MoreVertical, Eye, Ban, CheckCircle, Trash2, 
  UserCheck, Mail, Filter, Download
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['admin-all-profiles'],
    queryFn: () => base44.entities.Profile.list('-created_date', 500),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Profile.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-all-profiles'] }),
  });

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = !search || 
      profile.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      profile.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      profile.city?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'verified' && profile.is_verified) ||
      (statusFilter === 'online' && profile.is_online) ||
      (statusFilter === 'unverified' && !profile.is_verified);
    
    return matchesSearch && matchesStatus;
  });

  const handleVerify = (profile) => {
    updateProfileMutation.mutate({ id: profile.id, data: { is_verified: !profile.is_verified } });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar currentPage="AdminUsers" />
      
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
            <p className="text-gray-500 mt-1">{profiles.length} utilisateurs au total</p>
          </div>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, ville..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'verified', 'unverified', 'online'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className={statusFilter === status ? 'bg-amber-500 hover:bg-amber-600' : ''}
                >
                  {status === 'all' && 'Tous'}
                  {status === 'verified' && 'Vérifiés'}
                  {status === 'unverified' && 'Non vérifiés'}
                  {status === 'online' && 'En ligne'}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Inscription</TableHead>
                <TableHead>Dernière connexion</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={profile.main_photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{profile.display_name || profile.first_name}</p>
                        <p className="text-sm text-gray-500">{profile.gender}, {profile.age} ans</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{profile.city || '-'}</p>
                    <p className="text-xs text-gray-500">{profile.country || '-'}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {profile.is_verified && (
                        <Badge className="bg-green-100 text-green-700">Vérifié</Badge>
                      )}
                      {profile.is_online && (
                        <Badge className="bg-blue-100 text-blue-700">En ligne</Badge>
                      )}
                      {!profile.is_verified && !profile.is_online && (
                        <Badge variant="outline">Standard</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {profile.created_date ? format(new Date(profile.created_date), 'dd MMM yyyy', { locale: fr }) : '-'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {profile.last_seen ? format(new Date(profile.last_seen), 'dd/MM HH:mm', { locale: fr }) : '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" asChild>
                          <a href={`/AdminUserProfile?id=${profile.id}`}>
                            <Eye className="w-4 h-4" />
                            Voir le profil
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2" onClick={() => handleVerify(profile)}>
                          <UserCheck className="w-4 h-4" />
                          {profile.is_verified ? 'Retirer vérification' : 'Vérifier profil'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Mail className="w-4 h-4" />
                          Envoyer un message
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-orange-600">
                          <Ban className="w-4 h-4" />
                          Suspendre
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-red-600">
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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