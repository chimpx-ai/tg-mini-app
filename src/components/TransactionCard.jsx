import { ArrowUpDown, CheckCircle, XCircle } from "lucide-react";
import { dexFactory, Client } from "@ston-fi/sdk";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import { useState } from "react";
import { Cell } from "@ton/core";

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
      // const client = new StonApiClient();
      const routerMetadata =
        transaction.data.simulateSwapResponse.routerMetadata;
      const dexContracts = dexFactory(routerMetadata);
      const router = tonApiClient.open(
        dexContracts.Router.create(routerMetadata.address)
      );
      // 3. Prepare common transaction parameters
      const sharedTxParams = {
        userWalletAddress: userFriendlyAddress,
        offerAmount: transaction.data.simulateSwapResponse.offerUnits,
        minAskAmount: transaction.data.simulateSwapResponse.minAskUnits,
      };
      let swapParams;
      // TON -> Jetton
      if (transaction.data.fromAssetInfo.kind === "Ton") {
        swapParams = await router.getSwapTonToJettonTxParams({
          ...sharedTxParams,
          proxyTon: dexContracts.pTON.create(routerMetadata.ptonMasterAddress),
          askJettonAddress: transaction.data.simulateSwapResponse.askAddress,
        });
      } else if (transaction.data.toAssetInfo.kind === "Ton") {
        // Jetton -> TON
        swapParams = await router.getSwapJettonToTonTxParams({
          ...sharedTxParams,
          proxyTon: dexContracts.pTON.create(routerMetadata.ptonMasterAddress),
          offerJettonAddress:
            transaction.data.simulateSwapResponse.offerAddress,
        });
      } else {
        // Jetton -> Jetton (no proxyTon needed)
        swapParams = await router.getSwapJettonToJettonTxParams({
          ...sharedTxParams,
          offerJettonAddress:
            transaction.data.simulateSwapResponse.offerAddress,
          askJettonAddress: transaction.data.simulateSwapResponse.askAddress,
        });
      }
      console.log("swapParams", swapParams);
      // // 5. Send transaction via TonConnect
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

  console.log("transaction", transaction);
  return (
    <div className="mt-[20px]">
      <div className="flex flex-col items-center w-full gap-2">
        <div className="w-full flex items-center gap-2 border border-gray-600 p-2 rounded-lg">
          <img
            src={transaction.data.fromAssetInfo.meta.imageUrl}
            alt={transaction.data.fromAssetInfo.meta.symbol}
            className="w-6 h-6 rounded-full"
          />
          {`${transaction.amountIn} ${transaction.data.fromAssetInfo.meta.symbol}`}
        </div>
        <ArrowUpDown size="15px" />
        <div className="flex w-full items-center gap-2 border border-gray-600 p-2 rounded-lg">
          <img
            src={transaction.data.toAssetInfo.meta.imageUrl}
            alt={transaction.data.toAssetInfo.meta.symbol}
            className="w-6 h-6 rounded-full"
          />
          {`${transaction.amountOut} ${transaction.data.toAssetInfo.meta.symbol}`}
        </div>
      </div>
      <div className="flex flex-col gap-1 mt-[20px]">
        <div className="flex items-center justify-between">
          <p>Price Impact:</p>
          <p>{transaction.data.simulateSwapResponse.priceImpact}</p>
        </div>
        <div className="flex items-center justify-between">
          <p>Slippage:</p>
          <p>{transaction.data.simulateSwapResponse.slippageTolerance} %</p>
        </div>
      </div>
      <button
        disabled={isLoading || transactionState === 'success'}
        onClick={() => confirmTransaction(transaction)}
        className={`w-full rounded-lg mt-[20px] py-2 flex items-center justify-center gap-2 transition-colors ${
          transactionState === 'success' 
            ? 'bg-green-600 text-white' 
            : transactionState === 'error'
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-[#1d8147] text-white hover:bg-[#155a35]'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {transactionState === 'success' && <CheckCircle size={16} />}
        {transactionState === 'error' && <XCircle size={16} />}
        {isLoading ? "Processing..." : 
         transactionState === 'success' ? "Transaction Successful" :
         transactionState === 'error' ? "Retry Transaction" :
         "Confirm Transaction"}
      </button>
      
      {transactionState === 'error' && errorMessage && (
        <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded-lg">
          <p className="text-red-700 text-sm">{errorMessage}</p>
        </div>
      )}
      
      {transactionState === 'success' && (
        <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded-lg">
          <p className="text-green-700 text-sm">Transaction completed successfully!</p>
        </div>
      )}
    </div>
  );
};

export default TransactionCard;
