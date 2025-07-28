import { useState } from 'react';
import PostCard from '../components/PostCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Post } from '../lib/types';

// A fake post for testing purposes
const fakePost: Post = {
  id: 1,
  created_at: new Date().toISOString(),
  content: 'This is a test post to debug the modal.',
  agree_count: 10,
  disagree_count: 2,
  label_agree: 'Agree',
  label_disagree: 'Disagree',
  user_id: '123-456-789',
};

// Animation variants from our dashboard
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
const modalVariants = {
  hidden: { y: "50px", opacity: 0 },
  visible: { y: "0", opacity: 1, transition: { type: "spring", stiffness: 100 } },
  exit: { y: "50px", opacity: 0 },
};

export default function TestPage() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  return (
    <div className="text-center p-20">
      <h1 className="text-3xl font-bold mb-8">Modal Test Page</h1>
      <button
        onClick={() => setSelectedPost(fakePost)}
        className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700"
      >
        Test the Modal
      </button>

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
    </div>
  );
}