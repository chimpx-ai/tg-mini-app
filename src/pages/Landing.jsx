import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTonAddress } from '@tonconnect/ui-react';
import { motion } from 'framer-motion';
import bgImage from '../assets/bgimage.png'
import ChimpXLogo from '../assets/ChimpX-white-logo.svg';
import ChimpXFull from '../assets/ChimpX-full.svg';
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
    } else {
      navigate('/');
    }
  }, [userFriendlyAddress, navigate]);

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* Main container with exact Figma dimensions */}
      <motion.div 
        className="absolute w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          background: 'radial-gradient(106.41% 65.63% at 50% 109.14%, #194D28 0%, #16241A 100%)',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        {/* Background pattern */}
        <motion.img 
          src={bgImage} 
          alt="Background pattern"
          className="absolute"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          style={{
            width: '713px',
            height: '396px',
            left: '100px',
            top: '150px',
            scale: '2',
            opacity: 0.5
          }}
        />

        {/* ChimpX Logo */}
        <motion.img 
          src={ChimpXLogo} 
          alt="ChimpX Logo" 
          className="absolute w-56 h-56"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            left: '83px',
            top: '-40px',
            display: 'inline-flex',
            alignItems: 'center'
          }}
        />

        {/* Trade & Control 100% DeFi text */}
        <motion.div 
          className="absolute text-white font-bold w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{
            left: '10px',
            top: '118px',
            color: '#FFF',
            fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
            fontSize: '24px',
            fontWeight: '700',
            lineHeight: '40.103px'

          }}
        >
          Trade & Control 100% DeFi
        </motion.div>

        {/* Monkey character */}
        <motion.img 
          src={ChimpXFull} 
          alt="ChimpX mascot" 
          className="absolute min-w-96 h-96"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          style={{
            aspectRatio: '73/98',
            left: '0px',
            top: '300px'
          }}
        />

        {/* Crypto icon 1 - Top right */}
        <motion.img 
          src={Asset1} 
          alt="Crypto icon" 
          className="absolute w-32 h-32"
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
            filter: 'drop-shadow(0 44px 22.4px rgba(0, 0, 0, 0.25))',
            left: '240px',
            top: '284px'
          }}
        />

        {/* Crypto icon 2 - Left middle */}
        <motion.img 
          src={Asset2} 
          alt="Crypto icon" 
          className="absolute w-30 h-30"
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
            filter: 'drop-shadow(0 44px 22.4px rgba(0, 0, 0, 0.25))',
            left: '-10px',
            top: '480px'
          }}
        />

        {/* Crypto icon 3 - Top left */}
        <motion.img 
          src={Asset3} 
          alt="Crypto icon" 
          className="absolute w-32 h-32"
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
            filter: 'drop-shadow(0 44px 22.4px rgba(0, 0, 0, 0.25))',
            left: '160px',
            top: '205px'
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
            width: '100px',
            height: '100px',
            filter: 'drop-shadow(0 44px 22.4px rgba(0, 0, 0, 0.25))',
            left: '270px',
            top: '564px'
          }}
        />

        {/* Large crypto icon with glassmorphism - Left */}
        <motion.img 
          src={BtcAsset} 
          alt="Crypto icon" 
          className="absolute w-48 h-48"
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
            filter: 'drop-shadow(0 44px 22.4px rgba(0, 0, 0, 0.25))',
            left: '10px',
            top: '270px'
          }}
        />

        {/* Connect Wallet Button */}
        <motion.div 
          className="absolute flex items-center rounded-full cursor-pointer justify-center align-center top-[664px] left-28"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <TonConnectButton />
        </motion.div>
      </motion.div>

      {/* Responsive scaling using CSS-in-JS for larger screens */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media (min-width: 768px) {
            .absolute[style*="360px"] {
              transform: translate(-50%, -50%) scale(1.2) !important;
            }
          }
          @media (min-width: 1024px) {
            .absolute[style*="360px"] {
              transform: translate(-50%, -50%) scale(1.5) !important;
            }
          }
        `
      }} />
    </div>
  );
};

export default Landing;