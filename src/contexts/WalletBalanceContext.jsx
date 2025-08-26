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

  // Function to manually refresh balance
  const refreshBalance = () => {
    fetchWalletBalance(userFriendlyAddress);
  };

  const value = {
    balance,
    balanceLoading,
    balanceError,
    refreshBalance,
    userFriendlyAddress
  };

  return (
    <WalletBalanceContext.Provider value={value}>
      {children}
    </WalletBalanceContext.Provider>
  );
};

export default WalletBalanceContext;