import { CheckCircle, XCircle, ArrowDownUp } from "lucide-react";
import { dexFactory } from "@ston-fi/sdk";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import { useState, useEffect } from "react";
import { Cell } from "@ton/core";
import { Address } from "@ton/core";
import WalletIcon from "../assets/wallet.svg";
import { LoaderCircle } from "lucide-react";
import tonApiClient from "../utils/tonClient";
import { useWalletData } from "../hooks/useWalletData";

const TransactionCard = ({ 
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
  const quote = transaction?.quote || transaction;
  const fromAsset = quote?.data?.fromAssetInfo;
  const toAsset = quote?.data?.toAssetInfo;
  const simulateSwap = quote?.data?.simulateSwapResponse;
  
  // Fallback values if data is not available
  const fromToken = fromAsset?.meta?.symbol || quote?.fromToken || 'TON';
  const toToken = toAsset?.meta?.symbol || quote?.toToken || 'STON';
  const fromAmount = parseFloat(quote?.amountIn || simulateSwap?.formattedOutputAmount || '0').toFixed(2);
  const toAmount = parseFloat(quote?.amountOut || simulateSwap?.formattedOutputAmount || '0').toFixed(2);
  const fromAmountUsd = (parseFloat(quote?.amountIn || simulateSwap?.formattedOutputAmount || '0') * parseFloat(fromAsset?.dexPriceUsd || '0')).toFixed(2);
  const toAmountUsd = parseFloat(simulateSwap?.formattedOutputAmountUsd || (parseFloat(quote?.amountOut || simulateSwap?.formattedOutputAmount || '0') * parseFloat(toAsset?.dexPriceUsd || '0'))).toFixed(2);

  const confirmTransaction = async (transaction) => {
    try {
      setIsLoading(true);
      setTransactionState('idle');
      setErrorMessage('');
      
      if (!tonConnectUI) {
        throw new Error('TonConnect UI not available');
      }
      console.log("transaction", transaction);
      const routerMetadata =
        transaction.quote?.data?.simulateSwapResponse?.routerMetadata || 
        transaction.data?.simulateSwapResponse?.routerMetadata;
      const dexContracts = dexFactory(routerMetadata);
      const router = tonApiClient.open(
        dexContracts.Router.create(routerMetadata.address)
      );
      const simulateSwapData = transaction.quote?.data?.simulateSwapResponse || transaction.data?.simulateSwapResponse;
      const sharedTxParams = {
        userWalletAddress: userFriendlyAddress,
        offerAmount: simulateSwapData.offerUnits,
        minAskAmount: simulateSwapData.minAskUnits,
      };
      let swapParams;
      const fromAssetInfo = transaction.quote?.data?.fromAssetInfo || transaction.data?.fromAssetInfo;
      const toAssetInfo = transaction.quote?.data?.toAssetInfo || transaction.data?.toAssetInfo;
      
      if (fromAssetInfo.kind === "Ton") {
        swapParams = await router.getSwapTonToJettonTxParams({
          ...sharedTxParams,
          proxyTon: dexContracts.pTON.create(routerMetadata.ptonMasterAddress),
          askJettonAddress: simulateSwapData.askAddress,
        });
      } else if (toAssetInfo.kind === "Ton") {
        swapParams = await router.getSwapJettonToTonTxParams({
          ...sharedTxParams,
          proxyTon: dexContracts.pTON.create(routerMetadata.ptonMasterAddress),
          offerJettonAddress: simulateSwapData.offerAddress,
        });
      } else {
        swapParams = await router.getSwapJettonToJettonTxParams({
          ...sharedTxParams,
          offerJettonAddress: simulateSwapData.offerAddress,
          askJettonAddress: simulateSwapData.askAddress,
        });
      }
      console.log("swapParams", swapParams);
      const resp = await tonConnectUI.sendTransaction({
        validUntil: Date.now() + 5 * 60 * 1000,
        messages: [
          {
            address: swapParams.to.toString(),
            amount: swapParams.value.toString(),
            payload: swapParams.body?.toBoc().toString("base64"),
          },
        ],
      });
      console.log("resp", resp);
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
        
        console.log("hashHex", hashHex, buffer, cell);
      }
    } catch (error) {
      console.log("error", error);
      setTransactionState('error');
      
      let errorMsg;
      if (error.message && error.message.includes('User rejects the action')) {
        errorMsg = 'Transaction cancelled by user.';
      } else if (error.message && error.message.includes('Canceled by the user')) {
        errorMsg = 'Transaction cancelled by user.';
      } else if( error.message && error.message.includes('Transaction was not sent')){
        errorMsg = 'Transaction failed. Please try again.';
      } else {
        errorMsg = error.message || 'Transaction failed. Please try again.';
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
    <div className="flex flex-col items-center w-full max-w-[300px] mx-auto px-2 sm:px-4">
      {/* Main Swap Card */}
      <div className="relative w-full max-w-[280px] sm:max-w-[265px] h-[205px] bg-[#1a1c1e] rounded-3xl border border-[#1a1c1e] shadow-[3px_4px_4px_-2px_rgba(211,255,202,0.25)]">
        <div className="flex flex-col h-[205px] items-center justify-start overflow-clip pb-0 pt-4 px-0 relative w-full">
          
          {/* Header with Swap title and balance */}
          <div className="flex items-center justify-between px-6 py-0 relative shrink-0 w-full">
            <div className="flex gap-2.5 items-center justify-center overflow-clip pb-4 pt-0 px-0 relative shrink-0">
              <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#707173] text-[14px] leading-[20px]">Swap</span>
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
          
          {/* From Token Section */}
          <div className="flex h-[70px] items-center justify-between overflow-clip p-6 relative shrink-0 w-full">
            <div className="flex gap-3.5 items-center justify-start relative shrink-0">
              <div className="flex items-end justify-end pl-0 pr-3 py-0 relative shrink-0">
                <div className="mr-[-12px] relative rounded-[100px] shrink-0 size-9">
                  {fromAsset?.meta?.imageUrl ? (
                    <img src={fromAsset.meta.imageUrl} alt={fromToken} className="w-9 h-9 rounded-full" />
                  ) : (
                    <div className="w-9 h-9 bg-[#FF007A] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-[14px] leading-[20px]">{fromToken?.charAt(0) || 'T'}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1 items-start justify-start leading-[0] not-italic relative shrink-0">
                <span className="font-['Inter:Medium',_sans-serif] font-medium text-[#ffffff] text-[16px] leading-[24px]">{fromAsset?.meta?.displayName || fromToken}</span>
                <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#707173] text-[12px] leading-[16px]">{fromAsset?.kind || 'Token'}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 items-end justify-center leading-[0] not-italic relative shrink-0 text-right">
              <span className="font-['Inter:Medium',_sans-serif] font-medium text-[#ffffff] text-[16px] leading-[24px]">{fromAmount}</span>
              <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#707173] text-[12px] leading-[16px]">${fromAmountUsd}</span>
            </div>
          </div>
          
          {/* Divider */}
          <div className="h-px relative shrink-0 w-full">
            <div className="absolute bottom-0 left-0 right-0 top-[-100%] bg-[#2a2c2e]"></div>
          </div>
          
          {/* To Token Section */}
          <div className="flex h-[70px] items-center justify-between overflow-clip p-6 relative shrink-0 w-full">
            <div className="flex gap-3.5 items-center justify-start relative shrink-0">
              <div className="flex items-end justify-end pl-0 pr-3 py-0 relative shrink-0">
                <div className="mr-[-12px] relative rounded-[100px] shrink-0 size-9">
                  {toAsset?.meta?.imageUrl ? (
                    <img src={toAsset.meta.imageUrl} alt={toToken} className="w-9 h-9 rounded-full" />
                  ) : (
                    <div className="w-9 h-9 bg-[#FF007A] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-[14px] leading-[20px]">{toToken?.charAt(0) || 'S'}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1 items-start justify-start leading-[0] not-italic relative shrink-0">
                <span className="font-['Inter:Medium',_sans-serif] font-medium text-[#ffffff] text-[16px] leading-[24px]">{toAsset?.meta?.displayName || toToken}</span>
                <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#707173] text-[12px] leading-[16px]">{toAsset?.kind || 'Token'}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 items-end justify-center leading-[0] not-italic relative shrink-0 text-right">
              <span className="font-['Inter:Medium',_sans-serif] font-medium text-[#ffffff] text-[16px] leading-[24px]">{toAmount}</span>
              <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#707173] text-[12px] leading-[16px]">${toAmountUsd}</span>
            </div>
          </div>
          
          {/* Exchange icon - positioned absolutely */}
          <div className="absolute bg-[#111315] flex items-center justify-center px-2 py-[6.667px] rounded-[6666px] size-7 top-[110px] translate-x-[-50%]" style={{ left: "calc(50% + 0.5px)" }}>
            <ArrowDownUp />
          </div>
        </div>
        <div className="absolute border border-[#1a1c1e] inset-0 pointer-events-none rounded-3xl shadow-[3px_4px_4px_-2px_rgba(211,255,202,0.25)]"></div>
      </div>
      
      {/* Separate Swap Button */}
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
               "Swap"}
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
          <p className="text-green-400 text-[10px] leading-[14px]">Transaction completed successfully!</p>
        </div>
      )}
    </div>
  );
};

export default TransactionCard;
