import { TonConnectButton } from "@tonconnect/ui-react";
import chimpLogo from "../assets/chimpLogoText.svg";

const Header = () => {
  return (
    <div className="flex items-center justify-between p-4 flex-shrink-0 w-full mx-auto">
      <img src={chimpLogo} alt="ChimpX Swap" className="h-8" />
      <TonConnectButton />
    </div>
  );
};

export default Header;
