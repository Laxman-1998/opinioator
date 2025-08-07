import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type AnimationProps = {
  animationState: 'idle' | 'launching' | 'spreading';
};

// Animation variants for the container of the spreading particles
const spreadContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Animate each child with a small delay
    },
  },
  exit: { opacity: 0 },
};

// Animation for each individual particle
const particleVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: [0, 1, 0], // Fade in and then fade out
    x: (Math.random() - 0.5) * 600, // Random horizontal destination
    y: (Math.random() - 0.5) * 600, // Random vertical destination
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
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3 }}
        >
          {/* This is the container for the spreading particles */}
          <motion.div
            variants={spreadContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative"
          >
            {/* We create 20 particles to scatter */}
            {Array.from({ length: 20 }).map((_, i) => (
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