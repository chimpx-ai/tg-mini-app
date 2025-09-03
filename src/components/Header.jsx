import { useEffect } from "react";
import { TonConnectButton, useTonConnectUI } from "@tonconnect/ui-react";
import { FileText, Album } from "lucide-react";
import chimpLogo from "../assets/ChimpX-white-logo.svg";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const Header = () => {
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => {
    if (!tonConnectUI) return;

    const handleStatusChange = (wallet) => {
      // If wallet becomes null (disconnected), clear localStorage
      if (!wallet) {
        try {
          localStorage.removeItem('ton-connect-ui_preferred-wallet');
          localStorage.removeItem('ton-connect-ui_last-selected-wallet-info');
          localStorage.removeItem('ton-connect-storage_bridge-connection');
          localStorage.removeItem('ton-connect-storage_http-bridge-gateway');
          localStorage.removeItem('ton-connect-storage_injected-wallet-info');
          console.log('Cleared TonConnect storage after disconnect');
        } catch (error) {
          console.warn('Failed to clear TonConnect storage:', error);
        }
      }
    };

    // Listen for wallet status changes
    const unsubscribe = tonConnectUI.onStatusChange(handleStatusChange);

    return () => {
      unsubscribe();
    };
  }, [tonConnectUI]);
  const SELECT_OPTIONS = [
    { 
      value: "Docs", 
      label: "Docs", 
      icon: FileText
    },
    { 
      value: "Tutorial", 
      label: "Tutorial", 
      icon: Album
    },
  ];

  return (
    <div className="flex items-center justify-between py-4 flex-shrink-0 mx-4">
      <img src={chimpLogo} alt="ChimpX Swap" className="h-10" />
      <div className="flex items-center gap-2">
        <TonConnectButton />
        <Select>
          <SelectTrigger className="w-10 h-10 bg-[#0E1711] rounded-full border-none">
            <SelectValue placeholder="aa" className="text-white" />
          </SelectTrigger>
            <SelectContent className="w-[147px] bg-[#0E1711] border border-[#0E1711] text-white rounded-[8px] shadow-lg">
              {SELECT_OPTIONS.map((option, index) => {
                const IconComponent = option.icon;
                return (
                  <div key={option.value}>
                    <SelectItem 
                      value={option.value} 
                      className={`text-white py-2 px-4 flex items-center gap-2 bg-transparent hover:bg-transparent focus:bg-transparent data-[highlighted]:bg-transparent focus:text-white data-[highlighted]:text-white`}
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
      </div>
    </div>
  );
};

export default Header;
