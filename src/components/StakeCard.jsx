import { CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { Tonstakers } from "tonstakers-sdk";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import { useState, useEffect } from "react";
import { Cell, toNano } from "@ton/core";
import WalletIcon from "../assets/wallet.svg";
import { LoaderCircle } from "lucide-react";
import { useWalletData } from "../hooks/useWalletData";

const StakeCard = ({ 
  transaction, 
  messageId, 
  transactionState: propTransactionState, 
  errorMessage: propErrorMessage, 
  onUpdateTransactionState 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [transactionState, setTransactionState] = useState(propTransactionState || 'idle');
  const [errorMessage, setErrorMessage] = useState(propErrorMessage || '');
  const userFriendlyAddress = useTonAddress();
  const { data: walletData, isLoading: balanceLoading } = useWalletData(userFriendlyAddress);
  const walletBalance = walletData?.ton ? (parseFloat(walletData.ton.balance) / 1000000000).toFixed(2) : '0.00';
  const [tonConnectUI] = useTonConnectUI();

  // Sync with props when they change
  useEffect(() => {
    if (propTransactionState) {
      setTransactionState(propTransactionState);
    }
    if (propErrorMessage) {
      setErrorMessage(propErrorMessage);
    }
  }, [propTransactionState, propErrorMessage]);

  useEffect(() => {
    const handleTransactionResult = () => {
      // Reset loading state when user returns from wallet
      if (isLoading && transactionState === 'idle') {
        setIsLoading(false);
      }
    };

    // Listen for focus events to detect when user returns from wallet
    window.addEventListener('focus', handleTransactionResult);
    
    return () => {
      window.removeEventListener('focus', handleTransactionResult);
    };
  }, [isLoading, transactionState]);

  // Extract data from transaction object
  const stakeAmount = parseFloat(transaction?.amount || '0').toFixed(2);
  const estimatedRewards = parseFloat(transaction?.estimatedRewards || '0').toFixed(2);
  const apy = transaction?.apy || '8.5';

  const confirmTransaction = async (transaction) => {
    try {
      setIsLoading(true);
      setTransactionState('idle');
      setErrorMessage('');
      
      if (!tonConnectUI) {
        throw new Error('TonConnect UI not available');
      }

      console.log("Starting stake transaction", transaction);
      
      // Initialize Tonstakers SDK
      const tonstakers = new Tonstakers({
        connector: tonConnectUI,
        partnerCode: 123456
      });

      // Wait for SDK to be ready
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('SDK initialization timeout'));
        }, 10000);

        tonstakers.addEventListener('initialized', () => {
          clearTimeout(timeout);
          resolve();
        });

        // Try to initialize
        if (tonConnectUI.wallet) {
          tonstakers.setupWallet(tonConnectUI.wallet);
        }
      });

      // Perform stake operation directly
      const resp = await tonstakers.stake(toNano(transaction.amount));
      
      console.log("Stake result:", resp);

      console.log("Transaction response:", resp);
      
      if (resp) {
        const cell = Cell.fromBase64(resp.boc);
        const buffer = cell.hash();
        const hashHex = buffer.toString("hex");
        setTransactionState('success');
        setIsLoading(false);
        
        // Update persistent storage
        if (onUpdateTransactionState && messageId) {
          onUpdateTransactionState(messageId, 'success', null, hashHex);
        }
        
        console.log("Transaction hash:", hashHex);
      }
    } catch (error) {
      console.log("Stake transaction error:", error);
      setTransactionState('error');
      
      let errorMsg;
      if (error.message && error.message.includes('User rejects the action')) {
        errorMsg = 'Transaction cancelled by user.';
      } else if (error.message && error.message.includes('Canceled by the user')) {
        errorMsg = 'Transaction cancelled by user.';
      } else if (error.message && error.message.includes('Transaction was not sent')) {
        errorMsg = 'Transaction failed. Please try again.';
      } else {
        errorMsg = error.message || 'Stake transaction failed. Please try again.';
      }
      
      setErrorMessage(errorMsg);
      
      // Update persistent storage
      if (onUpdateTransactionState && messageId) {
        onUpdateTransactionState(messageId, 'error', errorMsg, null);
      }
      
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[267px] mx-auto">
      {/* Main Stake Card */}
      <div className="relative w-[265px] h-[205px] bg-[#1a1c1e] rounded-3xl border border-[#1a1c1e] shadow-[3px_4px_4px_-2px_rgba(211,255,202,0.25)]">
        <div className="flex flex-col h-[205px] items-center justify-start overflow-clip pb-0 pt-4 px-0 relative w-[265px]">
          
          {/* Header with Stake title and balance */}
          <div className="flex items-center justify-between px-6 py-0 relative shrink-0 w-full">
            <div className="flex gap-2.5 items-center justify-center overflow-clip pb-4 pt-0 px-0 relative shrink-0">
              <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#707173] text-[14px] leading-[20px]">Stake</span>
            </div>
            <div className="flex gap-2.5 items-center justify-center overflow-clip pb-4 pt-0 px-0 relative shrink-0">
              <div className="flex gap-1 items-center justify-start relative shrink-0">
                <div className="overflow-clip relative shrink-0 size-4">
                  <img src={WalletIcon} alt="Wallet" className="h-4 w-4" />
                </div>
                <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#ffffff] text-[14px] leading-[20px]">
                  {balanceLoading ? <LoaderCircle className="animate-spin"/> : `${walletBalance || '0.00'} TON`}
                </span>
              </div>
            </div>
          </div>
          
          {/* Divider */}
          <div className="h-px relative shrink-0 w-full">
            <div className="absolute bottom-0 left-0 right-0 top-[-100%] bg-[#2a2c2e]"></div>
          </div>
          
          {/* Stake Amount Section */}
          <div className="flex h-[70px] items-center justify-between overflow-clip p-6 relative shrink-0 w-full">
            <div className="flex gap-3.5 items-center justify-start relative shrink-0">
              <div className="flex items-end justify-end pl-0 pr-3 py-0 relative shrink-0">
                <div className="mr-[-12px] relative rounded-[100px] shrink-0 size-9">
                  <div className="w-9 h-9 bg-[#0088CC] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-[14px] leading-[20px]">TON</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1 items-start justify-start leading-[0] not-italic relative shrink-0">
                <span className="font-['Inter:Medium',_sans-serif] font-medium text-[#ffffff] text-[16px] leading-[24px]">TON</span>
                <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#707173] text-[12px] leading-[16px]">Stake Amount</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 items-end justify-center leading-[0] not-italic relative shrink-0 text-right">
              <span className="font-['Inter:Medium',_sans-serif] font-medium text-[#ffffff] text-[16px] leading-[24px]">{stakeAmount}</span>
              <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#707173] text-[12px] leading-[16px]">{apy}% APY</span>
            </div>
          </div>
          
          {/* Divider */}
          <div className="h-px relative shrink-0 w-full">
            <div className="absolute bottom-0 left-0 right-0 top-[-100%] bg-[#2a2c2e]"></div>
          </div>
          
          {/* Estimated Rewards Section */}
          <div className="flex h-[70px] items-center justify-between overflow-clip p-6 relative shrink-0 w-full">
            <div className="flex gap-3.5 items-center justify-start relative shrink-0">
              <div className="flex items-end justify-end pl-0 pr-3 py-0 relative shrink-0">
                <div className="mr-[-12px] relative rounded-[100px] shrink-0 size-9">
                  <div className="w-9 h-9 bg-[#00D4AA] rounded-full flex items-center justify-center">
                    <TrendingUp size={16} className="text-white" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1 items-start justify-start leading-[0] not-italic relative shrink-0">
                <span className="font-['Inter:Medium',_sans-serif] font-medium text-[#ffffff] text-[16px] leading-[24px]">Rewards</span>
                <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#707173] text-[12px] leading-[16px]">Estimated Annual</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 items-end justify-center leading-[0] not-italic relative shrink-0 text-right">
              <span className="font-['Inter:Medium',_sans-serif] font-medium text-[#ffffff] text-[16px] leading-[24px]">{estimatedRewards}</span>
              <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#707173] text-[12px] leading-[16px]">TON</span>
            </div>
          </div>
        </div>
        <div className="absolute border border-[#1a1c1e] inset-0 pointer-events-none rounded-3xl shadow-[3px_4px_4px_-2px_rgba(211,255,202,0.25)]"></div>
      </div>
      
      {/* Separate Stake Button */}
      <button
        disabled={isLoading || transactionState === 'success'}
        onClick={() => confirmTransaction(transaction)}
        className={`h-14 box-border content-stretch flex items-center justify-center overflow-clip relative rounded-2xl shadow-[3px_4px_4px_-1px_rgba(211,255,202,0.25)] w-[267px] mt-3 transition-colors ${
          transactionState === 'success' 
            ? 'bg-green-600' 
            : transactionState === 'error'
            ? 'bg-red-600 hover:bg-red-700'
            : '!bg-[#1a1c1e]'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{
          backgroundColor: transactionState === 'success' 
            ? undefined 
            : transactionState === 'error'
            ? undefined
            : '#1a1c1e',
          borderRadius: '18px'
        }}
      >
        <div className="box-border content-stretch flex gap-2 items-center justify-center px-5 py-3 relative shrink-0">
          {transactionState === 'success' && <CheckCircle size={14} className="text-white" />}
          {transactionState === 'error' && <XCircle size={14} className="text-white" />}
          <div className="font-['Inter:SemiBold',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[14px] text-nowrap">
            <p className="leading-[20px] whitespace-pre">
              {isLoading ? "Processing..." : 
               transactionState === 'success' ? "Success" :
               transactionState === 'error' ? "Retry" :
               "Stake"}
            </p>
          </div>
        </div>
      </button>
      
      {transactionState === 'error' && errorMessage && (
        <div className="mt-4 p-2 bg-red-900/20 border border-red-600 rounded-lg w-full">
          <p className="text-red-400 text-[10px] leading-[14px]">{errorMessage}</p>
        </div>
      )}
      
      {transactionState === 'success' && (
        <div className="mt-4 p-2 bg-green-900/20 border border-green-600 rounded-lg w-full">
          <p className="text-green-400 text-[10px] leading-[14px]">Stake transaction completed successfully!</p>
        </div>
      )}
    </div>
  );
};

export default StakeCard;