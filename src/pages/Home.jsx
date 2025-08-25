import { useState, useEffect } from "react";
import { useTonAddress } from "@tonconnect/ui-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
// import { useActionHandler } from "../hooks/useActionHandler";
const testQuote = {
  fromToken: "TON",
  toToken: "STON",
  amountIn: 5,
  amountOut: 19.948369245,
  priceImpact: 0.1,
  route: ["TON", "STON"],
  gasEstimate: 0.05,
  slippage: 0.005,
  data: {
    fromAssetInfo: {
      contractAddress: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
      kind: "Ton",
      meta: {
        symbol: "TON",
        displayName: "TON",
        imageUrl:
          "https://asset.ston.fi/img/EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c/ee9fb21d17bc8d75c2a5f7b5f5f62d2bacec6b128f58b63cb841e98f7b74c4fc",
        decimals: 9,
      },
      pairPriority: 95,
      popularityIndex: 1.7976931348623157e308,
      tags: ["asset:default_symbol", "default_symbol", "asset:essential"],
      dexPriceUsd: "3.560000000000000",
    },
    toAssetInfo: {
      contractAddress: "EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO",
      kind: "Jetton",
      meta: {
        symbol: "STON",
        displayName: "STON",
        imageUrl:
          "https://asset.ston.fi/img/EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO/3a4450f5f56f1ee24a26ada8ddc93c02310ac138557f682e6eb2ab5f4c83b09d",
        decimals: 9,
      },
      popularityIndex: 10.981613747238796,
      tags: [
        "asset:liquidity:very_high",
        "asset:essential",
        "asset:popular",
        "default_symbol",
        "high_liquidity",
        "asset:default_symbol",
      ],
      dexPriceUsd: "0.8943772590431983",
    },
    simulateSwapResponse: {
      offerAddress: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
      askAddress: "EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO",
      offerJettonWallet: "EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC",
      askJettonWallet: "EQCHuSJBqmpX3zEnFGDBCcVN_ZiaGuoDL2EH0sZdboh5zkwy",
      routerAddress: "EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt",
      poolAddress: "EQDtZHOtVWaf9UIU6rmjLPNLTGxNLNogvK5xUZlMRgZwQ4Gt",
      offerUnits: "5000000000",
      askUnits: "19948369245",
      slippageTolerance: "0.005",
      minAskUnits: "19848627398",
      recommendedSlippageTolerance: "0.005",
      recommendedMinAskUnits: "19848627398",
      swapRate: "3.989673849",
      priceImpact: "0.000332708",
      feeAddress: "EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO",
      feeUnits: "60118735",
      feePercent: "0.003004661",
      gasParams: {
        forwardGas: "185000000",
        estimatedGasConsumption: "45000000",
      },
      routerMetadata: {
        address: "EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt",
        majorVersion: 1,
        minorVersion: 0,
        ptonMasterAddress: "EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez",
        ptonWalletAddress: "EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC",
        ptonVersion: "1.0",
        routerType: "ConstantProduct",
        poolCreationEnabled: false,
      },
      formattedOutputAmount: "19.948369245",
      minimumOutputAmount: "19.848627398",
      formattedOutputAmountUsd: "17.8413678077247350941562835",
      minimumOutputAmountUsd: "17.7521609679929690429270234",
    },
  },
};
function Home() {
  const userFriendlyAddress = useTonAddress();
  const navigate = useNavigate();
  // const [logs, setLogs] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi, I am Chatbot. Hi, I am ChatbotHi, I am ChatbotHi, I am ChatbotHi, I am ChatbotHi, I am Chatbot. Hi, I am ChatbotHi, I am Chatbot.",
      sender: "bot",
      timestamp: "10:30 AM",
    },
    {
      id: 2,
      text: "Hi, I want to Trade $1 USD .",
      sender: "user",
      timestamp: "10:31 AM",
    },
    {
      id: 3,
      text: "Swap",
      sender: "bot",
      transaction: testQuote,
      actionType: 'swap',
      timestamp: "10:32 AM",
    },
    {
      id: 1,
      text: "Hi, I am Chatbot. Hi, I am ChatbotHi, I am ChatbotHi, I am ChatbotHi, I am ChatbotHi, I am Chatbot. Hi, I am ChatbotHi, I am Chatbot.",
      sender: "bot",
      timestamp: "10:30 AM",
    },
    {
      id: 2,
      text: "Hi, I want to Trade $1 USD .",
      sender: "user",
      timestamp: "10:31 AM",
    },
    {
      id: 3,
      text: "Swap",
      sender: "bot",
      transaction: testQuote,
      actionType: 'swap',
      timestamp: "10:32 AM",
    },
    // {
    //   id: 4,
    //   text: "That looks good! Can you also show me the current TON price?",
    //   sender: "user",
    //   timestamp: "10:32 AM",
    // },
    // {
    //   id: 5,
    //   text: "The current TON price is $3.56 USD. The market is looking stable today.",
    //   sender: "bot",
    //   timestamp: "10:33 AM",
    // }
  ]);
  const [inputText, setInputText] = useState("");
  // const { processMessage, isLoading } = useActionHandler();

  // const testSwap = async () => {
  //   if (!tonConnectUI) return;
  //   try {
  //     await tonConnectUI.sendTransaction({
  //       validUntil: Math.floor(Date.now() / 1000) + 600,
  //       messages: [
  //         {
  //           address: userFriendlyAddress,
  //           amount: "1000000",
  //         },
  //       ],
  //     });
  //   } catch (error) {
  //     setLogs((prev) => prev + `\nError: ${error.message}`);
  //   }
  // };
  const sendMessage = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputText;
  
    try {
      const response = await fetch("https://chimpxtonapi.chimpx.ai/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentInput }),
      });
      const resp = await response.json();
      console.log("resp", resp);
      const botMessage = {
        id: Date.now() + 1,
        text: "Check Details for the swap transaction",
        sender: "bot",
        transaction: resp ? resp.quote : null,
        actionType: 'swap',
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setInputText("");
      setIsLoading(false);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: `Error: ${error.message}`,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!userFriendlyAddress) {
      navigate("/landing");
    }
  }, [userFriendlyAddress, navigate]);

  return (
    <div className="relative size-full h-screen flex flex-col text-white bg-gradient-radial from-[rgba(25,77,40,1)] via-[rgba(23,57,33,1)] to-[rgba(22,36,26,1)]">
      <Header />

      {/* Chat Area - Only show when wallet is connected */}
      {userFriendlyAddress && (
        <>
          <MessageList messages={messages} isLoading={isLoading} />
          <MessageInput
            inputText={inputText}
            isLoading={isLoading}
            setInputText={setInputText}
            onSendMessage={sendMessage}
          />
        </>
      )}

      {/* Connect Wallet State */}
      {!userFriendlyAddress && (
        <div className="flex-1 flex items-center justify-center text-center p-4">
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">Connect your wallet to start trading</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
