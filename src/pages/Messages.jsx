import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Header from '@/components/layout/Header';
import ConversationList from '@/components/messages/ConversationList';
import ChatWindow from '@/components/messages/ChatWindow';
import { MessageCircle, X, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  // Check URL params for direct conversation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const convId = urlParams.get('conv');
    if (convId && conversations) {
      const conv = conversations.find(c => c.id === convId);
      if (conv) {
        setSelectedConversation(conv);
        setShowChat(true);
      }
    }
  }, []);

  const [hiddenConvIds, setHiddenConvIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hiddenConvIds') || '[]'); } catch { return []; }
  });

  const hideConversation = (convId) => {
    const updated = [...hiddenConvIds, convId];
    setHiddenConvIds(updated);
    localStorage.setItem('hiddenConvIds', JSON.stringify(updated));
    if (selectedConversation?.id === convId) {
      setSelectedConversation(null);
      setShowChat(false);
    }
  };

  const { data: allConversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const allConvs = await base44.entities.Conversation.list('-last_message_date', 100);
      return allConvs.filter(c => c.participants?.includes(user.email));
    },
    enabled: !!currentUser,
  });

  // Un-hide conversation when a new message arrives
  useEffect(() => {
    if (!currentUser || allConversations.length === 0) return;
    const toUnhide = hiddenConvIds.filter(id => {
      const conv = allConversations.find(c => c.id === id);
      return conv && conv.last_message_sender !== currentUser.email;
    });
    if (toUnhide.length > 0) {
      const updated = hiddenConvIds.filter(id => !toUnhide.includes(id));
      setHiddenConvIds(updated);
      localStorage.setItem('hiddenConvIds', JSON.stringify(updated));
    }
  }, [allConversations]);

  const conversations = allConversations.filter(c => !hiddenConvIds.includes(c.id));

  // Real-time subscription for conversations
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = base44.entities.Conversation.subscribe((event) => {
      if (event.data.participants?.includes(currentUser.email)) {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    });

    return unsubscribe;
  }, [currentUser, queryClient]);

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    setShowChat(true);
  };

  const handleBack = () => {
    setShowChat(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="max-w-6xl mx-auto">
        <div className="bg-white shadow-lg md:rounded-xl md:my-6 overflow-hidden">
          <div className="flex h-[calc(100vh-120px)]">
            {/* Conversations List */}
            <div className={`w-full md:w-96 border-r bg-white ${showChat ? 'hidden md:block' : ''}`}>
              <div className="p-4 border-b bg-gradient-to-r from-amber-600 to-amber-500 text-white">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-bold flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Messages
                  </h1>
                  <Link to={createPageUrl('Home')}>
                    <button className="p-1 rounded-full hover:bg-white/20 transition-colors" title="Fermer les messages">
                      <X className="w-5 h-5" />
                    </button>
                  </Link>
                </div>
                <p className="text-sm text-white/80 mt-1">
                  {conversations.length} conversation{conversations.length > 1 ? 's' : ''}
                </p>
              </div>
              <div className="overflow-y-auto h-[calc(100%-80px)]">
                <ConversationList
                  conversations={conversations}
                  currentUserEmail={currentUser?.email}
                  selectedId={selectedConversation?.id}
                  onSelect={handleSelectConversation}
                />
              </div>
            </div>

            {/* Chat Window */}
            <div className={`flex-1 ${!showChat ? 'hidden md:flex' : 'flex'}`}>
              <ChatWindow
                conversation={selectedConversation}
                currentUser={currentUser}
                onBack={handleBack}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}