import { useState, useEffect, useCallback } from 'react';
import { Post } from '../lib/types';
import { useAuth } from '../lib/auth';
import { fetchAllPosts } from '../lib/posts';
import PostList from '../components/PostList';
import PostForm from '../components/PostForm';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal } from '../context/ModalContext';
// 👇 1. Import our new animation component
import ThoughtLaunchAnimation from '../components/ThoughtLaunchAnimation';

const FeedPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { isModalOpen, openModal, closeModal } = useModal();
  // 👇 2. Add state to manage the animation's current phase
  const [animationState, setAnimationState] = useState<'idle' | 'launching' | 'spreading'>('idle');

  const loadPosts = useCallback(async () => {
    const fetchedPosts = await fetchAllPosts();
    setPosts(fetchedPosts);
  }, []);

  useEffect(() => {
    setLoading(true);
    loadPosts().then(() => setLoading(false));
  }, [loadPosts]);

  // 👇 3. Update the success handler to trigger the animation
  const handlePostSuccess = useCallback(() => {
    closeModal(); // Close the modal immediately
    setAnimationState('launching'); // Start the animation

    // Simulate the animation duration (2.5 seconds)
    setTimeout(() => {
      setAnimationState('idle'); // Reset the animation state
      loadPosts(); // Refresh the feed after the animation is done
    }, 2500);
  }, [closeModal, loadPosts]);

  if (authLoading) {
    return <p className="text-center">Authenticating...</p>;
  }
  
  return (
    <>
      {/* 👇 4. Render the animation component here */}
      <ThoughtLaunchAnimation animationState={animationState} />

      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Global Feed</h1>
          <p className="text-slate-400 mt-2">Honest thoughts from around the world.</p>
        </div>

        {user && (
          <button onClick={openModal} className="bg-blue-600 ...">
            Share Your Opinion
          </button>
        )}
        
        {loading ? <p>Loading...</p> : <PostList posts={posts} />}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/70 ..."
            onClick={closeModal}
          >
            <motion.div
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <PostForm onPostSuccess={handlePostSuccess} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FeedPage;