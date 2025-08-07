import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type AnimationProps = {
  animationState: 'idle' | 'launching' | 'spreading';
};

// Animation variants for the container to fade in and out
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.5, delay: 1.5 } },
};

// Animation variants for the orb to pulse
const orbVariants = {
  hidden: { scale: 0 },
  visible: {
    scale: [0, 1.2, 1], // Keyframes: grow, overshoot slightly, then settle
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
};

const ThoughtLaunchAnimation = ({ animationState }: AnimationProps) => {
  return (
    <AnimatePresence>
      {animationState === 'launching' && (
        <motion.div
          // This container handles the overall presence and background blur
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none backdrop-blur-sm"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            // This is the orb itself, with the pulse animation
            variants={orbVariants}
            className="w-24 h-24 bg-blue-500 rounded-full shadow-[0_0_40px_15px_rgba(59,130,246,0.6)] flex items-center justify-center"
          >
            {/* The icon inside the orb */}
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { delay: 0.3 } }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </motion.svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ThoughtLaunchAnimation;