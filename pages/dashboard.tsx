import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/auth';
import { Post } from '../lib/types';
import PostCard from '../components/PostCard';
import { motion, AnimatePresence } from 'framer-motion';
import ReactFlow, { Background, Controls, Node, Position } from 'reactflow';
import MindMapNode from '../components/MindMapNode';
import { forceSimulation, forceManyBody, forceCenter } from 'd3-force';
import Link from 'next/link';

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
  const [nodes, setNodes] = useState<Node[]>([]);

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

  // This effect runs our physics simulation to position the nodes
  useEffect(() => {
    if (posts.length > 0) {
      const simulationNodes = posts.map(post => ({ id: post.id.toString(), ...post }));

      const simulation = forceSimulation(simulationNodes)
        .force('charge', forceManyBody().strength(-250)) // Nodes push each other away
        .force('center', forceCenter(150, 150)) // They are drawn to the center
        .stop();

      // Run the simulation for a number of steps
      for (let i = 0; i < 200; ++i) simulation.tick();

      const finalNodes = simulationNodes.map((post, index) => ({
        id: post.id.toString(),
        type: 'mindMapNode',
        data: { post: post as Post, onClick: () => setSelectedPost(post as Post) },
        position: { x: post.x || 0, y: post.y || 0 },
      }));
      setNodes(finalNodes);
    }
  }, [posts]);

  if (authLoading) {
    return <p className="text-center">Loading...</p>;
  }
  
  return (
    <>
      <div>
        <h2 className="text-3xl font-bold text-white mb-8">My Mind Map</h2>
        <div className="w-full h-[70vh] bg-slate-900/50 rounded-lg border border-slate-800">
          {loading ? (
            <div className="w-full h-full rounded-lg animate-pulse bg-slate-800" />
          ) : posts.length > 0 ? (
            <ReactFlow
              nodes={nodes}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.1}
            >
              <Background />
              <Controls />
            </ReactFlow>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center p-12 border-2 border-dashed border-slate-800 rounded-lg">
                <h3 className="text-xl font-bold text-white">Your mind map is empty.</h3>
                <p className="text-slate-400 mt-2">
                  <Link href="/feed"><span className="text-blue-400 hover:underline cursor-pointer">Head to the feed</span></Link> to share a thought.
                </p>
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