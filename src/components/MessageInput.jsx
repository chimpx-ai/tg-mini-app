import { SendHorizontal } from "lucide-react";
// import chimpIcon from '../assets/chimp.png'

const MessageInput = ({ 
  inputText,
  setInputText,
  onSendMessage,
  isLoading,
  conversationContext
}) => {
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  // Generate context-aware placeholder
  const getPlaceholder = () => {
    if (conversationContext?.missingParams?.length > 0) {
      const missing = conversationContext.missingParams[0];
      switch (missing) {
        case 'amount':
          return 'Enter the amount (e.g., 10, 5.5)...';
        case 'fromToken':
          return 'Enter the token to swap from (e.g., TON, USDT)...';
        case 'toToken':
          return 'Enter the token to swap to (e.g., USDT, STON)...';
        default:
          return `Enter ${missing}...`;
      }
    }
    return 'Write a Message...';
  };

  return (
    <div className="py-4 flex-shrink-0 mx-4">
      <div className="relative flex items-center gap-2">
        {/* Message Input Field */}
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholder()}
            className="w-full h-12 bg-black/45 text-white px-6 py-2 rounded-full border-none outline-none font-normal font-['Inter:Medium',_sans-serif] placeholder-[#8D8D8D] focus:outline-none"
            disabled={isLoading}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={onSendMessage}
          disabled={!inputText.trim() || isLoading}
          className="bg-black/45 rounded-full hover:bg-black/45 transition-colors flex items-center justify-center p-3"
        >
          <SendHorizontal className="text-[#599A6B] h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
