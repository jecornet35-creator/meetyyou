import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Check, CheckCheck, ArrowLeft, Languages, Loader2, Smile, Image as ImageIcon, X, Flag } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import BlockButton from '@/components/block/BlockButton';
import EmojiPicker from './EmojiPicker';
import OnlineIndicator from './OnlineIndicator';

export default function ChatWindow({ conversation, currentUser, onBack }) {
  const [newMessage, setNewMessage] = useState('');
  const [translations, setTranslations] = useState({});
  const [translating, setTranslating] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [otherUserProfile, setOtherUserProfile] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('harassment');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const otherParticipant = conversation?.participant_profiles?.find(
    p => p.email !== currentUser?.email
  ) || {};

  // Fetch other user's profile for real online status
  useEffect(() => {
    if (!otherParticipant?.email) return;
    base44.entities.Profile.filter({ created_by: otherParticipant.email })
      .then(results => setOtherUserProfile(results[0] || null))
      .catch(() => {});
  }, [otherParticipant?.email]);

  // Update current user's online status
  useEffect(() => {
    if (!currentUser?.email) return;
    const updateOnline = async () => {
      const profiles = await base44.entities.Profile.filter({ created_by: currentUser.email });
      if (profiles[0]) {
        await base44.entities.Profile.update(profiles[0].id, {
          is_online: true,
          last_seen: new Date().toISOString()
        });
      }
    };
    updateOnline();
    const interval = setInterval(updateOnline, 60000);
    return () => clearInterval(interval);
  }, [currentUser?.email]);

  const translateMessage = async (messageId, content) => {
    if (translations[messageId]) {
      setTranslations(prev => { const n = { ...prev }; delete n[messageId]; return n; });
      return;
    }
    setTranslating(prev => ({ ...prev, [messageId]: true }));
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Traduis ce message en français. Réponds uniquement avec la traduction, sans explication ni guillemets.\n\nMessage: ${content}`,
    });
    setTranslations(prev => ({ ...prev, [messageId]: result }));
    setTranslating(prev => { const n = { ...prev }; delete n[messageId]; return n; });
  };

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', conversation?.id],
    queryFn: () => base44.entities.Message.filter({ conversation_id: conversation.id }, 'created_date', 100),
    enabled: !!conversation?.id,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.data.conversation_id === conversation.id) {
        queryClient.invalidateQueries({ queryKey: ['messages', conversation.id] });
      }
    });
    return unsubscribe;
  }, [conversation?.id, queryClient]);

  useEffect(() => {
    if (!messages.length || !currentUser?.email) return;
    const unreadMessages = messages.filter(m => !m.is_read && m.sender_email !== currentUser.email);
    unreadMessages.forEach(async (msg) => {
      await base44.entities.Message.update(msg.id, { is_read: true, read_at: new Date().toISOString() });
    });
    if (unreadMessages.length > 0 && conversation?.id) {
      const newUnreadCount = { ...conversation.unread_count, [currentUser.email]: 0 };
      base44.entities.Conversation.update(conversation.id, { unread_count: newUnreadCount });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  }, [messages, currentUser?.email, conversation, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const sendMutation = useMutation({
    mutationFn: async ({ content, imageUrl }) => {
      const finalContent = imageUrl ? (content ? `${content}\n[IMAGE:${imageUrl}]` : `[IMAGE:${imageUrl}]`) : content;

      const message = await base44.entities.Message.create({
        conversation_id: conversation.id,
        sender_email: currentUser.email,
        sender_name: currentUser.full_name,
        sender_photo: currentUser.main_photo,
        content: finalContent,
        is_read: false
      });

      const otherEmail = conversation.participants.find(p => p !== currentUser.email);
      const currentUnread = conversation.unread_count?.[otherEmail] || 0;

      await base44.entities.Conversation.update(conversation.id, {
        last_message: imageUrl && !content ? '📷 Image' : content,
        last_message_date: new Date().toISOString(),
        last_message_sender: currentUser.email,
        unread_count: { ...conversation.unread_count, [otherEmail]: currentUnread + 1 }
      });

      await base44.entities.Notification.create({
        user_email: otherEmail,
        type: 'message',
        title: `Nouveau message de ${currentUser.full_name || 'Quelqu\'un'}`,
        message: imageUrl && !content ? '📷 Image envoyée' : content.substring(0, 100),
        from_profile_name: currentUser.full_name,
        from_profile_photo: currentUser.main_photo,
        is_read: false,
        link: `/Messages?conv=${conversation.id}`
      });

      return message;
    },
    onSuccess: () => {
      setNewMessage('');
      setImagePreview(null);
      setImageFile(null);
      queryClient.invalidateQueries({ queryKey: ['messages', conversation.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !imageFile) return;

    let imageUrl = null;
    if (imageFile) {
      setUploadingImage(true);
      const result = await base44.integrations.Core.UploadFile({ file: imageFile });
      imageUrl = result.file_url;
      setUploadingImage(false);
    }

    sendMutation.mutate({ content: newMessage.trim(), imageUrl });
  };

  const isPending = sendMutation.isPending || uploadingImage;

  // Parse message content for images
  const parseMessageContent = (content) => {
    if (!content) return { text: '', images: [] };
    const imageRegex = /\[IMAGE:(.*?)\]/g;
    const images = [];
    let match;
    while ((match = imageRegex.exec(content)) !== null) {
      images.push(match[1]);
    }
    const text = content.replace(imageRegex, '').trim();
    return { text, images };
  };

  const handleReport = async () => {
    setReportSubmitting(true);
    await base44.entities.FlaggedConversation.create({
      conversation_id: conversation.id,
      reporter_email: currentUser.email,
      reported_user_email: otherParticipant.email,
      reported_user_name: otherParticipant.display_name,
      reason: reportReason,
      details: reportDetails,
      status: 'pending',
    });
    setReportSubmitting(false);
    setShowReportModal(false);
    setReportDetails('');
  };

  const isOnline = otherUserProfile?.is_online;
  const lastSeen = otherUserProfile?.last_seen
    ? formatDistanceToNow(new Date(otherUserProfile.last_seen), { addSuffix: true, locale: fr })
    : null;

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
    <div className="flex-1 flex flex-col h-full" onClick={() => setShowEmojiPicker(false)}>
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="relative">
          <img
            src={otherParticipant.photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
            alt={otherParticipant.display_name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="absolute bottom-0 right-0">
            <OnlineIndicator isOnline={isOnline} lastSeen={lastSeen} />
          </span>
        </div>
        <div className="flex-1">
          <h2 className="font-semibold">{otherParticipant.display_name || 'Utilisateur'}</h2>
          <p className="text-xs text-gray-500">
            {isOnline ? (
              <span className="text-green-500 font-medium">● En ligne</span>
            ) : lastSeen ? (
              `Vu ${lastSeen}`
            ) : 'Hors ligne'}
          </p>
        </div>
        <BlockButton
          targetProfile={{ created_by: otherParticipant.email, id: null, display_name: otherParticipant.display_name, main_photo: otherParticipant.photo }}
          currentUserEmail={currentUser?.email}
          size="sm"
          variant="ghost"
        />
        <button
          onClick={() => setShowReportModal(true)}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
          title="Signaler la conversation"
        >
          <Flag className="w-4 h-4" />
        </button>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowReportModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-gray-900 mb-1">Signaler la conversation</h3>
            <p className="text-sm text-gray-500 mb-4">Votre signalement sera examiné par notre équipe.</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Raison</label>
              <select
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="harassment">Harcèlement</option>
                <option value="spam">Spam</option>
                <option value="inappropriate">Contenu inapproprié</option>
                <option value="scam">Arnaque / escroquerie</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Détails (optionnel)</label>
              <textarea
                value={reportDetails}
                onChange={e => setReportDetails(e.target.value)}
                rows={3}
                placeholder="Décrivez le problème..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleReport}
                disabled={reportSubmitting}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {reportSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
                Signaler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => {
          const isMe = message.sender_email === currentUser?.email;
          const { text, images } = parseMessageContent(message.content);
          return (
            <div key={message.id} className={`flex group ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${isMe ? 'order-2' : ''}`}>
                {!isMe && (
                  <img
                    src={message.sender_photo || otherParticipant.photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover mb-1"
                  />
                )}
                {/* Images */}
                {images.map((imgUrl, idx) => (
                  <div key={idx} className="mb-1">
                    <img
                      src={imgUrl}
                      alt="Image partagée"
                      className="max-w-full rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ maxHeight: '250px', objectFit: 'cover' }}
                      onClick={() => window.open(imgUrl, '_blank')}
                    />
                  </div>
                ))}
                {/* Text */}
                {text && (
                  <div className={`rounded-2xl px-4 py-2 ${isMe ? 'bg-amber-500 text-white rounded-br-md' : 'bg-white text-gray-900 rounded-bl-md shadow-sm'}`}>
                    <p className="text-sm whitespace-pre-wrap">{text}</p>
                    {translations[message.id] && (
                      <p className={`text-sm mt-1 pt-1 border-t italic ${isMe ? 'border-amber-400 text-amber-100' : 'border-gray-200 text-gray-500'}`}>
                        {translations[message.id]}
                      </p>
                    )}
                  </div>
                )}
                {/* Translate button */}
                {text && (
                  <button
                    onClick={() => translateMessage(message.id, text)}
                    disabled={translating[message.id]}
                    className={`mt-1 flex items-center gap-1 text-xs transition-colors ${isMe ? 'text-amber-600 hover:text-amber-700 ml-auto' : 'text-gray-400 hover:text-gray-600'} ${translations[message.id] ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                  >
                    {translating[message.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
                    {translations[message.id] ? 'Masquer' : 'Traduire'}
                  </button>
                )}
                <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : ''}`}>
                  <span className="text-xs text-gray-400">
                    {format(new Date(message.created_date), 'HH:mm')}
                  </span>
                  {isMe && (
                    <span className={message.is_read ? 'text-amber-500' : 'text-gray-400'}>
                      {message.is_read ? <CheckCheck className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div className="bg-white border-t px-4 pt-3">
          <div className="relative inline-block">
            <img src={imagePreview} alt="Aperçu" className="h-20 rounded-lg object-cover" />
            <button
              onClick={() => { setImagePreview(null); setImageFile(null); }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="bg-white border-t p-3 relative">
        {/* Emoji picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-3 z-50">
            <EmojiPicker
              onSelect={(emoji) => { setNewMessage(prev => prev + emoji); setShowEmojiPicker(false); }}
              onClose={() => setShowEmojiPicker(false)}
            />
          </div>
        )}
        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(v => !v); }}
            className="text-gray-400 hover:text-amber-500 transition-colors flex-shrink-0"
          >
            <Smile className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-400 hover:text-amber-500 transition-colors flex-shrink-0"
          >
            <ImageIcon className="w-6 h-6" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
          />
          <Button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 flex-shrink-0"
            disabled={(!newMessage.trim() && !imageFile) || isPending}
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
      </form>
    </div>
  );
}