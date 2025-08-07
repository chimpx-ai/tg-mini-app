import { useState } from "react";

// Test data - this would normally come from API
const testQuote = {
  fromToken: "TON",
  toToken: "STON",
  amountIn: 5,
  amountOut: 20.217128971,
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
      popularityIndex: 10.89305987624811,
      tags: ["asset:essential"],
    },
    simulateSwapResponse: {
      priceImpact: "0.1%",
      slippageTolerance: "0.5",
    },
  },
};

export const useActionHandler = () => {
  const [isLoading, setIsLoading] = useState(false);

  const processMessage = async (inputText) => {
    setIsLoading(true);
    
    try {
      // Here you can add logic to determine what type of action to perform
      // based on the input text (swap, stake, lend, etc.)
      
      // For now, we'll simulate a swap action
      // In the future, you can add more action types here
      const actionType = determineActionType(inputText);
      
      switch (actionType) {
        case 'swap':
          return await handleSwapAction(inputText);
        case 'stake':
          return await handleStakeAction(inputText);
        case 'lend':
          return await handleLendAction(inputText);
        default:
          return await handleDefaultAction(inputText);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const determineActionType = (inputText) => {
    const lowerText = inputText.toLowerCase();
    
    if (lowerText.includes('swap') || lowerText.includes('exchange')) {
      return 'swap';
    } else if (lowerText.includes('stake') || lowerText.includes('staking')) {
      return 'stake';
    } else if (lowerText.includes('lend') || lowerText.includes('lending')) {
      return 'lend';
    }
    
    return 'default';
  };

  const handleSwapAction = async (inputText) => {
    // Simulate API call for swap
    // Replace this with actual API call
    // const response = await fetch("http://localhost:3000/process", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ prompt: inputText, action: 'swap' }),
    // });
    // const data = await response.json();

    return {
      text: "Check Details for the swap transaction",
      transaction: testQuote,
      actionType: 'swap'
    };
  };

  const handleStakeAction = async (inputText) => {
    // Future implementation for staking
    return {
      text: "Staking functionality coming soon!",
      actionType: 'stake'
    };
  };

  const handleLendAction = async (inputText) => {
    // Future implementation for lending
    return {
      text: "Lending functionality coming soon!",
      actionType: 'lend'
    };
  };

  const handleDefaultAction = async (inputText) => {
    return {
      text: "I can help you with swapping, staking, and lending. What would you like to do?",
      actionType: 'default'
    };
  };

  return {
    processMessage,
    isLoading
  };
};
