import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type AnimationProps = {
  animationState: 'idle' | 'launching' | 'spreading';
};

// We define the variants inside the component to access its state
const createParticleVariants = (width: number, height: number) => ({
  hidden: { scale: 0, opacity: 0 },
  visible: {
    x: (Math.random() - 0.5) * width * 0.8,  // Use the measured width
    y: (Math.random() - 0.5) * height * 0.8, // Use the measured height
    scale: [0, 1.1, 0],
    opacity: [0, 1, 0],
    transition: {
      duration: 1.5,
      ease: "easeOut",
    },
  },
});

const spreadContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.3,
    },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.5, delay: 1.5 } },
};

const ThoughtLaunchAnimation = ({ animationState }: AnimationProps) => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // This useEffect hook runs only on the client-side
  useEffect(() => {
    // Set the initial window size
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    
    // Optional: update on resize
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures this runs only once on mount

  // Generate the variants with the measured window size
  const particleVariants = createParticleVariants(windowSize.width, windowSize.height);

  return (
    <AnimatePresence>
      {animationState === 'launching' && windowSize.width > 0 && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none backdrop-blur-sm"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            variants={spreadContainerVariants}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            {Array.from({ length: 25 }).map((_, i) => (
              <motion.div
                key={i}
                variants={particleVariants}
                className="absolute w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_10px_2px_rgba(59,130,246,0.7)]"
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ThoughtLaunchAnimation;