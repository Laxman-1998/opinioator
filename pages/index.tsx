import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import PostForm from '../components/PostForm';

const Globe = dynamic(() => import('react-globe.gl'), { 
  ssr: false,
  loading: () => <p className="text-center text-slate-400">Loading Globe...</p> 
});

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isPosting, setIsPosting] = useState(false);
  const [points, setPoints] = useState<{ lat: number; lng: number; size: number; color: string }[]>([]);

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

  const handleShareClick = () => {
    if (user) {
      setIsPosting(true);
    } else {
      router.push('/signup');
    }
  };

  // 👇 THE FIX IS HERE: This function now correctly handles the redirect
  const handlePostSuccess = () => {
    setIsPosting(false); // Hide the form
    router.push('/feed'); // Redirect to the feed
  };

  return (
    <div className="relative w-screen h-[calc(100vh-81px)] -ml-[calc(50vw-50%)] overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full">
        <Globe
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundColor="rgba(0,0,0,0)"
          pointsData={points}
          pointAltitude="size"
          pointColor="color"
        />
      </div>
      <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center text-center p-4">
        {isPosting ? (
          <div className="w-full max-w-2xl bg-slate-900/50 backdrop-blur-md p-8 rounded-lg animate-fade-in">
            {/* We pass the corrected success handler to the form */}
            <PostForm onPostSuccess={handlePostSuccess} /> 
          </div>
        ) : (
          <>
            <h1 className="text-5xl font-bold text-white mb-4 animate-fade-in-down">
              What does the world think?
            </h1>
            <p className="text-xl text-slate-400 mb-8 animate-fade-in-up">
              Share a thought. Get honest validation. Stay anonymous.
            </p>
            <button
              onClick={handleShareClick}
              className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition-colors animate-pulse-slow"
            >
              Share a Thought
            </button>
            <Link href="/feed">
              <span className="absolute bottom-10 text-slate-400 hover:text-white transition-colors cursor-pointer animate-fade-in">
                (or, Explore the Feed)
              </span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}