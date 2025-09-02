import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTonAddress } from '@tonconnect/ui-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import bgImage from '../assets/bgimage.png'
import ChimpXLogo from '../assets/ChimpX-white-logo.svg';
import ChimpXFull from '../assets/chimpx-full.svg';
import Asset1 from '../assets/1.svg';
import Asset2 from '../assets/2.svg';
import Asset3 from '../assets/3.svg';
import BtcAsset from '../assets/btc.svg';
import SolanaAsset from '../assets/solana.svg';
import { TonConnectButton } from '@tonconnect/ui-react';

const Landing = () => {
  const navigate = useNavigate();
  const userFriendlyAddress = useTonAddress();

  useEffect(() => {
    if (userFriendlyAddress) {
      navigate('/home');
    }
  }, [userFriendlyAddress, navigate]);

  return (
    <div className="w-full h-screen relative overflow-hidden">
      
      <motion.div 
        className="absolute w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          backgroundImage: `
            radial-gradient(
              106.41% 65.63% at 50% 109.14%, 
              rgba(25, 77, 40, 0.4) 0%,   
              rgba(22, 36, 26, 0.5) 100%
            ),
            url(${bgImage})
          `,
          backgroundSize: 'cover, cover',
          backgroundRepeat: 'no-repeat, no-repeat',
          backgroundPosition: 'center, center',
          margin: 0,
          padding: 0,
          backgroundAttachment: 'fixed, fixed'
        }}
      >

        {/* ChimpX Logo */}
        <motion.img 
          src={ChimpXLogo} 
          alt="ChimpX Logo" 
          className="absolute"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            width: '180px',
            height: '180px',
            left: 'calc(50% - 90px)',
            top: '-40px',
            zIndex: 10
          }}
        />

        {/* Trade & Control 100% DeFi text */}
        <motion.div 
          className="absolute text-white font-bold text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{
            left: 'calc(50% - 160px)',
            top: '80px',
            width: '320px',
            color: '#FFF',
            fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
            fontSize: '24px',
            fontWeight: '700',
            lineHeight: '40.103px',
            zIndex: 10
          }}
        >
          Trade & Control 100% DeFi
        </motion.div>

        {/* Monkey character */}
        <motion.img 
          src={ChimpXFull} 
          alt="ChimpX mascot" 
          className="absolute"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          style={{
            width: '280px',
            height: 'auto',
            aspectRatio: '73/98',
            left: 'calc(50% - 140px)',
            top: '30%',
            zIndex: 10
          }}
        />

        {/* Connect Wallet Button */}
        <motion.div 
          className="absolute"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            left: 'calc(50% - 86.5px)',
            // top: '600px',
            bottom: '10%',
            width: '173px',
            height: '39px',
            zIndex: 10
          }}
        >
          <TonConnectButton className="w-full h-full bg-[#0098E9] border-none rounded-full text-white text-base font-semibold font-inter flex items-center justify-center whitespace-nowrap overflow-hidden text-ellipsis" />
        </motion.div>

        {/* Crypto icon 1 - Top right */}
        <motion.img 
          src={Asset1} 
          alt="Crypto icon" 
          className="absolute"
          initial={{ opacity: 0, x: 50, y: -50 }}
          animate={{ 
            opacity: 1, 
            x: 0, 
            y: [0, -10, 0]
          }}
          transition={{ 
            duration: 0.8, 
            delay: 0.8,
            y: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          style={{
            width: '128px',
            height: '128px',
            filter: 'drop-shadow(0 44px 22.4px rgba(0, 0, 0, 0.25))',
            left: 'calc(50% + 80px)',
            top: '30%',
            zIndex: 5
          }}
        />

        {/* Crypto icon 2 - Left middle */}
        <motion.img 
          src={Asset2} 
          alt="Crypto icon" 
          className="absolute"
          initial={{ opacity: 0, x: -50, y: 50 }}
          animate={{ 
            opacity: 1, 
            x: 0, 
            y: [0, 15, 0]
          }}
          transition={{ 
            duration: 0.8, 
            delay: 1.0,
            y: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          style={{
            width: '120px',
            height: '120px',
            filter: 'drop-shadow(0 44px 22.4px rgba(0, 0, 0, 0.25))',
            left: 'calc(50% - 200px)',
            top: '65%',
            zIndex: 5
          }}
        />

        {/* Crypto icon 3 - Top left */}
        <motion.img 
          src={Asset3} 
          alt="Crypto icon" 
          className="absolute"
          initial={{ opacity: 0, x: -30, y: -30 }}
          animate={{ 
            opacity: 1, 
            x: 0, 
            y: [0, -8, 0]
          }}
          transition={{ 
            duration: 0.8, 
            delay: 1.2,
            y: {
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          style={{
            width: '128px',
            height: '128px',
            filter: 'drop-shadow(0 44px 22.4px rgba(0, 0, 0, 0.25))',
            left: 'calc(50% - 40px)',
            top: '25%',
            zIndex: 5
          }}
        />

        {/* Crypto icon 4 - Bottom right small */}
        <motion.img 
          src={SolanaAsset} 
          alt="Crypto icon" 
          className="absolute"
          initial={{ opacity: 0, x: 30, y: 30 }}
          animate={{ 
            opacity: 1, 
            x: 0, 
            y: [0, 12, 0]
          }}
          transition={{ 
            duration: 0.8, 
            delay: 1.4,
            y: {
              duration: 4.2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          style={{
            width: '120px',
            height: '120px',
            filter: 'drop-shadow(0 44px 22.4px rgba(0, 0, 0, 0.25))',
            left: 'calc(50% + 60px)',
            top: '70%',
            zIndex: 5
          }}
        />

        {/* Large crypto icon with glassmorphism - Left */}
        <motion.img 
          src={BtcAsset} 
          alt="Crypto icon" 
          className="absolute"
          initial={{ opacity: 0, x: -40, y: 20 }}
          animate={{ 
            opacity: 1, 
            x: 0, 
            y: [0, -15, 0]
          }}
          transition={{ 
            duration: 0.8, 
            delay: 1.6,
            y: {
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          style={{
            width: '192px',
            height: '192px',
            filter: 'drop-shadow(0 44px 22.4px rgba(0, 0, 0, 0.25))',
            left: 'calc(50% - 200px)',
            top: '250px',
            zIndex: 5
          }}
        />
      </motion.div>

      {/* Responsive scaling for larger screens */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media (min-width: 768px) {
            .absolute[style*="calc(50%"] {
              transform: scale(1.2);
            }
          }
          @media (min-width: 1024px) {
            .absolute[style*="calc(50%"] {
              transform: scale(1.5);
            }
          }
          @media (min-width: 1440px) {
            .absolute[style*="calc(50%"] {
              transform: scale(1.8);
            }
          }
        `
      }} />
    </div>
  );
};

export default Landing;