import chimpIcon from '../assets/ChimpX.svg'

const MessageCard = ({ text, sender, messageType, missingParams }) => {
  return (
    <div className={`flex items-start gap-2 ${sender === "user" ? "justify-end" : "justify-start"}`}>
      {/* Bot avatar */}
      {sender !== "user" && (
        <div className="w-[22px] h-[22px] flex-shrink-0 mt-1">
          <img
            src={chimpIcon}
            alt="chimp"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      )}

      {/* Message Card */}
      <div className={`max-w-[85%] sm:max-w-[70%] ${
        sender === "user"
          ? "bg-[#1e8148] text-white rounded-[18px] shadow-[0px_3px_3px_0px_rgba(95,143,95,0.61)]"
          : "bg-[#1a1c1e] text-white rounded-[18px] shadow-[0px_3px_3px_0px_rgba(95,143,95,0.61)]"
      }`}>
        <div className="px-4 py-3">
          <p className="font-['Inter:Regular',_sans-serif] font-normal text-left leading-[17px] sm:leading-[19px] text-sm sm:text-base break-words">{text}</p>
        </div>
      </div>

    </div>
  );
};

export default MessageCard;
