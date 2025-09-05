import { LoaderCircle } from "lucide-react";
import { useTonPrice } from "../hooks/useWalletData";
import { useEffect, useState } from "react";

const BalanceCard = ({ balanceData, isLoading = false }) => {
  const { data: tonPrice = 3.11 } = useTonPrice();
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShouldAnimate(true);
    }, 250);
    return () => clearTimeout(timeout);
  }, []);

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
  
  
  
  // Format TON balance
  const tonAmount = formatBalance(tonBalance.balance, 9);
  
  // Get all token balances (TON + jettons) sorted by USD value
  const allTokens = [
    {
      symbol: 'TON',
      name: 'Toncoin',
      balance: tonBalance.balance,
      decimals: 9,
      imageUrl: tonBalance.imageUrl,
      usdValue: tonValueUsd,
      amount: tonAmount,
      isTon: true
    },
    ...jettonBalances
      .filter(jetton => parseFloat(jetton.balance || '0') > 0)
      .map(jetton => ({
        symbol: jetton.symbol || 'TOKEN',
        name: jetton.name || jetton.symbol || 'Token',
        balance: jetton.balance,
        decimals: jetton.decimals || 9,
        imageUrl: jetton.imageUrl,
        usdValue: calculateUsdValue(jetton.balance, jetton.decimals || 9, jetton.price?.prices?.USD || 0),
        amount: formatBalance(jetton.balance, jetton.decimals || 9),
        isTon: false
      }))
  ].sort((a, b) => b.usdValue - a.usdValue);

  // Calculate total value of all tokens
  const totalValueUsdWithAllTokens = allTokens.reduce((sum, token) => sum + token.usdValue, 0);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center w-full max-w-[267px] mx-auto">
        <div className="relative w-[265px] bg-[#1a1c1e] rounded-[24px] border border-[#1a1c1e] shadow-[3px_4px_4px_-2px_rgba(211,255,202,0.25)]">
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

  // Define colors for different tokens (for chart visualization)
  const getTokenColor = (symbol, index) => {
    const colors = [
      '#0088CC', // Blue for TON
      '#FF007A', // Pink
      '#00D4AA', // Teal
      '#FF6B35', // Orange
      '#8B5CF6', // Purple
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#EF4444', // Red
      '#06B6D4', // Cyan
      '#84CC16', // Lime
      '#F97316', // Orange-500
      '#EC4899', // Pink-500
      '#6366F1', // Indigo
      '#14B8A6', // Teal-500
      '#A855F7', // Purple-500
      '#22C55E', // Green-500
      '#EAB308', // Yellow-500
      '#DC2626', // Red-600
      '#0891B2', // Sky-600
      '#65A30D', // Lime-600
      '#EA580C', // Orange-600
      '#DB2777', // Rose-600
      '#4F46E5', // Indigo-600
      '#0D9488', // Teal-600
      '#9333EA', // Purple-600
      '#16A34A', // Green-600
      '#CA8A04', // Yellow-600
      '#B91C1C'  // Red-700
    ];
    
    if (symbol === 'TON') return colors[0];
    return colors[index % colors.length];
  };

  // Create donut chart data with proper segment calculations
  const createDonutChartData = () => {
    if (allTokens.length === 0) return [];
    
    // Calculate raw percentages
    const rawPercentages = allTokens.map(token => 
      totalValueUsdWithAllTokens > 0 ? (token.usdValue / totalValueUsdWithAllTokens) * 100 : 0
    );
    
    const hasVerySmallSegments = rawPercentages.some(p => p > 0 && p < 0.5);
    
    let finalPercentages;
    if (hasVerySmallSegments) {
      const minPercentage = 1.0;
      const adjustedPercentages = rawPercentages.map(percentage => 
        percentage > 0 ? Math.max(percentage, minPercentage) : 0
      );
      
      const totalAdjusted = adjustedPercentages.reduce((sum, p) => sum + p, 0);
      finalPercentages = adjustedPercentages.map(p => (p / totalAdjusted) * 100);
    } else {
      finalPercentages = rawPercentages;
    }
    
    let cumulativeAngle = 0;
    return allTokens.map((token, index) => {
      const percentage = finalPercentages[index];
      const angle = (percentage / 100) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      
      cumulativeAngle += angle;
      
      return {
        ...token,
        percentage,
        startAngle,
        endAngle,
        angle,
        color: getTokenColor(token.symbol, index)
      };
    });
  };

  const chartData = createDonutChartData();
  const totalValue = totalValueUsdWithAllTokens.toFixed(2);
  
  // Calculate percentage change (for now static, but can be enhanced with historical data)
  const calculatePercentageChange = () => {
    // TODO: Implement with historical data comparison
    // For now, return 0.00% as placeholder
    return "+0.00%";
  };
  
  const percentageChange = calculatePercentageChange();

  return (
    <div className="flex flex-col items-start gap-2 w-full max-w-[300px] mx-auto">
      {/* Donut Chart */}
      <div className="relative w-[120px] h-[120px] sm:w-[150px] sm:h-[150px]">
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <p className="font-['Inter:Bold',_sans-serif] font-bold mb-0 text-[16px] sm:text-[20px] text-white">${totalValue}</p>
          <p className="font-['Inter:Medium',_sans-serif] font-medium text-[8px] sm:text-[10px] text-[#72c689]">{percentageChange}</p>
        </div>
        
        {/* Multi-segment Donut Chart */}
        <svg className="w-full h-full" viewBox="0 0 150 150" style={{ transform: "rotate(-90deg)" }}>
          {chartData.map((segment, index) => {
            const radius = 60;
            const centerX = 75;
            const centerY = 75;
            const circumference = Math.PI * radius * 2;
            const strokeDasharray = circumference;
            const percentage = shouldAnimate ? segment.percentage : 0;
            const strokeDashoffset = circumference * ((100 - percentage) / 100);
            
            // Calculate rotation for this segment
            const previousSegmentsAngle = chartData.slice(0, index).reduce((sum, s) => sum + s.percentage, 0) * 3.6;
            
            return (
              <circle
                key={index}
                r={radius}
                cx={centerX}
                cy={centerY}
                fill="transparent"
                stroke={segment.color}
                strokeWidth="20"
                strokeLinecap="butt"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="duration-500 ease-out"
                style={{
                  strokeDashoffset: strokeDashoffset,
                  transformOrigin: `${centerX}px ${centerY}px`,
                  transform: `rotate(${previousSegmentsAngle}deg)`
                }}
              />
            );
          })}
        </svg>
      </div>

      {/* Main Balance Card */}
      <div className="relative w-[265px] bg-[#1a1c1e] rounded-3xl border border-[#1a1c1e] shadow-[3px_4px_4px_-2px_rgba(211,255,202,0.25)]">
        <div className="flex flex-col justify-start overflow-clip pb-0 px-0 relative w-full">
          {/* Token List */}
          {allTokens.map((token, index) => {
            const originalPercentage = totalValueUsdWithAllTokens > 0 ? ((token.usdValue / totalValueUsdWithAllTokens) * 100).toFixed(1) : '0.0';
            const tokenColor = getTokenColor(token.symbol, index);
            
            return (
              <div key={index}>
                {/* Token Row */}
                <div className="flex h-[70px] items-center justify-between overflow-clip p-6 relative shrink-0 w-full">
                  <div className="flex gap-3 items-center justify-start relative shrink-0 min-w-0 flex-1">
                    <div className="flex items-center justify-center flex-shrink-0">
                      <div className="flex items-center justify-center relative rounded-full">
                        <div 
                          className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center" 
                          style={{ backgroundColor: tokenColor }}
                        >
                          {/* <span className="text-white font-bold text-md leading-[20px]">{token.symbol.charAt(0)}</span> */}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic relative shrink-0 min-w-0">
                      <span className="font-['Inter:Medium',_sans-serif] font-medium text-[#ffffff] text-sm sm:text-md leading-[20px] sm:leading-[24px] truncate">{token.symbol}</span>
                      <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#707173] text-xs leading-[16px] truncate">{token.amount} tokens</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5 items-end justify-center leading-[0] not-italic relative shrink-0 text-right">
                    <span className="font-['Inter:Medium',_sans-serif] font-medium text-[#ffffff] text-sm sm:text-md leading-[20px] sm:leading-[24px]">${token.usdValue.toFixed(2)}</span>
                    <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#707173] text-xs leading-[16px]">{originalPercentage}%</span>
                  </div>
                </div>
                
                {/* Divider (except for last item) */}
                {index < allTokens.length - 1 && (
                  <div className="h-px relative shrink-0 w-full">
                    <div className="absolute bottom-0 left-0 right-0 top-[-100%] bg-[#2a2c2e]"></div>
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Show message if no tokens */}
          {allTokens.length === 0 && (
            <div className="flex h-[60px] sm:h-[70px] items-center justify-center overflow-clip p-4 sm:p-6 relative shrink-0 w-full">
              <span className="font-['Inter:Regular',_sans-serif] font-normal text-[#707173] text-[14px] leading-[20px]">No tokens found</span>
            </div>
          )}
        </div>
        <div className="absolute border border-[#1a1c1e] inset-0 pointer-events-none rounded-3xl shadow-[3px_4px_4px_-2px_rgba(211,255,202,0.25)]"></div>
      </div>
    </div>
  );
};

export default BalanceCard;