// Chat storage utility for persisting chat history in localStorage

const CHAT_STORAGE_KEY = 'chimpx_chat_history';
const MAX_CHAT_SESSIONS = 10; // Limit number of stored chat sessions
const MAX_MESSAGES_PER_CHAT = 100; // Limit messages per chat to prevent storage overflow

export class ChatStorage {
  // Generate a unique chat session ID
  static generateChatId() {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get all chat sessions
  static getAllChats() {
    try {
      const stored = localStorage.getItem(CHAT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading chat history:', error);
      return {};
    }
  }

  // Get a specific chat session
  static getChat(chatId) {
    const allChats = this.getAllChats();
    return allChats[chatId] || null;
  }

  // Save a chat session
  static saveChat(chatId, chatData) {
    try {
      const allChats = this.getAllChats();
      
      // Limit messages per chat
      if (chatData.messages && chatData.messages.length > MAX_MESSAGES_PER_CHAT) {
        chatData.messages = chatData.messages.slice(-MAX_MESSAGES_PER_CHAT);
      }
      
      allChats[chatId] = {
        ...chatData,
        lastUpdated: new Date().toISOString()
      };
      
      // Limit number of chat sessions
      const chatIds = Object.keys(allChats);
      if (chatIds.length > MAX_CHAT_SESSIONS) {
        // Sort by lastUpdated and remove oldest
        const sortedChats = chatIds
          .map(id => ({ id, lastUpdated: allChats[id].lastUpdated }))
          .sort((a, b) => new Date(a.lastUpdated) - new Date(b.lastUpdated));
        
        const chatsToRemove = sortedChats.slice(0, chatIds.length - MAX_CHAT_SESSIONS);
        chatsToRemove.forEach(chat => delete allChats[chat.id]);
      }
      
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(allChats));
      return true;
    } catch (error) {
      console.error('Error saving chat:', error);
      return false;
    }
  }

  // Update messages in a chat session
  static updateChatMessages(chatId, messages) {
    const chat = this.getChat(chatId);
    if (chat) {
      chat.messages = messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp || new Date().toISOString(),
        // Preserve transaction state information
        transactionState: msg.transactionState || 'idle',
        errorMessage: msg.errorMessage || null,
        transactionHash: msg.transactionHash || null,
        swapCompleted: msg.swapCompleted || false
      }));
      
      // Limit messages per chat
      if (chat.messages.length > MAX_MESSAGES_PER_CHAT) {
        chat.messages = chat.messages.slice(-MAX_MESSAGES_PER_CHAT);
      }
      
      return this.saveChat(chatId, chat);
    }
    return false;
  }

  // Add a single message to a chat session
  static addMessage(chatId, message) {
    const chat = this.getChat(chatId);
    if (chat) {
      chat.messages = chat.messages || [];
      chat.messages.push({
        ...message,
        timestamp: new Date().toISOString(),
        // Enhanced transaction state tracking
        transactionState: message.transactionState || 'idle',
        errorMessage: message.errorMessage || null,
        transactionHash: message.transactionHash || null,
        swapCompleted: message.swapCompleted || false
      });
      
      // Limit messages per chat
      if (chat.messages.length > MAX_MESSAGES_PER_CHAT) {
        chat.messages = chat.messages.slice(-MAX_MESSAGES_PER_CHAT);
      }
      
      return this.saveChat(chatId, chat);
    }
    return false;
  }

  // Create a new chat session
  static createNewChat(walletAddress) {
    const chatId = this.generateChatId();
    const chatData = {
      id: chatId,
      walletAddress,
      messages: [],
      createdAt: new Date().toISOString(),
      title: 'New Chat' // Default title, can be updated based on first message
    };
    
    this.saveChat(chatId, chatData);
    return chatId;
  }

  // Delete a chat session
  static deleteChat(chatId) {
    try {
      const allChats = this.getAllChats();
      delete allChats[chatId];
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(allChats));
      return true;
    } catch (error) {
      console.error('Error deleting chat:', error);
      return false;
    }
  }

  // Get chat sessions for a specific wallet
  static getChatsForWallet(walletAddress) {
    const allChats = this.getAllChats();
    return Object.values(allChats)
      .filter(chat => chat.walletAddress === walletAddress)
      .sort((a, b) => new Date(b.lastUpdated || b.createdAt) - new Date(a.lastUpdated || a.createdAt));
  }

  // Update chat title based on first message
  static updateChatTitle(chatId, title) {
    const chat = this.getChat(chatId);
    if (chat) {
      chat.title = title;
      return this.saveChat(chatId, chat);
    }
    return false;
  }

  // Update transaction state for a specific message
  static updateMessageTransactionState(chatId, messageId, transactionState, errorMessage = null, transactionHash = null) {
    const chat = this.getChat(chatId);
    if (!chat || !chat.messages) return false;
    
    const messageIndex = chat.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return false;
    
    chat.messages[messageIndex] = {
      ...chat.messages[messageIndex],
      transactionState,
      errorMessage,
      transactionHash,
      swapCompleted: transactionState === 'success',
      lastUpdated: new Date().toISOString()
    };
    
    this.saveChat(chatId, chat);
    return true;
  }

  // Clear all chat history
  static clearAllChats() {
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing chat history:', error);
      return false;
    }
  }

  // Get storage usage info
  static getStorageInfo() {
    try {
      const allChats = this.getAllChats();
      const chatCount = Object.keys(allChats).length;
      const totalMessages = Object.values(allChats).reduce((total, chat) => {
        return total + (chat.messages ? chat.messages.length : 0);
      }, 0);
      
      return {
        chatCount,
        totalMessages,
        storageSize: localStorage.getItem(CHAT_STORAGE_KEY)?.length || 0
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { chatCount: 0, totalMessages: 0, storageSize: 0 };
    }
  }
}

export default ChatStorage;