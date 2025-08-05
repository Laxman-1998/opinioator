import { useState, useEffect, useCallback } from 'react';
import { Post } from '../lib/types';
import { useAuth } from '../lib/auth';
import { fetchAllPosts } from '../lib/posts'; // This file will now be found
import PostList from '../components/PostList';
import PostForm from '../components/PostForm';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal } from '../context/ModalContext'; // This will now work

const FeedPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { isModalOpen, openModal, closeModal } = useModal();

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
    loadPosts();
  }, [closeModal, loadPosts]);

  if (authLoading) {
    return <p className="text-center">Authenticating...</p>;
  }
  
  return (
    <>
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">What does the world think?</h1>
          <p className="text-slate-400 mt-2">Share a thought. Get honest validation. Stay anonymous.</p>
        </div>

        {user && (
          <button onClick={openModal} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-center cursor-pointer transition-colors duration-200 self-center">
            Share a Thought
          </button>
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