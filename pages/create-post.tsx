import { useRouter } from 'next/router';
import PostForm from '../components/PostForm';
import { useAuth } from '../lib/auth';
import { useEffect } from 'react';

const CreatePostPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handlePostSuccess = () => {
    router.push('/feed');
  };

  if (loading || !user) {
    return <p className="text-center">Loading...</p>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Share Your Thought</h1>
        <p className="text-slate-400 mt-2">Your identity will remain anonymous.</p>
      </div>
      <PostForm onPostSuccess={handlePostSuccess} />
    </div>
  );
};

export default CreatePostPage;