import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTonAddress } from '@tonconnect/ui-react';
import { Address } from '@ton/core';
import tonApiClient from '../utils/tonClient';

const WalletBalanceContext = createContext();

export const useWalletBalance = () => {
  const context = useContext(WalletBalanceContext);
  if (!context) {
    throw new Error('useWalletBalance must be used within a WalletBalanceProvider');
  }
  return context;
};

export const WalletBalanceProvider = ({ children }) => {
  const userFriendlyAddress = useTonAddress();
  const [balance, setBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState(null);
  const [tonPrice, setTonPrice] = useState(3.11); // Default fallback price
  const [priceLoading, setPriceLoading] = useState(false);

  const fetchTonPrice = async () => {
    setPriceLoading(true);
    try {
      const response = await fetch('https://tonapi.io/v2/rates?tokens=ton&currencies=usd');
      const data = await response.json();
      if (data.rates && data.rates.TON && data.rates.TON.prices && data.rates.TON.prices.USD) {
        setTonPrice(data.rates.TON.prices.USD);
      }
    } catch (error) {
      console.error('Error fetching TON price:', error);
    } finally {
      setPriceLoading(false);
    }
  };

  const fetchWalletBalance = async (address) => {
    if (!address) {
      setBalance(null);
      return;
    }

    setBalanceLoading(true);
    setBalanceError(null);

    try {
      const parsedAddress = Address.parse(address);
      const balance = await tonApiClient.getBalance(parsedAddress);
      const balanceInTon = parseFloat(balance.toString()) / 1000000000;
      setBalance(balanceInTon.toFixed(2));
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      setBalanceError(error.message);
      setBalance('0.00');
    } finally {
      setBalanceLoading(false);
    }
  };

  // Fetch balance when address changes
  useEffect(() => {
    fetchWalletBalance(userFriendlyAddress);
  }, [userFriendlyAddress]);

  // Fetch TON price on component mount
  useEffect(() => {
    fetchTonPrice();
  }, []);

  // Function to manually refresh balance
  const refreshBalance = () => {
    fetchWalletBalance(userFriendlyAddress);
  };

  const value = {
    balance,
    balanceLoading,
    balanceError,
    refreshBalance,
    userFriendlyAddress,
    tonPrice,
    priceLoading
  };

  return (
    <WalletBalanceContext.Provider value={value}>
      {children}
    </WalletBalanceContext.Provider>
  );
};

export default WalletBalanceContext;