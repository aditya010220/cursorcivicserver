import React from 'react';
import { motion } from 'framer-motion';

const LoadingAnimation = ({ size = 'medium' }) => {
  // Determine size classes
  const getSizeClasses = () => {
    switch(size) {
      case 'small':
        return {
          container: 'h-16 w-40',
          fist: 'w-8 h-8',
          gap: 'gap-2'
        };
      case 'large':
        return {
          container: 'h-36 w-80',
          fist: 'w-16 h-16',
          gap: 'gap-4'
        };
      case 'medium':
      default:
        return {
          container: 'h-24 w-60',
          fist: 'w-12 h-12',
          gap: 'gap-3'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  // Animation variants
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2,
        staggerDirection: 1,
        repeat: Infinity,
        repeatType: "loop",
        repeatDelay: 0.5
      }
    }
  };

  const fistVariants = {
    initial: { y: 0, opacity: 0, scale: 0.5 },
    animate: {
      y: [0, -20, 0],
      opacity: [0, 1, 0],
      scale: [0.5, 1, 0.5],
      transition: {
        duration: 1,
        ease: "easeInOut",
      }
    }
  };

  return (
    <div className="flex items-center justify-center w-full">
      <motion.div 
        className={`${sizeClasses.container} flex items-center justify-center relative`}
        variants={containerVariants}
        animate="animate"
      >
        <div className={`flex ${sizeClasses.gap} items-center justify-center absolute`}>
          {/* Main fist */}
          <motion.div 
            className={`${sizeClasses.fist} bg-black text-white flex items-center justify-center rounded-full shadow-lg z-20`}
            variants={fistVariants}
            initial="initial"
          >
            <span className="text-white transform rotate-90 font-bold">✊</span>
          </motion.div>
          
          {/* Following fists */}
          <motion.div 
            className={`${sizeClasses.fist} bg-gray-800 text-white flex items-center justify-center rounded-full shadow-md z-10`}
            variants={fistVariants}
            initial="initial"
          >
            <span className="text-white transform rotate-90 font-bold">✊</span>
          </motion.div>
          
          <motion.div 
            className={`${sizeClasses.fist} bg-gray-700 text-white flex items-center justify-center rounded-full shadow-md z-0`}
            variants={fistVariants}
            initial="initial"
          >
            <span className="text-white transform rotate-90 font-bold">✊</span>
          </motion.div>
          
          <motion.div 
            className={`${sizeClasses.fist} bg-gray-600 text-white flex items-center justify-center rounded-full shadow-md -z-10`}
            variants={fistVariants}
            initial="initial"
          >
            <span className="text-white transform rotate-90 font-bold">✊</span>
          </motion.div>
          
          <motion.div 
            className={`${sizeClasses.fist} bg-gray-500 text-white flex items-center justify-center rounded-full shadow-md -z-20`}
            variants={fistVariants}
            initial="initial"
          >
            <span className="text-white transform rotate-90 font-bold">✊</span>
          </motion.div>
        </div>
        
        {/* Text below the animation */}
        <div className="absolute -bottom-8 text-center text-gray-700 font-medium tracking-wide">
          <p>People Powered</p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingAnimation;