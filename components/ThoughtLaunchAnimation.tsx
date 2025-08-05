import React from 'react';

// Define the props the component will accept
type AnimationProps = {
  animationState: 'idle' | 'launching' | 'spreading';
};

const ThoughtLaunchAnimation = ({ animationState }: AnimationProps) => {
  // If the animation is idle, render nothing
  if (animationState === 'idle') {
    return null;
  }

  // This is a temporary placeholder to prove our trigger works.
  // We will replace this with beautiful Framer Motion animations later.
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 pointer-events-none">
      <p className="text-white text-2xl font-bold bg-green-500 p-4 rounded-lg">
        Animation State: {animationState}
      </p>
    </div>
  );
};

export default ThoughtLaunchAnimation;