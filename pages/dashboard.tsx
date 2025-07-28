import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/auth';
import { Post } from '../lib/types';
import PostCard from '../components/PostCard';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// This is the small, clickable card for each item on our new timeline
const TimelineCard = ({ post, onClick }: { post: Post; onClick: () => void }) => {
  const agreeCount = post.agree_count ?? 0;
  const disagreeCount = post.disagree_count ?? 0;
  const totalVotes = agreeCount + disagreeCount;
  const agreePercentage = totalVotes === 0 ? 50 : Math.round((agreeCount / totalVotes) * 100);

  return (
    // We use motion.div from Framer Motion to add animations
    <motion.div 
      className="flex-shrink-0 w-80 h-40 p-4 bg-slate-900/50 border border-slate-800 rounded-lg cursor-pointer flex flex-col justify-between"
      onClick={onClick}
      whileHover={{ scale: 1.05, borderColor: '#3b82f6' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* line-clamp-3 ensures the text doesn't overflow the card */}
      <p className="text-slate-300 text-sm line-clamp-3">{post.content}</p>
      <div>
        <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
            <div className="bg-gradient-to-r from-red-500 via-purple-500 to-green-500 h-1.5 rounded-full" style={{ width: `${agreePercentage}%` }}></div>
        </div>
        <p className="text-xs text-slate-500 mt-1">{new Date(post.created_at).toLocaleDateString()}</p>
      </div>
    </motion.div>
  );
};


export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  // This new state will track which post is selected to be shown in the pop-up
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    const getMyPosts = async () => {
      if (user) {
        setLoading(true);
        const { data } = await supabase.from('posts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (data) setPosts(data);
        setLoading(false);
      }
    };
    if (user) getMyPosts();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-8">My Thought Timeline</h2>
            <div className="h-40 w-full bg-slate-800 rounded-lg animate-pulse"></div>
        </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-8">My Thought Timeline</h2>
      
      {posts.length > 0 ? (
        // This container allows for horizontal scrolling
        <div className="flex gap-6 pb-6 overflow-x-auto">
          {posts.map((post) => (
            <TimelineCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
          ))}
        </div>
      ) : (
        <div className="text-center p-12 border-2 border-dashed border-slate-800 rounded-lg">
            <h3 className="text-xl font-bold text-white">You haven't posted any thoughts yet.</h3>
            <p className="text-slate-400 mt-2">
            <Link href="/feed"><span className="text-blue-400 hover:underline cursor-pointer">Head to the feed</span></Link>
                {' '}to share your first one.
            </p>
        </div>
      )}

      {/* This is the pop-up (modal) for showing the full PostCard when one is selected */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPost(null)} // Close modal on background click
          >
            <motion.div 
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()} // Prevents modal from closing when clicking inside it
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <PostCard post={selectedPost} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}