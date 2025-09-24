import { useState, useEffect } from "react";
import { useTonAddress } from "@tonconnect/ui-react";
import { useNavigate } from "react-router-dom";
import { useWalletData } from "../hooks/useWalletData";
import Header from "../components/Header";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import ChatSidebar from "../components/ChatSidebar";
import ChatStorage from "../utils/chatStorage";
import mcpClient from "../services/mcpClient";
// import { useActionHandler } from "../hooks/useActionHandler";

function Home() {
  const userFriendlyAddress = useTonAddress();
  const navigate = useNavigate();
  const { refetch: refetchWalletData } = useWalletData(userFriendlyAddress);
  // const [logs, setLogs] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [currentChatId, setCurrentChatId] = useState(null);
  const [, setChatHistory] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [conversationContext, setConversationContext] = useState(null);

  // Initialize with empty messages - real data will come from backend
  useEffect(() => {
    // Load existing chat messages if any
    if (currentChatId) {
      const chat = ChatStorage.getChat(currentChatId);
      if (chat && chat.messages) {
        setMessages(chat.messages);
      }
    }
  }, [currentChatId]);

  const sendMessage = async (customMessage = null, options = {}) => {
    const messageToSend = customMessage || inputText;
    if (!messageToSend.trim()) return;
    
    // Check if this is a frontend-only action
    if (options.frontendOnly) {
      handleFrontendAction(messageToSend, options.handler);
      return;
    }
    
    setIsLoading(true);
    const userMessage = {
      id: Date.now(),
      text: messageToSend,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    
    // Create new chat if none exists
    if (!currentChatId) {
      const newChatId = ChatStorage.createNewChat(userFriendlyAddress);
      setCurrentChatId(newChatId);
    }
    
    // Save user message
    saveChatState(newMessages);
    const currentInput = messageToSend;
  
    try {
      // Use MCP client instead of direct API call
      const mcpResponse = await mcpClient.processMessage(
        currentInput,
        userFriendlyAddress,
        conversationId
      );
      
      console.log("MCP response", mcpResponse);
      
      if (!mcpResponse.success) {
        throw new Error(mcpResponse.error?.message || 'Failed to process message');
      }
      
      const resp = mcpResponse.data;
      
      // Store conversationId for conversation continuity
      if (resp.conversationId) {
        setConversationId(resp.conversationId);
      }
      
      // Handle different response types from MCP client
      let botMessage;
      
      if (resp.type === 'quote') {
        // Handle swap quote data
        botMessage = {
          id: Date.now() + 1,
          text: resp.response || "Check Details for the swap transaction",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
          transaction: resp.transaction,
          actionType: 'swap',
          transactionState: 'idle',
          errorMessage: null,
          transactionHash: null,
          swapCompleted: false
        };
      } else if (resp.type === 'stake') {
        // Handle stake quote data
        botMessage = {
          id: Date.now() + 1,
          text: resp.response || "Here's your staking transaction:",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
          transaction: {
            type: 'stake',
            ...resp.quote
          },
          transactionState: 'idle',
          errorMessage: null,
          transactionHash: null
        };
      } else if (resp.type === 'unstake') {
        // Handle unstake quote data
        botMessage = {
          id: Date.now() + 1,
          text: resp.response || "Here's your unstaking transaction:",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
          transaction: {
            type: 'unstake',
            ...resp.quote
          },
          transactionState: 'idle',
          errorMessage: null,
          transactionHash: null
        };
      } else if (resp.type === 'balance') {
        // Handle balance/portfolio data - transform MCP response to BalanceCard format
        const transformedBalanceData = {
          ton: resp.balances?.[0] || {},
          jettons: resp.balances?.[1]?.balances || []
        };
        
        botMessage = {
          id: Date.now() + 1,
          text: resp.response || "Here's your wallet balance:",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
          balanceData: transformedBalanceData
        };
      } else if (resp.type === 'clarification') {
        // Handle clarification requests for incomplete prompts
        botMessage = {
          id: Date.now() + 1,
          text: resp.response,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
          messageType: 'clarification',
          clarification: resp.clarification
        };
      } else {
        // Handle conversational response
        botMessage = {
          id: Date.now() + 1,
          text: resp.response || "Here's the information you requested",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
          messageType: 'conversational'
        };
      }

      const finalMessages = [...newMessages, botMessage];
      setMessages(finalMessages);
      saveChatState(finalMessages);
      // Only clear input if it wasn't a custom message
      if (!customMessage) {
        setInputText("");
      }
      setIsLoading(false);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: `Error: ${error.message}`,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
        transactionState: 'error',
        errorMessage: error.message,
        transactionHash: null,
        swapCompleted: false
      };

      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
      saveChatState(finalMessages);
      // Only clear input if it wasn't a custom message
      if (!customMessage) {
        setInputText("");
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!userFriendlyAddress) {
      navigate("/");
    } else {
      loadChatHistory();
    }
    
    // Cleanup MCP client on unmount
    return () => {
      mcpClient.disconnect();
    };
  }, [userFriendlyAddress, navigate]);

  // Load existing chats for the current wallet
  const loadChatHistory = () => {
    if (!userFriendlyAddress) return;
    
    const chats = ChatStorage.getChatsForWallet(userFriendlyAddress);
    setChatHistory(chats);
    
    // Load the most recent chat if available
    if (chats.length > 0 && !currentChatId) {
      const mostRecentChat = chats[0];
      setCurrentChatId(mostRecentChat.id);
      setMessages(mostRecentChat.messages || []);
    }
  };

  // Create a new chat session
  const createNewChat = () => {
    if (!userFriendlyAddress) return;
    
    const newChatId = ChatStorage.createNewChat(userFriendlyAddress);
    setCurrentChatId(newChatId);
    setMessages([]);
    setConversationId(null);
    setConversationContext(null);
    loadChatHistory(); // Refresh chat list
  };

  // Switch to a different chat
  const _switchToChat = (chatId) => {
    const chat = ChatStorage.getChat(chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages || []);
    }
  };

  // Delete a chat
  const _deleteChat = (chatId) => {
    ChatStorage.deleteChat(chatId);
    if (currentChatId === chatId) {
      // If deleting current chat, create a new one
      createNewChat();
    } else {
      loadChatHistory();
    }
  };

  // Toggle sidebar collapse
  const _toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Handle frontend-only actions
  const handleFrontendAction = async (actionText, handler) => {
    const userMessage = {
      id: Date.now(),
      text: actionText,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };

    let botMessage;
    
    if (handler === "checkBalance") {
      // Show loading message first
      botMessage = {
        id: Date.now() + 1,
        text: "Checking your wallet balance...",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
        messageType: 'frontendAction',
        handler: handler,
        balanceData: null,
        isLoading: true
      };

      const newMessages = [...messages, userMessage, botMessage];
      setMessages(newMessages);
      saveChatState(newMessages);

      try {
        // Refetch wallet data using TanStack Query
        const { data: balanceData, error } = await refetchWalletData();
        
        if (error) {
          throw error;
        }

        // Update the bot message with real data
        const updatedBotMessage = {
          ...botMessage,
          text: "Here's your wallet balance:",
          balanceData: balanceData,
          isLoading: false
        };

        const finalMessages = [...messages, userMessage, updatedBotMessage];
        setMessages(finalMessages);
        saveChatState(finalMessages);
      } catch (error) {
        // Update with error message
        const errorBotMessage = {
          ...botMessage,
          text: `Error fetching balance: ${error.message}`,
          balanceData: null,
          isLoading: false
        };

        const finalMessages = [...messages, userMessage, errorBotMessage];
        setMessages(finalMessages);
        saveChatState(finalMessages);
      }
    }
  };

  // Update transaction state for a specific message
  const updateTransactionState = (messageId, transactionState, errorMessage = null, transactionHash = null) => {
    if (!currentChatId) return;
    
    // Update in storage
    ChatStorage.updateMessageTransactionState(currentChatId, messageId, transactionState, errorMessage, transactionHash);
    
    // Update local state
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId 
          ? {
              ...msg,
              transactionState,
              errorMessage,
              transactionHash,
              swapCompleted: transactionState === 'success'
            }
          : msg
      )
    );
  };

  // Save current chat state
  const saveChatState = (newMessages) => {
    if (!currentChatId || !userFriendlyAddress) return;
    
    ChatStorage.updateChatMessages(currentChatId, newMessages);
    
    // Update chat title based on first user message if it's still "New Chat"
    const chat = ChatStorage.getChat(currentChatId);
    if (chat && chat.title === 'New Chat' && newMessages.length > 0) {
      const firstUserMessage = newMessages.find(msg => msg.sender === 'user');
      if (firstUserMessage) {
        const title = firstUserMessage.text.length > 30 
          ? firstUserMessage.text.substring(0, 30) + '...' 
          : firstUserMessage.text;
        ChatStorage.updateChatTitle(currentChatId, title);
      }
    }
    
    loadChatHistory(); // Refresh chat list
  };

  return (
    <div className="text-white h-screen flex ">
      {/* Chat Sidebar - Only show when wallet is connected */}
      {/* {userFriendlyAddress && (
        <ChatSidebar
          chatHistory={chatHistory}
          currentChatId={currentChatId}
          onCreateNewChat={createNewChat}
          onSwitchToChat={switchToChat}
          onDeleteChat={deleteChat}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      )} */}
      
      {/* Main Content */}
      <div className="flex flex-col">
        <Header />

        {/* Chat Area - Only show when wallet is connected */}
        {userFriendlyAddress && (
          <>
            <MessageList 
              messages={messages} 
              isLoading={isLoading} 
              onUpdateTransactionState={updateTransactionState}
            />
            <MessageInput
              inputText={inputText}
              isLoading={isLoading}
              setInputText={setInputText}
              onSendMessage={sendMessage}
              conversationContext={conversationContext}
              userFriendlyAddress={userFriendlyAddress}
            />
          </>
        )}

        {/* Connect Wallet State */}
        {!userFriendlyAddress && (
          <div className="flex-1 flex items-center justify-center text-center p-4">
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">Connect your wallet to start trading</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
