import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Check, CheckCheck, ArrowLeft, Flag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ChatWindow({ conversation, currentUser, onBack }) {
  const [newMessage, setNewMessage] = useState('');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const otherParticipant = conversation?.participant_profiles?.find(
    p => p.email !== currentUser?.email
  ) || {};

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', conversation?.id],
    queryFn: () => base44.entities.Message.filter(
      { conversation_id: conversation.id },
      'created_date',
      100
    ),
    enabled: !!conversation?.id,
    refetchInterval: 3000,
  });

  // Real-time subscription
  useEffect(() => {
    if (!conversation?.id) return;

    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.data.conversation_id === conversation.id) {
        queryClient.invalidateQueries({ queryKey: ['messages', conversation.id] });
      }
    });

    return unsubscribe;
  }, [conversation?.id, queryClient]);

  // Mark messages as read
  useEffect(() => {
    if (!messages.length || !currentUser?.email) return;

    const unreadMessages = messages.filter(
      m => !m.is_read && m.sender_email !== currentUser.email
    );

    unreadMessages.forEach(async (msg) => {
      await base44.entities.Message.update(msg.id, {
        is_read: true,
        read_at: new Date().toISOString()
      });
    });

    // Update conversation unread count
    if (unreadMessages.length > 0 && conversation?.id) {
      const newUnreadCount = { ...conversation.unread_count, [currentUser.email]: 0 };
      base44.entities.Conversation.update(conversation.id, { unread_count: newUnreadCount });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  }, [messages, currentUser?.email, conversation, queryClient]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: async (content) => {
      const message = await base44.entities.Message.create({
        conversation_id: conversation.id,
        sender_email: currentUser.email,
        sender_name: currentUser.full_name,
        sender_photo: currentUser.main_photo,
        content,
        is_read: false
      });

      // Update conversation
      const otherEmail = conversation.participants.find(p => p !== currentUser.email);
      const currentUnread = conversation.unread_count?.[otherEmail] || 0;
      
      await base44.entities.Conversation.update(conversation.id, {
        last_message: content,
        last_message_date: new Date().toISOString(),
        last_message_sender: currentUser.email,
        unread_count: {
          ...conversation.unread_count,
          [otherEmail]: currentUnread + 1
        }
      });

      // Create notification
      await base44.entities.Notification.create({
        user_email: otherEmail,
        type: 'message',
        title: `Nouveau message de ${currentUser.full_name || 'Quelqu\'un'}`,
        message: content.substring(0, 100),
        from_profile_name: currentUser.full_name,
        from_profile_photo: currentUser.main_photo,
        is_read: false,
        link: `/Messages?conv=${conversation.id}`
      });

      return message;
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages', conversation.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    sendMutation.mutate(newMessage.trim());
  };

  const reportMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.FlaggedConversation.create({
        conversation_id: conversation.id,
        reporter_email: currentUser.email,
        reporter_name: currentUser.full_name,
        reported_email: otherParticipant.email,
        reported_name: otherParticipant.display_name,
        reason: reportReason,
        description: reportDescription,
        status: 'pending'
      });
    },
    onSuccess: () => {
      toast.success('Conversation signalée');
      setShowReportDialog(false);
      setReportReason('');
      setReportDescription('');
    }
  });

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <p className="text-lg">Sélectionnez une conversation</p>
          <p className="text-sm mt-1">ou commencez-en une nouvelle</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <img
          src={otherParticipant.photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
          alt={otherParticipant.display_name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <h2 className="font-semibold">{otherParticipant.display_name || 'Utilisateur'}</h2>
          <p className="text-xs text-gray-500">En ligne</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setShowReportDialog(true)}
          className="text-gray-500 hover:text-red-600"
        >
          <Flag className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => {
          const isMe = message.sender_email === currentUser?.email;
          return (
            <div
              key={message.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${isMe ? 'order-2' : ''}`}>
                {!isMe && (
                  <img
                    src={message.sender_photo || otherParticipant.photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover mb-1"
                  />
                )}
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    isMe
                      ? 'bg-amber-500 text-white rounded-br-md'
                      : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : ''}`}>
                  <span className="text-xs text-gray-400">
                    {format(new Date(message.created_date), 'HH:mm')}
                  </span>
                  {isMe && (
                    <span className={message.is_read ? 'text-amber-500' : 'text-gray-400'}>
                      {message.is_read ? (
                        <CheckCheck className="w-4 h-4" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="bg-white border-t p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1"
          />
          <Button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600"
            disabled={!newMessage.trim() || sendMutation.isPending}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>

      {/* Dialog signalement */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Signaler cette conversation</DialogTitle>
            <DialogDescription>
              Signalez cette conversation si elle enfreint nos règles de conduite.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Raison du signalement</label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une raison" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="harassment">Harcèlement</SelectItem>
                  <SelectItem value="inappropriate_content">Contenu inapproprié</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="scam">Arnaque</SelectItem>
                  <SelectItem value="fake_profile">Faux profil</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description (optionnel)</label>
              <Textarea
                placeholder="Décrivez le problème..."
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReportDialog(false);
                  setReportReason('');
                  setReportDescription('');
                }}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={() => reportMutation.mutate()}
                variant="destructive"
                className="flex-1"
                disabled={!reportReason || reportMutation.isPending}
              >
                Signaler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}