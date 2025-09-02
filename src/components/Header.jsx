import { useEffect } from "react";
import { TonConnectButton, useTonConnectUI } from "@tonconnect/ui-react";
import chimpLogo from "../assets/ChimpX-white-logo.svg";

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

  return (
    <div className="flex items-center justify-between py-4 flex-shrink-0 mx-4">
      <img src={chimpLogo} alt="ChimpX Swap" className="h-10" />
      <TonConnectButton />
    </div>
  );
};

export default Header;
