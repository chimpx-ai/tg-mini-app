import { CheckCircle, XCircle, ArrowDownUp } from "lucide-react";
import { dexFactory, Client } from "@ston-fi/sdk";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import { useState } from "react";
import { Cell } from "@ton/core";
import WalletIcon from "../assets/wallet.svg";

const TransactionCard = ({ transaction }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [transactionState, setTransactionState] = useState('idle'); // 'idle', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [tonConnectUI] = useTonConnectUI();
  const userFriendlyAddress = useTonAddress();

  const confirmTransaction = async (transaction) => {
    try {
      setIsLoading(true);
      setTransactionState('idle');
      setErrorMessage('');
      
      if (!tonConnectUI) {
        throw new Error('TonConnect UI not available');
      }
      console.log("transaction", transaction);
      const tonApiClient = new Client({
        endpoint: "https://toncenter.com/api/v2/jsonRPC",
        apiKey:
          "9688b0e4d8b6ead095f1271b3d2d3500073a6acb309846e83667bbf9f11e26c8",
      });
      const routerMetadata =
        transaction.data.simulateSwapResponse.routerMetadata;
      const dexContracts = dexFactory(routerMetadata);
      const router = tonApiClient.open(
        dexContracts.Router.create(routerMetadata.address)
      );
      const sharedTxParams = {
        userWalletAddress: userFriendlyAddress,
        offerAmount: transaction.data.simulateSwapResponse.offerUnits,
        minAskAmount: transaction.data.simulateSwapResponse.minAskUnits,
      };
      let swapParams;
      if (transaction.data.fromAssetInfo.kind === "Ton") {
        swapParams = await router.getSwapTonToJettonTxParams({
          ...sharedTxParams,
          proxyTon: dexContracts.pTON.create(routerMetadata.ptonMasterAddress),
          askJettonAddress: transaction.data.simulateSwapResponse.askAddress,
        });
      } else if (transaction.data.toAssetInfo.kind === "Ton") {
        swapParams = await router.getSwapJettonToTonTxParams({
          ...sharedTxParams,
          proxyTon: dexContracts.pTON.create(routerMetadata.ptonMasterAddress),
          offerJettonAddress:
            transaction.data.simulateSwapResponse.offerAddress,
        });
      } else {
        swapParams = await router.getSwapJettonToJettonTxParams({
          ...sharedTxParams,
          offerJettonAddress:
            transaction.data.simulateSwapResponse.offerAddress,
          askJettonAddress: transaction.data.simulateSwapResponse.askAddress,
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
        console.log("hashHex", hashHex, buffer, cell);
      }
    } catch (error) {
      console.log("error", error);
      setTransactionState('error');
      setErrorMessage(error.message || 'Transaction failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[267px] mx-auto">
      {/* Main Swap Card */}
      <div className="relative w-[265px] h-[205px] bg-[#1a1c1e] rounded-3xl border border-[#1a1c1e] shadow-[3px_4px_4px_-2px_rgba(211,255,202,0.25)]">
        <div className="flex flex-col h-[205px] items-center justify-start overflow-clip pb-0 pt-4 px-0 relative w-[265px]">
          
          {/* Header with Swap title and balance */}
          <div className="flex items-center justify-between px-8 py-0 relative shrink-0 w-full">
            <div className="flex gap-2.5 items-center justify-center overflow-clip pb-4 pt-0 px-0 relative shrink-0">
              <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#707173] text-[14px] leading-[20px]">Swap</span>
            </div>
            <div className="flex gap-2.5 items-center justify-center overflow-clip pb-4 pt-0 px-0 relative shrink-0">
              <div className="flex gap-1 items-center justify-start relative shrink-0">
                <div className="overflow-clip relative shrink-0 size-4">
                  <img src={WalletIcon} alt="Wallet" className="h-4 w-4" />
                </div>
                <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#ffffff] text-[14px] leading-[20px]">$4503</span>
              </div>
              <div className="bg-[rgba(29,129,71,0.2)] flex gap-[7.829px] h-5 items-center justify-center px-[15.659px] py-[9.395px] relative rounded-[782.156px] shrink-0 w-11 border border-[#1d8147]">
                <span className="font-['Inter:Medium',_sans-serif] font-medium text-[#d3ffca] text-[10px] leading-[14px]">MAX</span>
              </div>
            </div>
          </div>
          
          {/* Divider */}
          <div className="h-px relative shrink-0 w-full">
            <div className="absolute bottom-0 left-0 right-0 top-[-100%] bg-[#2a2c2e]"></div>
          </div>
          
          {/* From Token Section - Dai */}
          <div className="flex h-[70px] items-center justify-between overflow-clip p-[32px] relative shrink-0 w-full">
            <div className="flex gap-3.5 items-center justify-start relative shrink-0">
              <div className="flex items-end justify-end pl-0 pr-3 py-0 relative shrink-0">
                <div className="mr-[-12px] relative rounded-[100px] shrink-0 size-9">
                  <div className="w-9 h-9 bg-[#FF007A] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-[14px] leading-[20px]">U</span>
                  </div>
                </div>
                <div className="absolute bg-[#ffffff] bottom-[-2px] flex gap-2 items-center justify-start p-[2px] right-[-2px] rounded-[1000px] border border-[#ffffff] shadow-[0px_1px_1px_-0.5px_rgba(0,0,0,0.04),0px_3px_3px_-1.5px_rgba(0,0,0,0.04)]">
                  <div className="relative shrink-0 size-3">
                    <div className="w-3 h-3 bg-[#1E8148] rounded-full flex items-center justify-center">
                      <span className="text-white text-[6px] leading-[8px]">✓</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2.5 items-start justify-start leading-[0] not-italic relative shrink-0">
                <span className="font-['Inter:Medium',_sans-serif] font-medium text-[#ffffff] text-[16px] leading-[24px]">Dai</span>
                <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#707173] text-[12px] leading-[16px]">Gnosis</span>
              </div>
            </div>
            <div className="flex flex-col gap-2.5 items-end justify-center leading-[0] not-italic relative shrink-0 text-right">
              <span className="font-['Inter:Medium',_sans-serif] font-medium text-[#ffffff] text-[16px] leading-[24px]">1020.01</span>
              <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#707173] text-[12px] leading-[16px]">$1020.01</span>
            </div>
          </div>
          
          {/* Divider */}
          <div className="h-px relative shrink-0 w-full">
            <div className="absolute bottom-0 left-0 right-0 top-[-100%] bg-[#2a2c2e]"></div>
          </div>
          
          {/* To Token Section - Uni */}
          <div className="flex h-[70px] items-center justify-between overflow-clip p-[32px] relative shrink-0 w-full">
            <div className="flex gap-3.5 items-center justify-start relative shrink-0">
              <div className="flex items-end justify-end pl-0 pr-3 py-0 relative shrink-0">
                <div className="mr-[-12px] relative rounded-[100px] shrink-0 size-9">
                  <div className="w-9 h-9 bg-[#FF007A] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-[14px] leading-[20px]">U</span>
                  </div>
                </div>
                <div className="absolute bg-[#ffffff] bottom-[-2px] flex gap-2 items-center justify-start p-[2px] right-[-2px] rounded-[1000px] border border-[#ffffff] shadow-[0px_1px_1px_-0.5px_rgba(0,0,0,0.04),0px_3px_3px_-1.5px_rgba(0,0,0,0.04)]">
                  <div className="relative shrink-0 size-3">
                    <div className="w-3 h-3 bg-[#1E8148] rounded-full flex items-center justify-center">
                      <span className="text-white text-[6px] leading-[8px]">✓</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2.5 items-start justify-start leading-[0] not-italic relative shrink-0">
                <span className="font-['Inter:Medium',_sans-serif] font-medium text-[#ffffff] text-[16px] leading-[24px]">Uni</span>
                <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#707173] text-[12px] leading-[16px]">Gnosis</span>
              </div>
            </div>
            <div className="flex flex-col gap-2.5 items-end justify-center leading-[0] not-italic relative shrink-0 text-right">
              <span className="font-['Inter:Medium',_sans-serif] font-medium text-[#ffffff] text-[16px] leading-[24px]">400.25</span>
              <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#707173] text-[12px] leading-[16px]">$1020.01</span>
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
        <div className="mt-2 p-2 bg-red-900/20 border border-red-600 rounded-lg w-full">
          <p className="text-red-400 text-[10px] leading-[14px]">{errorMessage}</p>
        </div>
      )}
      
      {transactionState === 'success' && (
        <div className="mt-2 p-2 bg-green-900/20 border border-green-600 rounded-lg w-full">
          <p className="text-green-400 text-[10px] leading-[14px]">Transaction completed successfully!</p>
        </div>
      )}
    </div>
  );
};

export default TransactionCard;
