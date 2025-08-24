import { SendHorizontal } from "lucide-react";
// import chimpIcon from '../assets/chimp.png'

const MessageInput = ({ 
  inputText,
  setInputText,
  onSendMessage,
  isLoading
}) => {
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="py-4 flex-shrink-0 w-full">
      <div className="relative flex items-center gap-2">
        {/* Message Input Field */}
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Write a Messege..."
            className="w-full h-12 bg-black/45 text-white px-6 py-2 rounded-full border-none outline-none font-normal font-['Inter'] placeholder-[#8D8D8D] focus:outline-none"
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
