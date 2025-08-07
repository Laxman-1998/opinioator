import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import PostForm from '../components/PostForm';
import ThoughtLaunchAnimation from '../components/ThoughtLaunchAnimation';
import { useModal } from '../context/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';

const Globe = dynamic(() => import('react-globe.gl'), { 
  ssr: false,
  loading: () => <p className="text-center text-slate-400">Loading Globe...</p> 
});

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { isModalOpen, openModal, closeModal } = useModal();
  const [points, setPoints] = useState<{ lat: number; lng: number; size: number; color: string }[]>([]);
  const [animationState, setAnimationState] = useState<'idle' | 'launching' | 'spreading'>('idle');

  useEffect(() => {
    const generatePoints = () => {
      const newPoints = Array.from({ length: 10 }).map(() => ({
        lat: (Math.random() - 0.5) * 180,
        lng: (Math.random() - 0.5) * 360,
        size: Math.random() * 0.4,
        color: 'rgba(59, 130, 246, 0.75)',
      }));
      setPoints(newPoints);
    };
    generatePoints();
    const interval = setInterval(generatePoints, 4000);
    return () => clearInterval(interval);
  }, []);

  // 👇 THE FIX IS HERE: This function now triggers the animation
  const handlePostSuccess = useCallback(() => {
    closeModal();
    setAnimationState('launching');

    setTimeout(() => {
      setAnimationState('idle');
      router.push('/feed'); // Redirect after animation
    }, 2500);
  }, [closeModal, router]);

  return (
    <>
      <ThoughtLaunchAnimation animationState={animationState} />

      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <Globe
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundColor="rgba(0,0,0,0)"
          pointsData={points}
          pointAltitude="size"
          pointColor="color"
        />
      </div>

      <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center text-center p-4">
        <h1 className="text-5xl font-bold text-white mb-4 animate-fade-in-down">
          What does the world think?
        </h1>
        <p className="text-xl text-slate-400 mb-8 animate-fade-in-up">
          Share a thought. Get honest validation. Stay anonymous.
        </p>
        <button
          onClick={openModal}
          className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition-colors animate-pulse-slow"
        >
          Share a Thought
        </button>
        <Link href="/feed">
          <span className="absolute bottom-10 text-slate-400 hover:text-white transition-colors cursor-pointer animate-fade-in">
            (or, Explore the Feed)
          </span>
        </Link>
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
}