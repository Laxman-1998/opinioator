import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/auth';
import { Post } from '../lib/types';
import PostCard from '../components/PostCard';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import SpaceBackground from '../components/SpaceBackground';

const DashboardPostCard = ({ post, onClick, index }: { post: Post; onClick: () => void; index: number }) => {
  const agreeCount = post.agree_count ?? 0;
  const disagreeCount = post.disagree_count ?? 0;
  const totalVotes = agreeCount + disagreeCount;
  const sentiment = totalVotes === 0 ? 0.5 : agreeCount / totalVotes;

  return (
    // The hover effect is now a clean, fast, glowing border
    <motion.div
      className="relative bg-slate-900/50 border border-slate-800 rounded-xl p-6 cursor-pointer group backdrop-blur-sm transition-colors duration-200"
      onClick={onClick}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20, delay: index * 0.1 }}
      whileHover={{ scale: 1.03, borderColor: '#3b82f6', boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}
    >
      <p className="text-white font-semibold text-lg mb-4 line-clamp-4">{post.content}</p>
      <div className="flex justify-between items-end mt-auto">
        <div className="text-xs text-slate-400">
          <p>{totalVotes} votes</p>
          <p>{new Date(post.created_at).toLocaleDateString()}</p>
        </div>
        <p className="text-lg font-bold" style={{ color: `hsl(${sentiment * 120}, 70%, 60%)` }}>
          {totalVotes > 0 ? `${Math.round(sentiment * 100)}%` : '--%'}
        </p>
      </div>
    </motion.div>
  );
};

const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const modalVariants = {
  hidden: { y: "50px", opacity: 0 },
  visible: { y: "0", opacity: 1, transition: { type: "spring", stiffness: 100 } },
  exit: { y: "50px", opacity: 0 },
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="relative">
      <SpaceBackground />
      <h2 className="text-3xl font-bold text-white mb-8">My Posts</h2>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="h-48 w-full bg-slate-800/70 rounded-xl animate-pulse"></div>
           <div className="h-48 w-full bg-slate-800/70 rounded-xl animate-pulse"></div>
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post, index) => (
            <DashboardPostCard key={post.id} post={post} index={index} onClick={() => setSelectedPost(post)} />
          ))}
        </div>
      ) : (
        <div className="text-center p-12 border-2 border-dashed border-slate-800 rounded-lg">
            <h3 className="text-xl font-bold text-white">You haven't posted any thoughts yet.</h3>
        </div>
      )}

      <AnimatePresence>
        {selectedPost && (
          <motion.div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div 
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
              variants={modalVariants}
            >
              <PostCard post={selectedPost} isLink={true} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}