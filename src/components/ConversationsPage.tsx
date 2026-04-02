import { 
  ArrowLeft, 
  MessageCircle, 
  Search,
  MoreVertical,
  Check,
  CheckCheck,
  Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { toast } from 'sonner';

export default function ConversationsPage({ onBack, onChatClick, currentUserEmail }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const data = await api.get('conversations');
        // Filter conversations where the current user is a participant
        const userConversations = (data || []).filter(conv => 
          conv.participants?.includes(currentUserEmail || 'jlcornet878@gmail.com') ||
          conv.participant_email === (currentUserEmail || 'jlcornet878@gmail.com') // Fallback for older data structure
        );
        
        // Sort by last message date
        userConversations.sort((a, b) => new Date(b.last_message_date).getTime() - new Date(a.last_message_date).getTime());
        
        setConversations(userConversations);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [currentUserEmail]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      const data = await api.get('conversations');
      const updatedData = (data || []).filter(item => item.id !== id);
      await api.save('conversations', updatedData);
      setConversations(prev => prev.filter(c => c.id !== id));
      toast.success("Conversation supprimée");
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleClearAll = async () => {
    try {
      const data = await api.get('conversations');
      const updatedData = (data || []).filter(conv => 
        !conv.participants?.includes(currentUserEmail || 'jlcornet878@gmail.com')
      );
      await api.save('conversations', updatedData);
      setConversations([]);
      toast.success("Toutes les conversations ont été supprimées");
    } catch (error) {
      console.error("Failed to clear conversations:", error);
      toast.error("Erreur lors de l'effacement");
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.participant_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-orange-500"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="flex items-center gap-2 text-neutral-800">
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
          <h1 className="text-xl sm:text-2xl font-bold">Messages</h1>
        </div>
        <div className="flex-1"></div>
        {conversations.length > 0 && (
          <button 
            onClick={handleClearAll}
            className="text-[10px] sm:text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-[14px] h-[14px] sm:w-4 sm:h-4" />
            Effacer
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 sm:w-5 sm:h-5" />
        <input 
          type="text" 
          placeholder="Rechercher une conversation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-white border border-neutral-200 rounded-xl sm:rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm text-sm sm:text-base"
        />
      </div>

      {/* Conversations List */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-neutral-200 overflow-hidden min-h-[300px] sm:min-h-[400px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {filteredConversations.map((conv) => (
              <div 
                key={conv.id} 
                onClick={() => onChatClick(conv)}
                className="p-3 sm:p-6 flex items-center gap-3 sm:gap-4 hover:bg-neutral-50 transition-colors cursor-pointer group"
              >
                <div className="relative shrink-0">
                  <img 
                    src={conv.participant_photo || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"} 
                    alt={conv.participant_name} 
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border border-neutral-200"
                    referrerPolicy="no-referrer"
                  />
                  {conv.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5 sm:mb-1">
                    <h3 className="font-bold text-sm sm:text-lg text-neutral-800 truncate group-hover:text-orange-600 transition-colors">
                      {conv.participant_name}
                    </h3>
                    <span className="text-[9px] sm:text-[10px] text-neutral-400 whitespace-nowrap ml-2">
                      {new Date(conv.last_message_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs sm:text-sm text-neutral-500 truncate pr-4">
                      {conv.last_message}
                    </p>
                    {conv.unread_count > 0 && (
                      <span className="bg-orange-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] sm:min-w-[18px] text-center">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-1 sm:gap-2 shrink-0">
                  <button 
                    onClick={(e) => handleDelete(e, conv.id)}
                    className="p-1.5 sm:p-2 text-neutral-300 hover:text-red-500 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-[14px] h-[14px] sm:w-[18px] sm:h-[18px]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 sm:p-20">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-4 sm:mb-6 text-neutral-200">
              <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h2 className="text-lg sm:text-xl font-medium text-neutral-400">
              Aucune conversation trouvée.
            </h2>
            <p className="text-neutral-400 text-xs sm:text-sm mt-2">
              Commencez à discuter avec des profils qui vous intéressent !
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
