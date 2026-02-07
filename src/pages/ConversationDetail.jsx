import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, MoreVertical } from 'lucide-react';
import Header from '@/components/layout/Header';
import { toast } from 'sonner';

export default function ConversationDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const otherProfileId = urlParams.get('profileId');
  const queryClient = useQueryClient();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [messageContent, setMessageContent] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(async (user) => {
      setCurrentUser(user);
      const profiles = await base44.entities.Profile.filter({ created_by: user.email });
      if (profiles[0]) {
        setMyProfile(profiles[0]);
      }
    });
  }, []);

  const { data: otherProfile } = useQuery({
    queryKey: ['profile', otherProfileId],
    queryFn: async () => {
      const profiles = await base44.entities.Profile.filter({ id: otherProfileId });
      return profiles[0];
    },
    enabled: !!otherProfileId,
  });

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', myProfile?.id, otherProfileId],
    queryFn: async () => {
      if (!myProfile) return [];
      
      // Récupérer les messages envoyés et reçus entre les deux profils
      const sentMessages = await base44.entities.Message.filter({
        sender_id: myProfile.id,
        receiver_id: otherProfileId,
      });
      
      const receivedMessages = await base44.entities.Message.filter({
        sender_id: otherProfileId,
        receiver_id: myProfile.id,
      });
      
      // Combiner et trier par timestamp
      const allMessages = [...sentMessages, ...receivedMessages];
      return allMessages.sort((a, b) => 
        new Date(a.timestamp || a.created_date) - new Date(b.timestamp || b.created_date)
      );
    },
    enabled: !!myProfile && !!otherProfileId,
    refetchInterval: 3000, // Rafraîchir toutes les 3 secondes
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      if (!myProfile || !otherProfile) return;
      
      await base44.entities.Message.create({
        sender_id: myProfile.id,
        receiver_id: otherProfileId,
        sender_email: currentUser.email,
        receiver_email: otherProfile.created_by,
        content,
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setMessageContent('');
      toast.success('Message envoyé');
    },
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageContent.trim()) {
      sendMessageMutation.mutate(messageContent);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!myProfile || !otherProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      {/* Conversation Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Messages')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <img
              src={otherProfile.main_photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
              alt={otherProfile.display_name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h2 className="font-semibold text-gray-900">{otherProfile.display_name}</h2>
              <p className="text-xs text-gray-500">
                {otherProfile.is_online ? 'En ligne' : 'Hors ligne'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {isLoading ? (
            <div className="text-center text-gray-500">Chargement des messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Aucun message pour le moment. Commencez la conversation !
            </div>
          ) : (
            messages.map((message) => {
              const isMyMessage = message.sender_id === myProfile.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isMyMessage
                        ? 'bg-amber-500 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isMyMessage ? 'text-amber-100' : 'text-gray-400'
                      }`}
                    >
                      {new Date(message.timestamp || message.created_date).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Écrivez votre message..."
              className="flex-1 resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <Button
              type="submit"
              disabled={!messageContent.trim() || sendMessageMutation.isPending}
              className="bg-amber-500 hover:bg-amber-600"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}