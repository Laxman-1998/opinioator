import { useRouter } from 'next/router';
import PostForm from '../components/PostForm';
import { useAuth } from '../lib/auth';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const CreatePostPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // This is the function the REAL form will use
  const handlePostSuccess = () => {
    toast.success("Post was successful! Attempting redirect...");
    router.push('/feed');
  };

  // 👇 THIS IS OUR NEW TEST FUNCTION
  const handleTestRedirect = () => {
    toast('TEST: Forcing redirect now...', { icon: '🚀' });
    router.push('/feed');
  };

  if (loading || !user) {
    return <p className="text-center">Loading...</p>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      
      {/* THIS IS THE TEST BUTTON */}
      <div className="text-center p-4 border-2 border-dashed border-orange-500 rounded-lg">
        <h2 className="text-lg font-bold text-orange-400">Step 1: Run This Test First</h2>
        <p className="text-slate-400 text-sm mb-4">This button bypasses the form entirely.</p>
        <button
          onClick={handleTestRedirect}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Test Redirect Button
        </button>
      </div>

      <div className="text-center">
        <h1 className="text-4xl font-bold">Share Your Thought</h1>
        <p className="text-slate-400 mt-2">Step 2: After testing, you can try the real form.</p>
      </div>
      <PostForm onPostSuccess={handlePostSuccess} />
    </div>
  );
};

export default CreatePostPage;