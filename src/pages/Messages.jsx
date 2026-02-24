import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const allConvs = await base44.entities.Conversation.list('-last_message_date', 100);
      return allConvs.filter(c => c.participants?.includes(user.email));
    },
    enabled: !!currentUser,
  });

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
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Messages
                </h1>
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