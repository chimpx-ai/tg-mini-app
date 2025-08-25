import { useRef, useEffect } from "react";
import TransactionCard from "./TransactionCard";
import MessageCard from "./MessageCard";
import chimpIcon from '../assets/ChimpX.svg'

const MessageList = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto min-h-0">
      <div className="mx-4 h-full">
        <div className="space-y-4 pb-4 min-h-full flex flex-col pt-4">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center text-gray-400">
              <p className="text-sm">Start a conversation by typing a message below</p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div key={message.id}>
                  {message.transaction ? (
                    <div className="flex items-start gap-2 justify-start">
                      <div className="w-[22px] h-[22px] flex-shrink-0 mt-1">
                        <img
                          src={chimpIcon}
                          alt="chimp"
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <div className="flex justify-center">
                        <TransactionCard transaction={message.transaction} />
                      </div>
                    </div>
                  ) : (
                    <MessageCard text={message.text} sender={message.sender} />
                  )}
                </div>
              ))}
              {isLoading && (
                <MessageCard text="Thinking..." sender="bot" />
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
