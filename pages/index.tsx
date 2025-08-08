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

type Point = { lat: number; lng: number; size: number; color: string; };
type Ring = { lat: number; lng: number; };

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isPosting, setIsPosting] = useState(false);
  const [ambientPoints, setAmbientPoints] = useState<Point[]>([]);
  const [rings, setRings] = useState<Ring[]>([]);
  const [messenger, setMessenger] = useState<Point | null>(null);
  
  const globeEl = useRef<GlobeMethods | undefined>();

  useEffect(() => {
    const generatePoints = () => {
      const newPoints = Array.from({ length: 20 }).map(() => ({
        lat: (Math.random() - 0.5) * 180, lng: (Math.random() - 0.5) * 360,
        size: Math.random() * 0.3, color: 'rgba(59, 130, 246, 0.25)',
      }));
      setAmbientPoints(newPoints);
    };
    generatePoints();
  }, []);

  const handleShareClick = () => {
    if (user) setIsPosting(true);
    else router.push('/signup');
  };

  const handlePostSuccess = useCallback(() => {
    setIsPosting(false);
    const startLat = (Math.random() - 0.5) * 160;
    const startLng = (Math.random() - 0.5) * 360;
    setMessenger({ lat: startLat, lng: startLng, size: 0.5, color: 'white' });
    setTimeout(() => { setRings([{ lat: startLat, lng: startLng }]); }, 500);
    setTimeout(() => {
      setMessenger(null);
      setRings([]);
      router.push('/feed');
    }, 4000);
  }, [router]);

  return (
    <div className="relative w-screen h-[calc(100vh-81px)] -ml-[calc(50vw-50%)] overflow-hidden">
      {/* 👇 FIX #1: Add `pointer-events-none` to the globe's container */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <Globe
          ref={globeEl}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundColor="rgba(0,0,0,0)"
          pointsData={messenger ? [...ambientPoints, messenger] : ambientPoints}
          pointAltitude="size"
          pointColor="color"
          pointsTransitionDuration={1000}
          ringsData={rings}
          ringColor={() => 'rgba(255,255,255,0.5)'}
          ringMaxRadius={5}
          ringPropagationSpeed={2}
          ringRepeatPeriod={1000}
        />
      </div>
      {/* 👇 FIX #2: Add `relative z-10` to ensure this content is on top */}
      <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center text-center p-4 relative z-10">
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