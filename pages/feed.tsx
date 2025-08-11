import { useState, useEffect } from 'react';
import Link from 'next/link';
import PostForm from '../components/PostForm';
import PostList from '../components/PostList';
import SkeletonPost from '../components/SkeletonPost';
import { useAuth } from '../lib/auth';
import type { Database } from '../lib/database.types';
import { fetchAllPosts } from '../lib/posts'; // 👈 We import the corrected function
type Post = Database['public']['Tables']['posts']['Row'];

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const getPosts = async () => {
    setLoading(true);
    // 👇 THE FIX IS HERE: We use the corrected function
    const data = await fetchAllPosts();
    if (data) {
      setPosts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    getPosts();
  }, []);

  return (
    <div className="mt-8">
      {user && <PostForm onPostSuccess={getPosts} />}
      {!user && (
         <div className="text-center p-8 bg-slate-900/50 rounded-lg border border-slate-800">
          <h3 className="text-xl font-bold text-white">Want to share your thought?</h3>
          <p className="text-slate-400 mt-2">
            <Link href="/login"><span className="text-blue-400 hover:underline cursor-pointer">Log in</span></Link>
            {' '}or{' '}
            <Link href="/signup"><span className="text-blue-400 hover:underline cursor-pointer">sign up</span></Link>
            {' '}to post anonymously.
          </p>
        </div>
      )}

      {/* Your excellent loading logic is preserved */}
      <div className="w-full flex flex-col gap-4 mt-12 border-t border-slate-800 pt-8">
        {loading ? (
          <>
            <SkeletonPost />
            <SkeletonPost />
            <SkeletonPost />
          </>
        ) : posts.length > 0 ? (
          <PostList posts={posts} />
        ) : (
          <div className="text-center p-12">
            <h3 className="text-xl font-bold text-white">The world is quiet... for now.</h3>
            <p className="text-slate-400 mt-2">Be the first to share a thought and get an honest opinion.</p>
          </div>
        )}
      </div>
    </div>
  );
}