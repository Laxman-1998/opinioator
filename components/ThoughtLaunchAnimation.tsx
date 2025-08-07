import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Define the props the component will accept
type AnimationProps = {
  animationState: 'idle' | 'launching' | 'spreading';
};

// Animation variants for the main "thought" orb
const orbVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15, duration: 0.5 }
  },
  exit: { 
    scale: 1.5, 
    opacity: 0,
    transition: { duration: 0.5 }
  }
};

const ThoughtLaunchAnimation = ({ animationState }: AnimationProps) => {
  // We use AnimatePresence to handle the fade-out animation when the state changes
  return (
    <AnimatePresence>
      {animationState === 'launching' && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          {/* This is the main animated element */}
          <motion.div
            variants={orbVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* A simple glowing orb to represent the "thought" */}
            <div className="w-24 h-24 bg-blue-500 rounded-full shadow-[0_0_30px_10px_rgba(59,130,246,0.7)] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ThoughtLaunchAnimation;