import { useState, useEffect, useCallback } from 'react';
import { Post } from '../lib/types';
import { useAuth } from '../lib/auth';
import { fetchAllPosts } from '../lib/posts';
import PostList from '../components/PostList';
import Link from 'next/link';

const FeedPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    const fetchedPosts = await fetchAllPosts();
    setPosts(fetchedPosts);
  }, []);

  useEffect(() => {
    setLoading(true);
    loadPosts().then(() => setLoading(false));
  }, [loadPosts]);

  if (authLoading) {
    return <p className="text-center">Authenticating...</p>;
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">What does the world think?</h1>
        <p className="text-slate-400 mt-2">Share a thought. Get honest validation. Stay anonymous.</p>
      </div>

      {user && (
        // 👇 This is no longer a button that opens a modal.
        // It's now a simple link to the new page.
        <Link href="/create-post" passHref>
          <span className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-center cursor-pointer transition-colors duration-200 self-center">
            Share a Thought
          </span>
        </Link>
      )}
      
      {loading ? <p className="text-center">Loading feed...</p> : <PostList posts={posts} />}
    </div>
  );
};

export default FeedPage;