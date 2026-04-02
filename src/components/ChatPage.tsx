import { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Send, 
  MoreVertical, 
  Image as ImageIcon, 
  Smile,
  Check,
  CheckCheck,
  Lock,
  Trash2,
  Flag,
  AlertTriangle,
  X,
  Languages,
  RotateCcw,
  UserX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { GoogleGenAI } from "@google/genai";

export default function ChatPage({ 
  profile, 
  isSubscribed, 
  onBack, 
  onSubscriptionClick,
  socket, 
  currentUserEmail = 'jlcornet878@gmail.com',
  currentUserName = 'Moi'
}) {
  const [message, setMessage] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [translatingId, setTranslatingId] = useState(null);
  const typingTimeoutRef = useRef(null);

  const messagesEndRef = useRef(null);
  const myEmail = currentUserEmail;
  const myName = currentUserName;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchConversationAndMessages = async () => {
      setLoading(true);
      try {
        const blockedUsers = await api.get('blocked_users') || [];
        if (blockedUsers.includes(profile.id)) {
          setIsBlocked(true);
          setLoading(false);
          return;
        }

        const allConversations = await api.get('conversations');
        
        const conv = allConversations.find(c => 
          c.participants.includes(myEmail) && 
          (c.participants.includes(profile.email) || c.participants.includes(profile.id))
        );

        if (conv) {
          setConversationId(conv.id);
          const allMessages = await api.get('messages');
          const convMessages = allMessages.filter(m => m.conversation_id === conv.id);
          
          // Mark unread messages as read
          const unreadMessages = convMessages.filter(m => m.sender_email !== myEmail && !m.is_read);
          if (unreadMessages.length > 0) {
            const updatedAllMessages = allMessages.map(m => 
              m.conversation_id === conv.id && m.sender_email !== myEmail ? { ...m, is_read: true } : m
            );
            await api.save('messages', updatedAllMessages);
            
            // Notify sender
            if (socket) {
              socket.emit('message:read', {
                conversation_id: conv.id,
                sender_email: profile.email || profile.id,
                recipient_email: myEmail
              });
            }
          }

          const mappedMessages = convMessages.map(m => ({
            id: m.id,
            text: m.content,
            sender: m.sender_email === myEmail ? 'me' : 'them',
            time: new Date(m.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: m.is_read ? 'read' : 'sent'
          }));
          setMessages(mappedMessages);
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error("Error fetching chat data:", error);
        toast.error("Erreur lors du chargement des messages");
      } finally {
        setLoading(false);
      }
    };

    fetchConversationAndMessages();
  }, [profile, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      if (data.conversation_id === conversationId) {
        setMessages(prev => [...prev, {
          id: data.id,
          text: data.content,
          sender: 'them',
          time: new Date(data.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read' // If we're receiving it while chat is open, it's read
        }]);

        // Emit read status back
        socket.emit('message:read', {
          conversation_id: conversationId,
          sender_email: profile.email || profile.id,
          recipient_email: myEmail
        });
      }
    };

    const handleStatusUpdate = (data) => {
      if (data.conversation_id === conversationId && data.status === 'read') {
        setMessages(prev => prev.map(m => 
          m.sender === 'me' ? { ...m, status: 'read' } : m
        ));
      }
    };

    socket.on('message:received', handleNewMessage);
    socket.on('message:status_update', handleStatusUpdate);
    socket.on('user:typing', (data) => {
      if (data.conversation_id === conversationId && data.sender_email !== myEmail) {
        setIsOtherTyping(data.is_typing);
      }
    });

    return () => {
      socket.off('message:received', handleNewMessage);
      socket.off('message:status_update', handleStatusUpdate);
      socket.off('user:typing');
    };
  }, [socket, conversationId, profile]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOtherTyping]);

  const handleTyping = () => {
    if (!socket || !conversationId) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('user:typing', {
        conversation_id: conversationId,
        sender_email: myEmail,
        recipient_email: profile.email || profile.id,
        is_typing: true
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('user:typing', {
        conversation_id: conversationId,
        sender_email: myEmail,
        recipient_email: profile.email || profile.id,
        is_typing: false
      });
    }, 3000);
  };

  const handleBlockUser = async () => {
    if (window.confirm(`Voulez-vous vraiment bloquer ${profile.name} ? Vous ne pourrez plus échanger de messages.`)) {
      try {
        await api.blockUser(profile.id);
        
        // Delete conversation if it exists
        if (conversationId) {
          await api.deleteConversation(conversationId);
        }
        
        setMessages([]);
        setIsBlocked(true);
        setIsMenuOpen(false);
        toast.success(`${profile.name} a été bloqué`);
      } catch (error) {
        console.error("Error blocking user:", error);
        toast.error("Erreur lors du blocage");
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    let currentConvId = conversationId;

    try {
      if (!currentConvId) {
        const newConv = await api.add('conversations', {
          participants: [myEmail, profile.email || profile.id],
          last_message: message,
          unread_count: 0,
          updated_date: new Date().toISOString()
        });
        currentConvId = newConv.id;
        setConversationId(currentConvId);
      }

      const apiMessage = {
        conversation_id: currentConvId,
        sender_name: myName,
        sender_email: myEmail,
        content: message,
        is_read: false,
        created_date: new Date().toISOString()
      };

      const savedMessage = await api.add('messages', apiMessage);

      // Emit via socket
      if (socket) {
        socket.emit('message:send', {
          ...apiMessage,
          id: savedMessage.id,
          recipient_email: profile.email || profile.id
        });
      }

      const newMessage = {
        id: savedMessage.id,
        text: message,
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent'
      };

      setMessages([...messages, newMessage]);
      setMessage('');
      
      const allConvs = await api.get('conversations');
      const updatedConvs = allConvs.map(c => 
        c.id === currentConvId 
          ? { ...c, last_message: message, updated_date: new Date().toISOString() }
          : c
      );
      await api.save('conversations', updatedConvs);

    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi");
    }
  };

  const handleDeleteMessage = async (id) => {
    if (window.confirm("Supprimer ce message ?")) {
      try {
        await api.remove('messages', id);
        setMessages(messages.filter(m => m.id !== id));
        toast.success("Message supprimé");
      } catch (error) {
        console.error("Error deleting message:", error);
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const handleReportConversation = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;

    try {
      const reports = await api.get('conversation_reports') || [];
      const newReport = {
        id: Date.now(),
        reporter_email: 'jlcornet878@gmail.com', // Current user
        reported_profile_id: profile.id,
        reported_profile_name: profile.name,
        reported_profile_photo: profile.photo,
        reason: reportReason,
        status: 'En attente',
        created_at: new Date().toISOString(),
        messages: messages.slice(-5) // Send last 5 messages for context
      };

      await api.save('conversation_reports', [...reports, newReport]);
      toast.success("Conversation signalée aux modérateurs");
      setIsReportModalOpen(false);
      setReportReason('');
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Failed to report conversation:", error);
      toast.error("Erreur lors du signalement");
    }
  };

  const handleTranslate = async (msgId, text) => {
    setTranslatingId(msgId);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Translate the following message to French. Only return the translated text, nothing else: "${text}"`,
      });

      const translatedText = response.text;
      
      setMessages(prev => prev.map(m => 
        m.id === msgId ? { ...m, translatedText, showOriginal: false } : m
      ));
      toast.success("Message traduit");
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("Erreur lors de la traduction");
    } finally {
      setTranslatingId(null);
    }
  };

  const toggleOriginal = (msgId) => {
    setMessages(prev => prev.map(m => 
      m.id === msgId ? { ...m, showOriginal: !m.showOriginal } : m
    ));
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] sm:h-[calc(100vh-140px)] flex flex-col bg-white sm:rounded-3xl shadow-xl border-x border-b sm:border border-neutral-200 overflow-hidden">
      {/* Chat Header */}
      <div className="px-3 sm:px-6 py-3 sm:py-4 bg-white border-b border-neutral-100 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={onBack}
            className="p-1.5 sm:p-2 hover:bg-neutral-50 rounded-full text-neutral-500 transition-colors"
          >
            <ArrowLeft className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
          </button>
          <div className="relative">
            <img 
              src={profile.photo} 
              alt={profile.name} 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-neutral-200"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-neutral-800 leading-tight text-sm sm:text-base truncate">{profile.name}</h3>
            {isOtherTyping ? (
              <span className="text-[9px] sm:text-[11px] text-orange-500 font-bold uppercase tracking-wider animate-pulse">En train d'écrire...</span>
            ) : (
              <span className="text-[9px] sm:text-[11px] text-emerald-500 font-medium uppercase tracking-wider">En ligne</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-2 relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 sm:p-2.5 hover:bg-neutral-50 rounded-full text-neutral-400 transition-colors"
          >
            <MoreVertical className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-neutral-100 py-2 z-50"
              >
                <button 
                  onClick={() => setIsReportModalOpen(true)}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                >
                  <Flag className="w-4 h-4" />
                  Signaler la conversation
                </button>
                <button 
                  onClick={async () => {
                    if (window.confirm("Voulez-vous vraiment supprimer toute la conversation ?")) {
                      if (conversationId) {
                        try {
                          await api.deleteConversation(conversationId);
                          setMessages([]);
                          setConversationId(null);
                          toast.success("Conversation supprimée");
                          setIsMenuOpen(false);
                        } catch (error) {
                          console.error("Error deleting conversation:", error);
                          toast.error("Erreur lors de la suppression");
                        }
                      } else {
                        setMessages([]);
                        setIsMenuOpen(false);
                      }
                    }
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-neutral-600 hover:bg-neutral-50 flex items-center gap-2 font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer la conversation
                </button>
                <button 
                  onClick={handleBlockUser}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                >
                  <UserX className="w-4 h-4" />
                  Bloquer l'utilisateur
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 bg-neutral-50/30 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            {!isSubscribed && (
              <div className="absolute inset-0 z-10 flex items-center justify-center p-4 sm:p-6 bg-white/10 backdrop-blur-[2px]">
                <div className="bg-white p-6 sm:p-8 rounded-3xl sm:rounded-[32px] shadow-2xl border border-neutral-100 text-center max-w-sm">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 text-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Lock className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2">Messages floutés</h4>
                  <p className="text-xs sm:text-sm text-neutral-500 mb-6 sm:mb-8">
                    Abonnez-vous pour lire vos messages et discuter sans limites avec vos correspondants.
                  </p>
                  <button 
                    onClick={onSubscriptionClick}
                    className="w-full py-3 sm:py-4 bg-orange-500 text-white font-bold rounded-xl sm:rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 text-sm sm:text-base"
                  >
                    Voir les abonnements
                  </button>
                </div>
              </div>
            )}
            <div className="flex justify-center mb-4 sm:mb-6">
              <span className="px-3 py-1 bg-white border border-neutral-200 rounded-full text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                Aujourd'hui
              </span>
            </div>

            {messages.map((msg) => (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                key={msg.id}
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] sm:max-w-[70%] group relative ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-sm shadow-sm relative ${
                    msg.sender === 'me' 
                      ? 'bg-orange-500 text-white rounded-tr-none' 
                      : 'bg-white text-neutral-700 border border-neutral-100 rounded-tl-none'
                  } ${!isSubscribed && msg.sender === 'them' ? 'blur-[4px] select-none pointer-events-none' : ''}`}>
                    {msg.translatedText && !msg.showOriginal ? (
                      <div className="space-y-1">
                        <div className="text-[10px] opacity-70 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Languages className="w-2.5 h-2.5" />
                          Traduit
                        </div>
                        <div>{msg.translatedText}</div>
                      </div>
                    ) : (
                      msg.text
                    )}
                    
                    {/* Message Actions */}
                    <div className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 sm:group-hover:opacity-100 transition-all ${
                      msg.sender === 'me' ? '-left-16 sm:-left-20' : '-right-16 sm:-right-20'
                    }`}>
                      {msg.translatedText ? (
                        <button 
                          onClick={() => toggleOriginal(msg.id)}
                          className="p-1.5 bg-white rounded-full shadow-md border border-neutral-100 text-neutral-400 hover:text-orange-500 transition-all"
                          title={msg.showOriginal ? "Voir la traduction" : "Voir l'original"}
                        >
                          <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleTranslate(msg.id, msg.text)}
                          disabled={translatingId === msg.id}
                          className={`p-1.5 bg-white rounded-full shadow-md border border-neutral-100 text-neutral-400 hover:text-orange-500 transition-all ${
                            translatingId === msg.id ? 'animate-pulse' : ''
                          }`}
                          title="Traduire"
                        >
                          <Languages className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-1.5 bg-white rounded-full shadow-md border border-neutral-100 text-neutral-400 hover:text-red-500 transition-all"
                        title="Supprimer le message"
                      >
                        <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 mt-1 px-1 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium">{msg.time}</span>
                    {msg.sender === 'me' && (
                      <span className="text-orange-500">
                        {msg.status === 'read' ? <CheckCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {isOtherTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white px-4 py-2 rounded-2xl rounded-tl-none border border-neutral-100 shadow-sm flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </motion.div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 bg-white border-t border-neutral-100 pb-20 sm:pb-4">
        {isBlocked ? (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <div className="p-3 bg-red-50 text-red-500 rounded-full mb-2">
              <UserX className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-red-600">Utilisateur bloqué</p>
            <p className="text-xs text-neutral-400 mt-1">Vous ne pouvez plus envoyer de messages à cette personne.</p>
          </div>
        ) : (
          <form 
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 sm:gap-3 bg-neutral-50 border border-neutral-200 rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 transition-all"
          >
          <button type="button" className="text-neutral-400 hover:text-orange-500 transition-colors hidden sm:block">
            <Smile className="w-[22px] h-[22px]" />
          </button>
          <button type="button" className="text-neutral-400 hover:text-orange-500 transition-colors">
            <ImageIcon className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
          </button>
          <input 
            type="text" 
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Message..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 text-neutral-700"
          />
          <button 
            type="submit"
            disabled={!message.trim()}
            className={`p-2 rounded-xl transition-all ${
              message.trim() 
                ? 'bg-orange-500 text-white shadow-md hover:bg-orange-600 scale-105' 
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
          </button>
        </form>
      )}
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="text-xl font-bold">Signaler la conversation</h3>
                </div>
                <button 
                  onClick={() => setIsReportModalOpen(false)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleReportConversation} className="p-6 space-y-4">
                <p className="text-sm text-neutral-500">
                  Veuillez expliquer pourquoi vous signalez cette conversation avec <span className="font-bold text-neutral-800">{profile.name}</span>. Nos modérateurs examineront les derniers messages.
                </p>
                
                <textarea 
                  required
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Ex: Propos déplacés, harcèlement, faux profil..."
                  className="w-full h-32 p-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm resize-none"
                />

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="flex-1 py-3 text-sm font-bold text-neutral-500 hover:bg-neutral-50 rounded-xl transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                  >
                    Envoyer le signalement
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
