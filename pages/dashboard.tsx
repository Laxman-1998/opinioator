import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/auth';
import { Post } from '../lib/types';
import PostCard from '../components/PostCard';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const TimelineCard = ({ post, onClick }: { post: Post; onClick: () => void }) => {
  const agreeCount = post.agree_count ?? 0;
  const disagreeCount = post.disagree_count ?? 0;
  const totalVotes = agreeCount + disagreeCount;
  const agreePercentage = totalVotes === 0 ? 50 : Math.round((agreeCount / totalVotes) * 100);

  return (
    <motion.div 
      className="flex-shrink-0 w-80 h-40 p-4 bg-slate-900/50 border border-slate-800 rounded-lg cursor-pointer flex flex-col justify-between"
      onClick={onClick}
      whileHover={{ scale: 1.05, borderColor: '#3b82f6' }}
      layout
    >
      <p className="text-slate-300 text-sm overflow-hidden text-ellipsis">{post.content}</p>
      <div>
        <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
            <div className="bg-gradient-to-r from-red-500 via-purple-500 to-green-500 h-1.5 rounded-full" style={{ width: `${agreePercentage}%` }}></div>
        </div>
        <p className="text-xs text-slate-500 mt-1">{new Date(post.created_at).toLocaleDateString()}</p>
      </div>
    </motion.div>
  );
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

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

  if (authLoading || loading) {
    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-8">My Thought Timeline</h2>
            <div className="h-40 w-full bg-slate-800 rounded-lg animate-pulse"></div>
        </div>
    );
  }
  
  return (
    // We use a React Fragment <> to return two top-level elements: the page and the modal
    <>
      <div>
        <h2 className="text-3xl font-bold text-white mb-8">My Thought Timeline</h2>
        
        {posts.length > 0 ? (
          <div className="flex gap-6 pb-6 overflow-x-auto">
            {posts.map((post) => (
              <TimelineCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
            ))}
          </div>
        ) : (
          <div className="text-center p-12 border-2 border-dashed border-slate-800 rounded-lg">
              <h3 className="text-xl font-bold text-white">You haven't posted any thoughts yet.</h3>
          </div>
        )}
      </div>

      {/* The Modal is now OUTSIDE the main page div, solving the CSS conflict */}
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
              <PostCard post={selectedPost} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}