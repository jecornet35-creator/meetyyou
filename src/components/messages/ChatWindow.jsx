import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Check, CheckCheck, ArrowLeft, Flag, Paperclip, X, Image as ImageIcon, File } from 'lucide-react';
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
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
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

  // Real-time subscription for messages
  useEffect(() => {
    if (!conversation?.id) return;

    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.data.conversation_id === conversation.id) {
        queryClient.invalidateQueries({ queryKey: ['messages', conversation.id] });
      }
    });

    return unsubscribe;
  }, [conversation?.id, queryClient]);

  // Real-time subscription for typing indicator
  useEffect(() => {
    if (!conversation?.id) return;

    const unsubscribe = base44.entities.Conversation.subscribe((event) => {
      if (event.data.id === conversation.id && event.type === 'update') {
        const otherEmail = conversation.participants.find(p => p !== currentUser?.email);
        const isOtherTyping = event.data.is_typing?.[otherEmail];
        setOtherUserTyping(isOtherTyping || false);
      }
    });

    return unsubscribe;
  }, [conversation?.id, conversation?.participants, currentUser?.email]);

  // Handle typing indicator
  useEffect(() => {
    if (!conversation?.id || !currentUser?.email) return;

    if (isTyping) {
      base44.entities.Conversation.update(conversation.id, {
        is_typing: {
          ...conversation.is_typing,
          [currentUser.email]: true
        },
        last_typing_update: new Date().toISOString()
      });
    }

    return () => {
      if (isTyping) {
        base44.entities.Conversation.update(conversation.id, {
          is_typing: {
            ...conversation.is_typing,
            [currentUser.email]: false
          }
        });
      }
    };
  }, [isTyping, conversation?.id, currentUser?.email]);

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

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limit to 10MB
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Le fichier est trop volumineux (max 10MB)');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

  const sendMutation = useMutation({
    mutationFn: async ({ content, file }) => {
      let fileUrl = null;
      let fileName = null;
      let fileSize = null;
      let messageType = 'text';

      if (file) {
        setUploading(true);
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        fileUrl = file_url;
        fileName = file.name;
        fileSize = file.size;
        messageType = file.type.startsWith('image/') ? 'image' : 'file';
      }

      const message = await base44.entities.Message.create({
        conversation_id: conversation.id,
        sender_email: currentUser.email,
        sender_name: currentUser.full_name,
        sender_photo: currentUser.main_photo,
        content: content || (file ? fileName : ''),
        message_type: messageType,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
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
      setSelectedFile(null);
      setUploading(false);
      setIsTyping(false);
      queryClient.invalidateQueries({ queryKey: ['messages', conversation.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => {
      setUploading(false);
    }
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;
    sendMutation.mutate({ content: newMessage.trim(), file: selectedFile });
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
          <p className="text-xs text-gray-500">
            {otherUserTyping ? (
              <span className="text-amber-600 italic">En train d'écrire...</span>
            ) : (
              'En ligne'
            )}
          </p>
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
                  {message.message_type === 'image' && message.file_url ? (
                    <div className="space-y-2">
                      <img 
                        src={message.file_url} 
                        alt={message.file_name}
                        className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
                        onClick={() => window.open(message.file_url, '_blank')}
                      />
                      {message.content && <p className="text-sm">{message.content}</p>}
                    </div>
                  ) : message.message_type === 'file' && message.file_url ? (
                    <a 
                      href={message.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:underline"
                    >
                      <File className="w-4 h-4" />
                      <div>
                        <p className="text-sm font-medium">{message.file_name}</p>
                        {message.file_size && (
                          <p className="text-xs opacity-75">
                            {(message.file_size / 1024).toFixed(1)} KB
                          </p>
                        )}
                      </div>
                    </a>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
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
        {selectedFile && (
          <div className="mb-2 p-2 bg-gray-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedFile.type.startsWith('image/') ? (
                <ImageIcon className="w-4 h-4 text-amber-600" />
              ) : (
                <File className="w-4 h-4 text-amber-600" />
              )}
              <span className="text-sm">{selectedFile.name}</span>
              <span className="text-xs text-gray-500">
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFile(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Écrivez votre message..."
            className="flex-1"
            disabled={uploading}
          />
          <Button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600"
            disabled={(!newMessage.trim() && !selectedFile) || sendMutation.isPending || uploading}
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
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