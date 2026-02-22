import React from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Check, CheckCheck } from 'lucide-react';
import OnlineIndicator from './OnlineIndicator';

function formatMessageDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return 'Hier';
  return format(date, 'dd/MM/yy');
}

export default function ConversationList({ conversations, currentUserEmail, selectedId, onSelect }) {
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

          return (
            <div
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                isSelected ? 'bg-amber-50 border-l-4 border-amber-500' : ''
              }`}
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
                  <h3 className={`font-semibold truncate ${unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                    {otherParticipant.display_name || 'Utilisateur'}
                  </h3>
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
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}