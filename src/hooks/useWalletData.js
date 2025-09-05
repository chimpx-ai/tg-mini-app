import { useQuery } from '@tanstack/react-query';
import { Address } from '@ton/core';
import tonApiClient from '../utils/tonClient';

const TON_API_BASE = 'https://tonapi.io/v2';

// Fetch comprehensive wallet data including jettons
const fetchWalletData = async (address) => {
  if (!address) {
    return null;
  }

  try {
    // Fetch TON balance
    const parsedAddress = Address.parse(address);
    const tonBalance = await tonApiClient.getBalance(parsedAddress);
    
    // Fetch jetton balances
    const jettonsResponse = await fetch(
      `${TON_API_BASE}/accounts/${encodeURIComponent(address)}/jettons?currencies=ton,usd&supported_extensions=custom_payload`
    );
    
    if (!jettonsResponse.ok) {
      throw new Error(`Failed to fetch jettons: ${jettonsResponse.status}`);
    }
    
    const jettonsData = await jettonsResponse.json();
    
    // Format the data for BalanceCard component
    const formattedData = {
      ton: {
        balance: tonBalance.toString(),
        imageUrl: null
      },
      jettons: jettonsData.balances?.map(jetton => ({
        balance: jetton.balance,
        decimals: jetton.jetton?.decimals || 9,
        symbol: jetton.jetton?.symbol || 'TOKEN',
        name: jetton.jetton?.name || jetton.jetton?.symbol || 'TOKEN',
        imageUrl: jetton.jetton?.image || null,
        price: {
          prices: {
            USD: jetton.price?.prices?.USD || 0
          }
        }
      })) || []
    };
    
    return formattedData;
  } catch (error) {
    console.error('Error fetching wallet data:', error);
    throw error;
  }
};

// Fetch TON price
const fetchTonPrice = async () => {
  try {
    const response = await fetch('https://tonapi.io/v2/rates?tokens=ton&currencies=usd');
    const data = await response.json();
    if (data.rates && data.rates.TON && data.rates.TON.prices && data.rates.TON.prices.USD) {
      return data.rates.TON.prices.USD;
    }
    return 3.11; // Default fallback price
  } catch (error) {
    console.error('Error fetching TON price:', error);
    return 3.11; // Default fallback price
  }
};

// Calculate total wallet value in USD
const calculateTotalWalletValue = (walletData) => {
  if (!walletData) return 0;
  
  const tonBalance = walletData.ton || {};
  const jettonBalances = walletData.jettons || [];
  
  // Calculate TON value (assuming $3.11 per TON)
  const tonValue = tonBalance.balance ? (parseFloat(tonBalance.balance) / 1000000000) * 3.11 : 0;
  
  // Calculate jetton values
  const jettonsValue = jettonBalances.reduce((total, jetton) => {
    const jettonUsdPrice = jetton.price?.prices?.USD || 0;
    const jettonBalance = parseFloat(jetton.balance || '0');
    const jettonDecimals = jetton.decimals || 9;
    const mainUnit = jettonBalance / Math.pow(10, jettonDecimals);
    return total + (mainUnit * jettonUsdPrice);
  }, 0);
  
  return tonValue + jettonsValue;
};

// Custom hook for wallet data
export const useWalletData = (address) => {
  const query = useQuery({
    queryKey: ['walletData', address],
    queryFn: () => fetchWalletData(address),
    enabled: !!address,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });

  return {
    ...query,
    totalWalletValue: calculateTotalWalletValue(query.data),
  };
};

// Custom hook for TON price
export const useTonPrice = () => {
  return useQuery({
    queryKey: ['tonPrice'],
    queryFn: fetchTonPrice,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export default useWalletData;
