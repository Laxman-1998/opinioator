import { useRouter } from 'next/router';
import PostForm from '../components/PostForm';
import { useAuth } from '../lib/auth';
import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { generateAnonymousName } from '../lib/generateAnonymousName';
import toast from 'react-hot-toast';

const CreatePostPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // This function now contains the submission logic and redirect
  const handlePostSubmit = async (content: string, agreeLabel: string, disagreeLabel: string): Promise<boolean> => {
    if (!user) return false;

    const loadingToast = toast.loading('Sharing your thought...');
    const anonymous_name = generateAnonymousName();
    const newPost = { 
      user_id: user.id, 
      content, 
      anonymous_name, 
      label_agree: agreeLabel, 
      label_disagree: disagreeLabel 
    };

    const { error } = await supabase.from('posts').insert([newPost]);

    if (error) {
      console.error('Error creating post:', error);
      toast.error(`Error: ${error.message}`, { id: loadingToast });
      return false;
    } else {
      toast.success('Your thought has been shared!', { id: loadingToast });
      router.push('/feed'); // Redirect on success!
      return true;
    }
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
      <PostForm onPostSubmit={handlePostSubmit} />
    </div>
  );
};

export default CreatePostPage;