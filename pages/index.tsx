import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import { useModal } from '../context/ModalContext';
import PostForm from '../components/PostForm';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const HomePage = () => {
  const { user } = useAuth();
  const { isModalOpen, openModal, closeModal } = useModal();
  const router = useRouter();

  const handlePostSuccess = () => {
    closeModal();
    router.push('/feed');
  };

  return (
    <>
      {/* 👇 THE GLOBE/STARFIELD BACKGROUND IS RESTORED HERE */}
      <div className="fixed top-0 left-0 w-full h-full -z-10">
        <div className="stars-container">
          <div className="stars1"></div>
          <div className="stars2"></div>
          <div className="stars3"></div>
        </div>
        {/* You may have a specific globe component or image here as well.
            This restores the starfield effect from your globals.css */}
      </div>

      <div className="w-full text-center flex flex-col items-center justify-center min-h-[70vh]">
        <h1 className="text-5xl md:text-6xl font-bold">What does the world think?</h1>
        <p className="text-slate-400 mt-4 max-w-xl">Share a thought. Get honest validation. Stay anonymous.</p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <button onClick={openModal} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-center cursor-pointer transition-colors duration-200">
            Share a Thought
          </button>
          <Link href="/feed" passHref>
            <span className="text-slate-400 hover:text-white cursor-pointer text-sm">
              (or, explore the feed)
            </span>
          </Link>
        </div>
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

export default HomePage;