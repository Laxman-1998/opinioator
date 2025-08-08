import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';

// This hook encapsulates all the logic for the post submission flow.
export const usePostSubmission = (successCallback?: () => void) => {
  const router = useRouter();
  const [isPosting, setIsPosting] = useState(false);
  const [animationState, setAnimationState] = useState<'idle' | 'launching'>('idle');

  const openPostForm = () => setIsPosting(true);

  const handlePostSuccess = useCallback(() => {
    setIsPosting(false); // Close the form/modal
    setAnimationState('launching'); // Start the animation

    // The full duration for the animation and redirect
    setTimeout(() => {
      setAnimationState('idle');
      // If a custom callback is provided (like refreshing the feed), run it.
      if (successCallback) {
        successCallback();
      } else {
        // Otherwise, do the default redirect.
        router.push('/feed');
      }
    }, 4000); // 4-second cinematic sequence
  }, [router, successCallback]);

  return {
    isPosting,
    animationState,
    openPostForm,
    handlePostSuccess,
    setIsPosting, // Also return the setter for closing the modal via backdrop click
  };
};