import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import PostForm from '../components/PostForm';

// Dynamically import the Globe to prevent server-side rendering errors
const Globe = dynamic(() => import('react-globe.gl'), { 
  ssr: false,
  loading: () => <p className="text-center text-slate-400">Loading Globe...</p> 
});

export default function HomePage() {
  const { user } = useAuth(); // Get the current user status
  const router = useRouter(); // Get the router to handle redirects
  const [isPosting, setIsPosting] = useState(false);
  const [points, setPoints] = useState<{ lat: number; lng: number; size: number; color: string }[]>([]);

  useEffect(() => {
    const generatePoints = () => {
      const newPoints = [...Array(10).keys()].map(() => ({
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

  // This is our new, intelligent click handler
  const handleShareClick = () => {
    if (user) {
      // If the user is logged in, show the form
      setIsPosting(true);
    } else {
      // If not logged in, redirect them to the signup page
      router.push('/signup');
    }
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
            {/* The PostForm still redirects to the private post page on success */}
            <PostForm onPostSuccess={() => {}} /> 
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
              onClick={handleShareClick} // Use our new intelligent handler
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