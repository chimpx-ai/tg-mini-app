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
    <div className="border-t border-gray-600 p-4 flex-shrink-0 w-full">
      <div className="w-full max-w-full mx-auto flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-[#1d8147] min-w-0"
          disabled={isLoading}
        />
        <button
          onClick={onSendMessage}
          disabled={!inputText.trim() || isLoading}
          className="bg-[#1d8147] text-white px-6 py-2 rounded-lg hover:bg-[#156b3a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
