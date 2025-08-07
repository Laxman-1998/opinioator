import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type AnimationProps = {
  animationState: 'idle' | 'launching' | 'spreading';
};

// Variants for the main container (fades in/out, adds blur)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.5, delay: 1.5 } },
};

// Variants for the container of the spreading particles
const spreadContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04, // Animate each particle with a tiny delay
      delayChildren: 0.3,   // Wait a moment after the main orb appears
    },
  },
};

// Variants for each individual scattering particle
const particleVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    x: () => (Math.random() - 0.5) * (window.innerWidth * 0.8),  // Random horizontal destination
    y: () => (Math.random() - 0.5) * (window.innerHeight * 0.8), // Random vertical destination
    scale: [0, 1.1, 0], // Appear, grow slightly, then shrink to nothing
    opacity: [0, 1, 0],   // Fade in and then fade out
    transition: {
      duration: 1.5,
      ease: "easeOut",
    },
  },
};

const ThoughtLaunchAnimation = ({ animationState }: AnimationProps) => {
  return (
    <AnimatePresence>
      {animationState === 'launching' && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none backdrop-blur-sm"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* This container will manage the burst of particles */}
          <motion.div
            variants={spreadContainerVariants}
            className="relative"
          >
            {/* We create 25 particles to scatter */}
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