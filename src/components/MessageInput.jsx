import { SendHorizontal, RefreshCw, ChartNoAxesColumn, TrendingUp, Vault, AudioLines, CreditCard } from "lucide-react";
import { useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWalletData } from "../hooks/useWalletData";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SELECT_OPTIONS = [
  { 
    value: "swap", 
    label: "Swap", 
    icon: RefreshCw,
    action: "Swap 0.01 TON for STON",
    available: true
  },
  { 
    value: "bridge", 
    label: "Bridge", 
    icon: AudioLines,
    action: "Bridge (Coming soon)",
    available: false
  },
  { 
    value: "analytics", 
    label: "Analytics", 
    icon: ChartNoAxesColumn,
    action: "Show my portfolio",
    available: true
  },
  { 
    value: "stake", 
    label: "Stake", 
    icon: TrendingUp,
    action: "Stake 0.01 TON",
    available: true
  },
  { 
    value: "vaults", 
    label: "Vaults", 
    icon: Vault,
    action: "Vaults (Coming soon)",
    available: false
  },
];

const ACTION_BUTTONS = [
  { 
    label: "Check Balance",
    action: "Check Balance",
    available: true,
    frontendOnly: true,
    handler: "checkBalance"
  },
  { 
    label: "Swap 0.01 TON for STON", 
    action: "Swap 0.01 TON for STON",
    available: true,
    frontendOnly: false,
    handler: null
  },
  { 
    label: "Stake 0.01 TON",
    action: "Stake 0.01 TON",
    available: true,
    frontendOnly: false,
    handler: null
  }
];

const MessageInput = ({
  inputText,
  setInputText,
  onSendMessage,
  isLoading,
  conversationContext,
  userFriendlyAddress,
}) => {

  // Use the wallet data hook
  const { totalWalletValue } = useWalletData(userFriendlyAddress);

  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  }, [onSendMessage]);

  const handleInputChange = useCallback((e) => {
    setInputText(e.target.value);
  }, [setInputText]);

  // Handle select option selection
  const handleSelectOption = useCallback((value) => {
    const selectedOption = SELECT_OPTIONS.find(option => option.value === value);
    if (selectedOption && selectedOption.available) {
      setInputText(selectedOption.action);
    }
  }, [setInputText]);

  // Handle action button clicks
  const handleActionButtonClick = useCallback((action) => {
    if (action && action.available) {
      if (action.frontendOnly) {
        // Handle frontend-only actions
        onSendMessage(action.action, { 
          frontendOnly: true, 
          handler: action.handler 
        });
      } else {
        // Send to backend as usual
        onSendMessage(action.action);
      }
    }
  }, [onSendMessage]);

  // Memoized placeholder
  const placeholder = useMemo(() => {
    if (conversationContext?.missingParams?.length > 0) {
      const missing = conversationContext.missingParams[0];
      switch (missing) {
        case "amount":
          return "Enter the amount (e.g., 10, 5.5)...";
        case "fromToken":
          return "Enter the token to swap from (e.g., TON, USDT)...";
        case "toToken":
          return "Enter the token to swap to (e.g., USDT, STON)...";
        default:
          return `Enter ${missing}...`;
        }
      }
      return "Write a Message...";
    }, [conversationContext?.missingParams]);

  return (
    <div className="py-2 flex flex-col flex-shrink-0 gap-2 mx-4">
      <div className="flex flex-row justify-between items-center bg-[#0E1711] h-9 rounded-lg px-2">
        <div className="flex flex-row gap-2 justify-start items-center">
          <CreditCard className="size-4 text-white" />
          <span className="text-sm">Wallet Balance</span>
        </div>
        <span className="text-sm font-bold text-[#72C689]">${totalWalletValue.toFixed(2)}</span>
      </div>
      <div className="relative flex items-center gap-2">
        {/* Message Input Field */}
        <div className="flex flex-row gap-2 justify-start items-center w-full h-12 bg-[#0E1711] text-white rounded-lg border border-gray-700 px-1">
          <Select onValueChange={handleSelectOption}>
            <SelectTrigger className="w-[100px] h-8 bg-transparent border border-[#383838] text-white hover:bg-gray-800 rounded-md px-2">
              <SelectValue placeholder="Swap" className="text-white" />
            </SelectTrigger>
            <SelectContent className="w-[147px] bg-[#0E1711] border border-[#0E1711] text-white rounded-[8px] shadow-lg">
              {SELECT_OPTIONS.map((option, index) => {
                const IconComponent = option.icon;
                return (
                  <div key={option.value}>
                    <SelectItem 
                      value={option.value} 
                      className={`text-white py-2 px-4 flex items-center gap-2 bg-transparent hover:bg-transparent focus:bg-transparent data-[highlighted]:bg-transparent focus:text-white data-[highlighted]:text-white ${
                        option.available ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                      }`}
                      disabled={!option.available}
                    >
                      <IconComponent className="size-3.5 text-white" />
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-['Fira_Sans:Regular',_sans-serif] text-[12px] leading-[20px] text-white">
                          {option.label}
                        </span>
                      </div>
                    </SelectItem>
                    {index < SELECT_OPTIONS.length - 1 && (
                      <div className="h-px mx-4 bg-gradient-to-r from-transparent via-[#383838] to-transparent" />
                    )}
                  </div>
                );
              })}
            </SelectContent>
          </Select>
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 h-8 bg-transparent text-white placeholder-[#8D8D8D] focus:outline-none font-normal font-['Inter:Medium',_sans-serif]"
            disabled={isLoading}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={onSendMessage}
          disabled={!inputText.trim() || isLoading}
          className="bg-[#0E1711] rounded-lg transition-colors flex items-center justify-center p-3"
        >
          <SendHorizontal className="text-[#599A6B] h-6 w-6" />
        </button>
      </div>
      {/* Quick Actions scrollable list */}
      <ScrollArea className="w-98 md:w-full h-12" orientation="horizontal">
        <div
          className="flex flex-row gap-2 justify-start items-center pb-2"
          style={{ minWidth: "max-content" }}
        >
          {ACTION_BUTTONS.map((action) => (
            <Button
              key={action.label}
              variant=""
              className="bg-[#0E1711] whitespace-nowrap flex-shrink-0 hover:bg-gray-800 transition-colors"
              onClick={() => handleActionButtonClick(action)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MessageInput;
