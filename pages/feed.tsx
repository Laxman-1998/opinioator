import { useState, useEffect, useCallback } from 'react';
import { Post } from '../lib/types';
import { useAuth } from '../lib/auth';
import { fetchAllPosts } from '../lib/posts';
import PostList from '../components/PostList';
import PostForm from '../components/PostForm';
import { motion, AnimatePresence } from 'framer-motion';
import { usePostSubmission } from '../hooks/usePostSubmission'; // 👈 1. Import the new hook
import ThoughtLaunchAnimation from '../components/ThoughtLaunchAnimation';

const FeedPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    const fetchedPosts = await fetchAllPosts();
    setPosts(fetchedPosts);
  }, []);

  // 👇 2. We get all logic from the hook, providing a custom callback to refresh posts
  const { isPosting, animationState, openPostForm, handlePostSuccess, setIsPosting } = usePostSubmission(loadPosts);

  useEffect(() => {
    setLoading(true);
    loadPosts().then(() => setLoading(false));
  }, [loadPosts]);

  if (authLoading) {
    return <p className="text-center">Authenticating...</p>;
  }
  
  return (
    <>
      <ThoughtLaunchAnimation animationState={animationState} />
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Global Feed</h1>
          <p className="text-slate-400 mt-2">Honest thoughts from around the world.</p>
        </div>
        {user && (
          <button onClick={openPostForm} className="bg-blue-600 ...">Share a Thought</button> // 👈 3. Use the handler from the hook
        )}
        {loading ? <p>Loading feed...</p> : <PostList posts={posts} />}
      </div>
      <AnimatePresence>
        {isPosting && (
          <motion.div className="fixed inset-0 ..." onClick={() => setIsPosting(false)}>
            <motion.div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
              <PostForm onPostSuccess={handlePostSuccess} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FeedPage;