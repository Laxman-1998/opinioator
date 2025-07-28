import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/auth';
import { Post } from '../lib/types';
import PostCard from '../components/PostCard';
import { motion, AnimatePresence } from 'framer-motion';
import ReactFlow, { Background, Controls, Node } from 'reactflow';
import MindMapNode from '../components/MindMapNode';

// Define the custom node types for React Flow
const nodeTypes = { mindMapNode: MindMapNode };

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

  // This function fetches the user's posts
  const getMyPosts = useCallback(async () => {
    if (user) {
      setLoading(true);
      const { data } = await supabase.from('posts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data) setPosts(data);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      getMyPosts();
    }
  }, [user, authLoading, router, getMyPosts]);

  // This converts our post data into the node format that React Flow understands
  const nodes: Node[] = useMemo(() => {
    return posts.map((post, index) => ({
      id: post.id.toString(),
      type: 'mindMapNode',
      data: { post: post, onClick: () => setSelectedPost(post) },
      position: { x: (index % 4) * 200, y: Math.floor(index / 4) * 200 },
    }));
  }, [posts]);

  if (authLoading || loading) {
    return (
      <div>
        <h2 className="text-3xl font-bold text-white mb-8">My Mind Map</h2>
        <div className="h-64 w-full bg-slate-800 rounded-lg animate-pulse"></div>
      </div>
    );
  }
  
  return (
    <>
      <div>
        <h2 className="text-3xl font-bold text-white mb-8">My Mind Map</h2>
        <div className="w-full h-[60vh] bg-slate-900/50 rounded-lg border border-slate-800">
          {posts.length > 0 ? (
            <ReactFlow
              nodes={nodes}
              nodeTypes={nodeTypes}
              fitView
            >
              <Background />
              <Controls />
            </ReactFlow>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center p-12">
                    <h3 className="text-xl font-bold text-white">Your mind map is empty.</h3>
                    <p className="text-slate-400 mt-2">Head to the feed to share a thought.</p>
                </div>
            </div>
          )}
        </div>
      </div>

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