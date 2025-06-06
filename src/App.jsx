import { useState } from "react";
import {
  useTonConnectUI,
  TonConnectButton,
  useTonWallet,
  useTonAddress,
} from "@tonconnect/ui-react";
import "./App.css";

function App() {
  const wallet = useTonWallet();
  const userFriendlyAddress = useTonAddress();
  const [logs, setLogs] = useState("");
  const [tonConnectUI] = useTonConnectUI();
  console.log("wallet", wallet, userFriendlyAddress);

  const testSwap = async () => {
    if (!tonConnectUI) return;
    try {
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: userFriendlyAddress,
            amount: "1000000",
          },
        ],
      });
    } catch (error) {
      setLogs((prev) => prev + `\nError: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#1d8147] flex flex-col items-center justify-center text-center text-white p-4">
      <h1 className="text-3xl font-bold text-[#1d8147]">ChimpX Swap</h1>
      <p className="mt-2 mb-6">
        Swap your tokens instantly on TON powered by Chimpx.ai
      </p>

      <TonConnectButton />

      {userFriendlyAddress && (
        <>
          <p className="mb-4">Wallet Connected!</p>
          <button
            onClick={testSwap}
            className="bg-[#1d8147] text-white py-2 px-4 rounded-xl"
          >
            Test Swap (Testnet)
          </button>
        </>
      )}

      <pre className="text-xs mt-4 whitespace-pre-wrap break-words">{logs}</pre>
    </div>
  );
}

export default App;
