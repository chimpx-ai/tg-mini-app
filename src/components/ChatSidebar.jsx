import { useState } from 'react';
import { Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const ChatSidebar = ({ 
  chatHistory, 
  currentChatId, 
  onCreateNewChat, 
  onSwitchToChat, 
  onDeleteChat,
  isCollapsed,
  onToggleCollapse 
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation();
    if (showDeleteConfirm === chatId) {
      onDeleteChat(chatId);
      setShowDeleteConfirm(null);
    } else {
      setShowDeleteConfirm(chatId);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-[#111315] border-r border-[#2a2c2e] flex flex-col items-center py-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ChevronRight size={20} />
        </button>
        <button
          onClick={onCreateNewChat}
          className="p-2 text-gray-400 hover:text-white transition-colors mb-2"
        >
          <Plus size={20} />
        </button>
        <div className="flex flex-col gap-1 overflow-y-auto">
          {chatHistory.slice(0, 5).map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSwitchToChat(chat.id)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                currentChatId === chat.id
                  ? 'bg-[#1e8148] text-white'
                  : 'bg-[#1a1c1e] text-gray-400 hover:text-white'
              }`}
            >
              <MessageSquare size={16} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-[#111315] border-r border-[#2a2c2e] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#2a2c2e] flex items-center justify-between">
        <h2 className="text-white font-medium">Chat History</h2>
        <div className="flex gap-2">
          <button
            onClick={onCreateNewChat}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-[#1a1c1e]"
            title="New Chat"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={onToggleCollapse}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-[#1a1c1e]"
            title="Collapse Sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-2">
        {chatHistory.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-sm">No chat history yet</p>
            <p className="text-xs mt-1">Start a conversation to see it here</p>
          </div>
        ) : (
          <div className="space-y-1">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                  currentChatId === chat.id
                    ? 'bg-[#1e8148] text-white'
                    : 'bg-[#1a1c1e] text-gray-300 hover:bg-[#2a2c2e]'
                }`}
                onClick={() => onSwitchToChat(chat.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">
                      {chat.title || 'New Chat'}
                    </h3>
                    <p className="text-xs opacity-70 mt-1">
                      {formatDate(chat.lastUpdated || chat.createdAt)}
                    </p>
                    <p className="text-xs opacity-50 mt-1">
                      {chat.messages?.length || 0} messages
                    </p>
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all ${
                      showDeleteConfirm === chat.id
                        ? 'bg-red-600 text-white opacity-100'
                        : 'hover:bg-red-600 hover:text-white text-gray-400'
                    }`}
                    title={showDeleteConfirm === chat.id ? 'Click again to confirm' : 'Delete chat'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                {/* Preview of last message */}
                {chat.messages && chat.messages.length > 0 && (
                  <div className="mt-2 text-xs opacity-60 truncate">
                    {chat.messages[chat.messages.length - 1]?.text?.substring(0, 50)}...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#2a2c2e] text-xs text-gray-400">
        <p>{chatHistory.length} chat{chatHistory.length !== 1 ? 's' : ''} stored</p>
      </div>
    </div>
  );
};

export default ChatSidebar;