import { Wallet, TrendingUp, LoaderCircle } from "lucide-react";
import WalletIcon from "../assets/wallet.svg";
import { useTonPrice } from "../hooks/useWalletData";

const BalanceCard = ({ balanceData, isLoading = false }) => {
  const { data: tonPrice = 3.11 } = useTonPrice();

  // Extract data from balance response
  const tonBalance = balanceData?.ton || {};
  const jettonBalances = balanceData?.jettons || [];
  
  // Helper function to format balance numbers
  const formatBalance = (balance, decimals = 9) => {
    const num = parseFloat(balance || '0');
    if (num === 0) return '0';
    
    // Convert from smallest unit to main unit
    const mainUnit = num / Math.pow(10, decimals);
    
    if (mainUnit >= 1000000) {
      return (mainUnit / 1000000).toFixed(2) + 'M';
    } else if (mainUnit >= 1000) {
      return (mainUnit / 1000).toFixed(2) + 'K';
    } else if (mainUnit >= 1) {
      return mainUnit.toFixed(4);
    } else {
      return mainUnit.toFixed(6);
    }
  };
  
  // Calculate USD values from balance and price data
  const calculateUsdValue = (balance, decimals, priceUsd) => {
    if (!balance || !priceUsd) return 0;
    const mainUnit = parseFloat(balance) / Math.pow(10, decimals);
    return mainUnit * priceUsd;
  };
  
  // TON USD value calculation using dynamic price from context
  const tonValueUsd = calculateUsdValue(tonBalance.balance, 9, tonPrice);
  
  // Calculate jetton USD values
  const jettonsValueUsd = jettonBalances.reduce((total, jetton) => {
    const jettonUsdPrice = jetton.price?.prices?.USD || 0;
    const jettonValue = calculateUsdValue(jetton.balance, jetton.decimals || 9, jettonUsdPrice);
    return total + jettonValue;
  }, 0);
  
  const totalValueUsd = (tonValueUsd + jettonsValueUsd).toFixed(2);
  
  // Format TON balance
  const tonAmount = formatBalance(tonBalance.balance, 9);
  const tonUsdValue = tonValueUsd.toFixed(2);
  
  // Get top 3 jetton balances by USD value
  const topJettons = jettonBalances
    .filter(jetton => parseFloat(jetton.balance || '0') > 0)
    .sort((a, b) => {
      const aUsdValue = calculateUsdValue(a.balance, a.decimals || 9, a.price?.prices?.USD || 0);
      const bUsdValue = calculateUsdValue(b.balance, b.decimals || 9, b.price?.prices?.USD || 0);
      return bUsdValue - aUsdValue;
    })
    .slice(0, 3);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center w-full max-w-[267px] mx-auto">
        <div className="relative w-[265px] bg-[#1a1c1e] rounded-3xl border border-[#1a1c1e] shadow-[3px_4px_4px_-2px_rgba(211,255,202,0.25)]">
          <div className="flex flex-col items-center justify-center h-[200px] p-6">
            <LoaderCircle className="h-8 w-8 animate-spin text-[#599A6B] mb-4" />
            <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#707173] text-[14px] leading-[20px]">
              Loading wallet balance...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-[267px] mx-auto">
      {/* Main Balance Card */}
      <div className="relative w-[265px] bg-[#1a1c1e] rounded-3xl border border-[#1a1c1e] shadow-[3px_4px_4px_-2px_rgba(211,255,202,0.25)]">
        <div className="flex flex-col items-center justify-start overflow-clip pb-0 pt-4 px-0 relative w-[265px]">
          
          {/* Header with Portfolio title and total value */}
          <div className="flex items-center justify-between px-6 py-0 relative shrink-0 w-full">
            <div className="flex gap-2.5 items-center justify-center overflow-clip pb-4 pt-0 px-0 relative shrink-0">
              <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#707173] text-[14px] leading-[20px]">Portfolio</span>
            </div>
            <div className="flex gap-2.5 items-center justify-center overflow-clip pb-4 pt-0 px-0 relative shrink-0">
              <div className="flex gap-1 items-center justify-start relative shrink-0">
                <div className="overflow-clip relative shrink-0 size-4">
                  <img src={WalletIcon} alt="Wallet" className="h-4 w-4" />
                </div>
                <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#ffffff] text-[14px] leading-[20px]">
                  ${totalValueUsd}
                </span>
              </div>
            </div>
          </div>
          
          {/* Divider */}
          <div className="h-px relative shrink-0 w-full">
            <div className="absolute bottom-0 left-0 right-0 top-[-100%] bg-[#2a2c2e]"></div>
          </div>
          
          {/* TON Balance Section */}
          <div className="flex h-[70px] items-center justify-between overflow-clip p-6 relative shrink-0 w-full">
            <div className="flex gap-3.5 items-center justify-start relative shrink-0">
              <div className="flex items-end justify-end pl-0 pr-3 py-0 relative shrink-0">
                <div className="mr-[-12px] relative rounded-[100px] shrink-0 size-9">
                  {tonBalance.imageUrl ? (
                    <img src={tonBalance.imageUrl} alt="TON" className="w-9 h-9 rounded-full" />
                  ) : (
                    <img 
                      src="https://asset.ston.fi/img/EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c/ee9fb21d17bc8d75c2a5f7b5f5f62d2bacec6b128f58b63cb841e98f7b74c4fc" 
                      alt="TON" 
                      className="w-9 h-9 rounded-full"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  )}
                  <div className="w-9 h-9 bg-[#0088CC] rounded-full flex items-center justify-center" style={{display: 'none'}}>
                    <span className="text-white font-bold text-[14px] leading-[20px]">TON</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1 items-start justify-start leading-[0] not-italic relative shrink-0">
                <span className="font-['Inter:Medium',_sans-serif] font-medium text-[#ffffff] text-[16px] leading-[24px]">TON</span>
                <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#707173] text-[12px] leading-[16px]">Toncoin</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 items-end justify-center leading-[0] not-italic relative shrink-0 text-right">
              <span className="font-['Inter:Medium',_sans-serif] font-medium text-[#ffffff] text-[16px] leading-[24px]">{tonAmount}</span>
              <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#707173] text-[12px] leading-[16px]">${tonUsdValue}</span>
            </div>
          </div>
          
          <div className="h-px relative shrink-0 w-full">
            <div className="absolute bottom-0 left-0 right-0 top-[-100%] bg-[#2a2c2e]"></div>
          </div>

          {/* Jetton Balances Sections */}
          {topJettons.map((jetton, index) => {
            const jettonAmount = formatBalance(jetton.balance, jetton.decimals || 9);
            const jettonUsdPrice = jetton.price?.prices?.USD || 0;
            const jettonUsdValue = calculateUsdValue(jetton.balance, jetton.decimals || 9, jettonUsdPrice).toFixed(2);
            const symbol = jetton.symbol || 'TOKEN';
            const name = jetton.name || symbol;
            
            return (
              <div key={index} className="flex h-[70px] items-center justify-between overflow-clip p-6 relative shrink-0 w-full">
                  <div className="flex gap-3.5 items-center justify-start relative shrink-0">
                    <div className="flex items-end justify-end pl-0 pr-3 py-0 relative shrink-0">
                      <div className="mr-[-12px] relative rounded-[100px] shrink-0 size-9">
                        {jetton.imageUrl ? (
                          <img src={jetton.imageUrl} alt={symbol} className="w-9 h-9 rounded-full" />
                        ) : (
                          <div className="w-9 h-9 bg-[#FF007A] rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-[12px] leading-[16px]">{symbol.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-start justify-start leading-[0] not-italic relative shrink-0">
                      <span className="font-['Inter:Medium',_sans-serif] font-medium text-[#ffffff] text-[16px] leading-[24px]">{symbol}</span>
                      <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#707173] text-[12px] leading-[16px]">{name}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-end justify-center leading-[0] not-italic relative shrink-0 text-right">
                    <span className="font-['Inter:Medium',_sans-serif] font-medium text-[#ffffff] text-[16px] leading-[24px]">{jettonAmount}</span>
                    <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#707173] text-[12px] leading-[16px]">${jettonUsdValue}</span>
                  </div>
                </div>
            );
          })}
          
          {/* Show message if no jettons */}
          {topJettons.length === 0 && (
            <>
              {/* Divider */}
              <div className="h-px relative shrink-0 w-full">
                <div className="absolute bottom-0 left-0 right-0 top-[-100%] bg-[#2a2c2e]"></div>
              </div>
              
              {/* No Jettons Message */}
              <div className="flex h-[70px] items-center justify-center overflow-clip p-6 relative shrink-0 w-full">
                <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#707173] text-[14px] leading-[20px]">No Jetton tokens found</span>
              </div>
            </>
          )}
        </div>
        <div className="absolute border border-[#1a1c1e] inset-0 pointer-events-none rounded-3xl shadow-[3px_4px_4px_-2px_rgba(211,255,202,0.25)]"></div>
      </div>
    </div>
  );
};

export default BalanceCard;