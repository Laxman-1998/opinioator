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

type Point = { lat: number; lng: number; size: number; color: string };
type Arc = { startLat: number; startLng: number; endLat: number; endLng: number; color: string };
type Ring = { lat: number; lng: number; maxR: number; transitionMs: number; ringColor: () => string; };

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isPosting, setIsPosting] = useState(false);
  const [ambientPoints, setAmbientPoints] = useState<Point[]>([]);
  // 👇 1. New state for the connecting arcs and the ripple effect
  const [arcs, setArcs] = useState<Arc[]>([]);
  const [rings, setRings] = useState<Ring[]>([]);
  
  const globeEl = useRef<GlobeMethods | undefined>();

  useEffect(() => {
    const generatePoints = () => {
      const newPoints = Array.from({ length: 10 }).map(() => ({
        lat: (Math.random() - 0.5) * 180,
        lng: (Math.random() - 0.5) * 360,
        size: Math.random() * 0.4,
        color: 'rgba(59, 130, 246, 0.25)',
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
    setIsPosting(false);

    // 2. Define the launch point
    const startLat = (Math.random() - 0.5) * 160;
    const startLng = (Math.random() - 0.5) * 360;

    // 3. Create a ripple effect at the launch point
    const newRing: Ring = {
      lat: startLat,
      lng: startLng,
      maxR: 5,
      transitionMs: 3000,
      ringColor: () => 'rgba(255, 255, 255, 0.5)',
    };
    setRings([newRing]);

    // 4. Create several connecting arcs
    const newArcs = Array.from({ length: 5 }).map(() => ({
      startLat,
      startLng,
      endLat: (Math.random() - 0.5) * 180,
      endLng: (Math.random() - 0.5) * 360,
      color: `rgba(59, 130, 246, ${Math.random() * 0.5 + 0.3})`,
    }));
    setArcs(newArcs);
    
    // Redirect after the animation
    setTimeout(() => {
      router.push('/feed');
    }, 4000);
  }, [router]);

  return (
    <div className="relative w-screen h-[calc(100vh-81px)] -ml-[calc(50vw-50%)] overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full">
        <Globe
          ref={globeEl}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundColor="rgba(0,0,0,0)"
          pointsData={ambientPoints}
          pointAltitude="size"
          pointColor="color"
          // 👇 5. Add the new props to render the animation
          arcsData={arcs}
          arcColor="color"
          arcDashLength={0.4}
          arcDashGap={0.6}
          arcDashAnimateTime={2000}
          arcStroke={0.3}
          ringsData={rings}
          ringColor="ringColor"
          ringMaxRadius="maxR"
          ringPropagationSpeed={1}
          ringRepeatPeriod={700}
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