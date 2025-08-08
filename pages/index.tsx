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

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isPosting, setIsPosting] = useState(false);
  const [points, setPoints] = useState<{ lat: number; lng: number; size: number; color: string }[]>([]);
  const globeEl = useRef<GlobeMethods | undefined>();

  useEffect(() => {
    // This generates the ambient points on the globe
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
    if (user) setIsPosting(true);
    else router.push('/signup');
  };

  const handlePostSuccess = useCallback(() => {
    setIsPosting(false); // Close the form immediately

    // Define a random point on Earth
    const lat = (Math.random() - 0.5) * 160; // Keep it away from the poles
    const lng = (Math.random() - 0.5) * 360;

    if (globeEl.current) {
      // 1. Instantly jump to the location, zoomed in close.
      // Altitude 0.1 is like being very near the surface.
      globeEl.current.pointOfView({ lat, lng, altitude: 0.1 }, 0);

      // 2. After a brief pause, begin the slow, cinematic pull-back into space.
      // We animate to altitude 3 over 4 seconds for a majestic feel.
      setTimeout(() => {
        globeEl.current?.pointOfView({ lat, lng, altitude: 3 }, 4000); 
      }, 750); // A 750ms pause to appreciate the close-up view
    }

    // 3. After the entire animation sequence is over, redirect to the feed.
    setTimeout(() => {
      router.push('/feed');
    }, 5000); // 0.75s pause + 4s animation + 0.25s buffer
  }, [router]);

  return (
    <div className="relative w-screen h-[calc(100vh-81px)] -ml-[calc(50vw-50%)] overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full">
        <Globe
          ref={globeEl}
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