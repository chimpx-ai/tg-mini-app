import { useRef, useEffect } from "react";
import TransactionCard from "./TransactionCard";
import chimpIcon from '../assets/chimp.png'

const MessageList = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
      <div className="w-full mx-auto h-full">
        <div className="space-y-4 pb-4 min-h-full flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center text-gray-400">
              <p>Start a conversation by typing a message below</p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Bot avatar - show on left for bot messages */}
                  {message.sender !== "user" && (
                    <img
                      src={chimpIcon}
                      alt="chimp"
                      className="w-8 h-8 rounded-full"
                    />
                  )}

                  <div
                    className={`w-auto max-w-[80%] px-4 py-2 rounded-lg ${
                      message.sender === "user"
                        ? "bg-[#1d8147] text-white"
                        : "bg-gray-700 text-white"
                    }`}
                  >
                    <p className="text-[18px]">{message.text}</p>
                    {message.transaction && (
                      <TransactionCard transaction={message.transaction} />
                    )}
                    <p className="text-xs opacity-70 mt-1 text-right">
                      {message.timestamp}
                    </p>
                  </div>

                  {/* User avatar - show on right for user messages */}
                  {message.sender === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">👤</span>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                  {/* Bot avatar for loading state */}
                  <img
                    src={chimpIcon}
                    alt="chimp"
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="bg-gray-700 text-white w-auto max-w-[80%] px-4 py-2 rounded-lg">
                    <p className="text-sm">Thinking...</p>
                  </div>
                </div>
              )}
            </>
          )}
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

export default MessageList;
