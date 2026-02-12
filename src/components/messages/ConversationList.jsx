import React from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, CheckCheck, Star, Archive, Tag, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

function formatMessageDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return 'Hier';
  return format(date, 'dd/MM/yy');
}

export default function ConversationList({ 
  conversations, 
  currentUserEmail, 
  selectedId, 
  onSelect,
  onUpdateConversation 
}) {
  const { data: labels = [] } = useQuery({
    queryKey: ['conversation-labels', currentUserEmail],
    queryFn: () => base44.entities.ConversationLabel.filter({ user_email: currentUserEmail }),
    enabled: !!currentUserEmail,
  });

  const labelColors = {
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    purple: 'bg-purple-100 text-purple-700',
    pink: 'bg-pink-100 text-pink-700',
    orange: 'bg-orange-100 text-orange-700',
  };

  const handleFolderChange = async (convId, folder) => {
    const conv = conversations.find(c => c.id === convId);
    await base44.entities.Conversation.update(convId, {
      folder: { ...conv.folder, [currentUserEmail]: folder }
    });
    onUpdateConversation?.();
  };

  const handleLabelToggle = async (convId, labelId) => {
    const conv = conversations.find(c => c.id === convId);
    const currentLabels = conv.labels?.[currentUserEmail] || [];
    const newLabels = currentLabels.includes(labelId)
      ? currentLabels.filter(l => l !== labelId)
      : [...currentLabels, labelId];
    
    await base44.entities.Conversation.update(convId, {
      labels: { ...conv.labels, [currentUserEmail]: newLabels }
    });
    onUpdateConversation?.();
  };

  return (
    <div className="divide-y">
      {conversations.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p>Aucune conversation</p>
          <p className="text-sm mt-1">Commencez à discuter avec quelqu'un!</p>
        </div>
      ) : (
        conversations.map((conv) => {
          const otherParticipant = conv.participant_profiles?.find(
            p => p.email !== currentUserEmail
          ) || {};
          const unreadCount = conv.unread_count?.[currentUserEmail] || 0;
          const isSelected = selectedId === conv.id;
          const isSentByMe = conv.last_message_sender === currentUserEmail;
          const folder = conv.folder?.[currentUserEmail] || 'inbox';
          const convLabels = conv.labels?.[currentUserEmail] || [];

          return (
            <div
              key={conv.id}
              className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors ${
                isSelected ? 'bg-amber-50 border-l-4 border-amber-500' : ''
              }`}
            >
              <div 
                className="flex-1 flex items-center gap-3 cursor-pointer min-w-0"
                onClick={() => onSelect(conv)}
              >
                <div className="relative">
                  <img
                    src={otherParticipant.photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
                    alt={otherParticipant.display_name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[20px] h-5">
                      {unreadCount}
                    </Badge>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold truncate ${unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                        {otherParticipant.display_name || 'Utilisateur'}
                      </h3>
                      {folder === 'important' && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                      {folder === 'archive' && <Archive className="w-4 h-4 text-gray-400" />}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatMessageDate(conv.last_message_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {isSentByMe && (
                      <span className="text-gray-400">
                        <CheckCheck className="w-4 h-4" />
                      </span>
                    )}
                    <p className={`text-sm truncate ${unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {conv.last_message || 'Nouvelle conversation'}
                    </p>
                  </div>
                  {convLabels.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {convLabels.map(labelId => {
                        const label = labels.find(l => l.id === labelId);
                        if (!label) return null;
                        return (
                          <Badge key={labelId} className={`text-xs ${labelColors[label.color]}`}>
                            {label.name}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleFolderChange(conv.id, 'important')}>
                    <Star className="w-4 h-4 mr-2" />
                    Marquer comme important
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFolderChange(conv.id, 'archive')}>
                    <Archive className="w-4 h-4 mr-2" />
                    Archiver
                  </DropdownMenuItem>
                  {folder !== 'inbox' && (
                    <DropdownMenuItem onClick={() => handleFolderChange(conv.id, 'inbox')}>
                      <Archive className="w-4 h-4 mr-2" />
                      Retour à la boîte de réception
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Tag className="w-4 h-4 mr-2" />
                      Étiquettes
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {labels.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">Aucune étiquette</div>
                      ) : (
                        labels.map(label => (
                          <DropdownMenuItem 
                            key={label.id}
                            onClick={() => handleLabelToggle(conv.id, label.id)}
                          >
                            <div className={`w-3 h-3 rounded mr-2 ${labelColors[label.color]}`} />
                            {label.name}
                            {convLabels.includes(label.id) && <Check className="w-4 h-4 ml-auto" />}
                          </DropdownMenuItem>
                        ))
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })
      )}
    </div>
  );
}