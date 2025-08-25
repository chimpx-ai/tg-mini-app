import { TonConnectButton } from "@tonconnect/ui-react";
import chimpLogo from "../assets/ChimpX-white-logo.svg";

const Header = () => {
  return (
    <div className="flex items-center justify-between py-4 flex-shrink-0 mx-4">
      <img src={chimpLogo} alt="ChimpX Swap" className="h-10" />
      <TonConnectButton />
    </div>
  );
};

export default Header;
