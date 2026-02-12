import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Inbox, Archive, Star, Tag, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const labelColors = {
  red: 'bg-red-100 text-red-700 border-red-300',
  blue: 'bg-blue-100 text-blue-700 border-blue-300',
  green: 'bg-green-100 text-green-700 border-green-300',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  purple: 'bg-purple-100 text-purple-700 border-purple-300',
  pink: 'bg-pink-100 text-pink-700 border-pink-300',
  orange: 'bg-orange-100 text-orange-700 border-orange-300',
};

export default function ConversationFilter({ 
  currentUserEmail, 
  selectedFolder, 
  onFolderChange,
  selectedLabel,
  onLabelChange 
}) {
  const queryClient = useQueryClient();
  const [showLabelDialog, setShowLabelDialog] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('blue');

  const { data: labels = [] } = useQuery({
    queryKey: ['conversation-labels', currentUserEmail],
    queryFn: () => base44.entities.ConversationLabel.filter({ user_email: currentUserEmail }),
    enabled: !!currentUserEmail,
  });

  const createLabelMutation = useMutation({
    mutationFn: (data) => base44.entities.ConversationLabel.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-labels'] });
      setShowLabelDialog(false);
      setNewLabelName('');
      setNewLabelColor('blue');
      toast.success('Étiquette créée');
    },
  });

  const deleteLabelMutation = useMutation({
    mutationFn: (id) => base44.entities.ConversationLabel.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-labels'] });
      toast.success('Étiquette supprimée');
    },
  });

  const folders = [
    { id: 'inbox', name: 'Boîte de réception', icon: Inbox },
    { id: 'important', name: 'Important', icon: Star },
    { id: 'archive', name: 'Archivées', icon: Archive },
  ];

  return (
    <div className="bg-white border-b p-4 space-y-3">
      {/* Folders */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {folders.map((folder) => {
          const Icon = folder.icon;
          return (
            <Button
              key={folder.id}
              variant={selectedFolder === folder.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFolderChange(folder.id)}
              className={selectedFolder === folder.id ? 'bg-amber-500 hover:bg-amber-600' : ''}
            >
              <Icon className="w-4 h-4 mr-2" />
              {folder.name}
            </Button>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-gray-500" />
        <div className="flex gap-2 flex-wrap flex-1">
          <Button
            variant={!selectedLabel ? 'default' : 'outline'}
            size="sm"
            onClick={() => onLabelChange(null)}
            className={!selectedLabel ? 'bg-amber-500 hover:bg-amber-600' : ''}
          >
            Toutes
          </Button>
          {labels.map((label) => (
            <div key={label.id} className="relative group">
              <Badge
                className={`cursor-pointer ${labelColors[label.color]} ${
                  selectedLabel === label.id ? 'ring-2 ring-amber-500' : ''
                }`}
                onClick={() => onLabelChange(label.id)}
              >
                {label.name}
              </Badge>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Supprimer cette étiquette ?')) {
                    deleteLabelMutation.mutate(label.id);
                  }
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          <Dialog open={showLabelDialog} onOpenChange={setShowLabelDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Nouvelle étiquette
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle étiquette</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nom</label>
                  <Input
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    placeholder="Ex: Favoris, À suivre..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Couleur</label>
                  <Select value={newLabelColor} onValueChange={setNewLabelColor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(labelColors).map((color) => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${labelColors[color]}`} />
                            {color.charAt(0).toUpperCase() + color.slice(1)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => {
                    if (!newLabelName.trim()) return;
                    createLabelMutation.mutate({
                      user_email: currentUserEmail,
                      name: newLabelName,
                      color: newLabelColor,
                    });
                  }}
                  disabled={!newLabelName.trim() || createLabelMutation.isPending}
                  className="w-full"
                >
                  Créer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}