import { useState, useEffect, useCallback, useRef } from 'react'; // 1. useRef is added
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import PostForm from '../components/PostForm';
import { GlobeMethods } from 'react-globe.gl'; // 2. A type for the globe is added

const Globe = dynamic(() => import('react-globe.gl'), { 
  ssr: false,
  loading: () => <p className="text-center text-slate-400">Loading Globe...</p> 
});

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isPosting, setIsPosting] = useState(false);
  const [points, setPoints] = useState<{ lat: number; lng: number; size: number; color: string }[]>([]);
  const globeEl = useRef<GlobeMethods | undefined>(); // 3. A ref to control the globe is added

  useEffect(() => {
    // Your globe points logic is preserved
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

  // 4. This success handler is now more advanced to control the camera
  const handlePostSuccess = useCallback(() => {
    setIsPosting(false);

    const lat = (Math.random() - 0.5) * 180;
    const lng = (Math.random() - 0.5) * 360;

    if (globeEl.current) {
      // Go to the spot, zoomed in
      globeEl.current.pointOfView({ lat, lng, altitude: 0.1 }, 0);

      // Start the smooth zoom out
      setTimeout(() => {
        globeEl.current?.pointOfView({ lat, lng, altitude: 2.5 }, 3000);
      }, 500);
    }

    // Redirect after the full sequence
    setTimeout(() => {
      router.push('/feed');
    }, 4000);
  }, [router]);

  return (
    <div className="relative w-screen h-[calc(100vh-81px)] -ml-[calc(50vw-50%)] overflow-hidden">
      {/* We don't need the old animation component for now */}
      {/* <ThoughtLaunchAnimation animationState={animationState} /> */}

      <div className="absolute top-0 left-0 w-full h-full">
        <Globe
          ref={globeEl} // 5. The ref is assigned here
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
            <h1 className="text-5xl ...">What does the world think?</h1>
            <p className="text-xl ...">Share a thought...</p>
            <button
              onClick={handleShareClick}
              className="bg-blue-600 ..."
            >
              Share a Thought
            </button>
            <Link href="/feed">
              <span className="absolute bottom-10 ...">
                (or, Explore the Feed)
              </span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}