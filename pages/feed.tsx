import { useState, useEffect, useCallback } from 'react';
import { Post } from '../lib/types';
import { useAuth } from '../lib/auth';
import { fetchAllPosts } from '../lib/posts';
import PostList from '../components/PostList';
import PostForm from '../components/PostForm';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ThoughtLaunchAnimation from '../components/ThoughtLaunchAnimation';

const FeedPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  // 👇 1. We add the state to control the animation
  const [animationState, setAnimationState] = useState<'idle' | 'launching' | 'spreading'>('idle');

  const loadPosts = useCallback(async () => {
    const fetchedPosts = await fetchAllPosts();
    setPosts(fetchedPosts);
  }, []);

  useEffect(() => {
    setLoading(true);
    loadPosts().then(() => setLoading(false));
  }, [loadPosts]);

  // 👇 2. This is the corrected success handler that triggers the animation
  const handlePostSuccess = useCallback(() => {
    setIsPosting(false); // Close the form
    setAnimationState('launching'); // Start the animation

    setTimeout(() => {
      setAnimationState('idle');
      loadPosts(); // Reload the posts after the animation
    }, 2500); // 2.5 second duration
  }, [loadPosts]);

  if (authLoading) {
    return <p className="text-center">Authenticating...</p>;
  }
  
  return (
    <>
      {/* 👇 3. We render the animation component here */}
      <ThoughtLaunchAnimation animationState={animationState} />

      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Global Feed</h1>
          <p className="text-slate-400 mt-2">Honest thoughts from around the world.</p>
        </div>

        {user && (
          <button onClick={() => setIsPosting(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-center cursor-pointer transition-colors duration-200 self-center">
            Share a Thought
          </button>
        )}
        
        {loading ? <p className="text-center">Loading feed...</p> : <PostList posts={posts} />}
      </div>

      <AnimatePresence>
        {isPosting && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsPosting(false)}
          >
            <motion.div
              className="w-full max-w-2xl"
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 👇 4. We pass the new, correct function to the form */}
              <PostForm onPostSuccess={handlePostSuccess} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FeedPage;