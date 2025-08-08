import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import PostForm from '../components/PostForm';
import { GlobeMethods } from 'react-globe.gl';

const Globe = dynamic(() => import('react-globe.gl'), { 
  ssr: false,
  loading: () => <div className="absolute inset-0 flex items-center justify-center"><p>Loading Globe...</p></div>
});

// Define the type for our points for clarity
type Point = { lat: number; lng: number; size: number; color: string };

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isPosting, setIsPosting] = useState(false);
  // This state holds the faint, ambient "stars"
  const [ambientPoints, setAmbientPoints] = useState<Point[]>([]);
  // 👇 1. This new state will hold our single, bright "launch star"
  const [launchPoint, setLaunchPoint] = useState<Point | null>(null);
  
  const globeEl = useRef<GlobeMethods | undefined>();

  useEffect(() => {
    // Your logic for the ambient background points is preserved
    const generatePoints = () => {
      const newPoints = Array.from({ length: 10 }).map(() => ({
        lat: (Math.random() - 0.5) * 180,
        lng: (Math.random() - 0.5) * 360,
        size: Math.random() * 0.4,
        color: 'rgba(59, 130, 246, 0.25)', // Made them fainter
      }));
      setAmbientPoints(newPoints);
    };
    generatePoints();
    const interval = setInterval(generatePoints, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleShareClick = () => {
    if (user) setIsPosting(true);
    else router.push('/signup');
  };

  const handlePostSuccess = useCallback(() => {
    setIsPosting(false); // Close the form

    // 👇 2. Create the "launch star"
    const newLaunchPoint: Point = {
      lat: (Math.random() - 0.5) * 160,
      lng: (Math.random() - 0.5) * 360,
      size: 0.8, // Make it larger and more prominent
      color: 'rgba(255, 255, 255, 0.95)', // Make it bright white
    };
    setLaunchPoint(newLaunchPoint);

    // Redirect after the animation has had time to play
    setTimeout(() => {
      router.push('/feed');
    }, 3500);
  }, [router]);

  // 👇 3. Combine the ambient points and the new launch point into one array for the globe
  const allPoints = launchPoint ? [...ambientPoints, launchPoint] : ambientPoints;

  return (
    <div className="relative w-screen h-[calc(100vh-81px)] -ml-[calc(50vw-50%)] overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full">
        <Globe
          ref={globeEl}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundColor="rgba(0,0,0,0)"
          pointsData={allPoints} // 👈 4. Pass the combined array to the globe
          pointAltitude="size"
          pointColor="color"
          pointResolution={8}
          // Animate points fading in
          pointsTransitionDuration={1000} 
        />
      </div>

      <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center text-center p-4">
        {isPosting ? (
          <div className="w-full max-w-2xl bg-slate-900/50 backdrop-blur-md p-8 rounded-lg animate-fade-in">
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