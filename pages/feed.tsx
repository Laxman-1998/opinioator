import { useState, useEffect, useCallback } from 'react';
import { Post } from '../lib/types';
import { useAuth } from '../lib/auth';
import { fetchAllPosts } from '../lib/posts';
import PostList from '../components/PostList';
import PostForm from '../components/PostForm';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal } from '../context/ModalContext';
import ThoughtLaunchAnimation from '../components/ThoughtLaunchAnimation';

const FeedPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { isModalOpen, openModal, closeModal } = useModal();
  const [animationState, setAnimationState] = useState<'idle' | 'launching'>('idle');

  const loadPosts = useCallback(async () => {
    const fetchedPosts = await fetchAllPosts();
    setPosts(fetchedPosts);
  }, []);

  useEffect(() => {
    setLoading(true);
    loadPosts().then(() => setLoading(false));
  }, [loadPosts]);

  const handlePostSuccess = useCallback(() => {
    closeModal();
    setAnimationState('launching');

    setTimeout(() => {
      setAnimationState('idle');
      loadPosts();
    }, 2500);
  }, [closeModal, loadPosts]);

  if (authLoading) {
    return <p className="text-center">Authenticating...</p>;
  }
  
  return (
    <>
      <ThoughtLaunchAnimation animationState={animationState} />

      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
        {/* 👇 This section has been restyled to be more impactful */}
        <div className="text-center py-8">
          <h1 className="text-5xl font-bold text-white tracking-tight">Global Feed</h1>
          <p className="text-lg text-slate-400 mt-4 max-w-2xl mx-auto">
            Honest thoughts and personal dilemmas from around the world.
          </p>
        </div>

        {user && (
          <div className="flex justify-center">
            <button 
              onClick={openModal} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200 transform hover:scale-105"
            >
              Share Your Opinion
            </button>
          </div>
        )}
        
        {loading ? <p className="text-center">Loading feed...</p> : <PostList posts={posts} />}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="w-full max-w-2xl"
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
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