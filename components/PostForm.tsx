// components/PostForm.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/auth';

// Simple sentiment detection
function detectSentiment(text: string) {
  const positiveWords = ['good', 'great', 'love', 'happy', 'hope', 'amazing', 'awesome', 'inspired', 'joy'];
  const negativeWords = ['bad', 'hate', 'sad', 'angry', 'lonely', 'upset', 'worst', 'fear'];
  
  const lowerText = text.toLowerCase();
  let score = 0;
  positiveWords.forEach(word => lowerText.includes(word) && score++);
  negativeWords.forEach(word => lowerText.includes(word) && score--);

  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}

type PostFormProps = {
  onPostSuccess: () => void;
};

const PostForm = ({ onPostSuccess }: PostFormProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [labelDisagree, setLabelDisagree] = useState('Disagree');
  const [labelAgree, setLabelAgree] = useState('Agree');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      toast.error('You must be logged in to post.');
      return;
    }
    if (content.trim().length === 0) return;

    setIsLoading(true);

    try {
      // Get access token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        toast.error('No valid session found. Please log in again.');
        setIsLoading(false);
        return;
      }

      // Detect sentiment
      const sentiment = detectSentiment(content);

      const response = await fetch('/api/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          content,
          label_agree: labelAgree,
          label_disagree: labelDisagree,
          country: user.user_metadata?.country || null,
          sentiment
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to create post');
      }

      toast.success('Your thought is now live!');
      setContent('');
      onPostSuccess();

      // ✅ Redirect after success
      router.push('/feed');

    } catch (error) {
      toast.error('Sorry, something went wrong.');
      console.error('Error posting opinion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-28 p-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-500"
          placeholder="What's on your mind?..."
          disabled={isLoading}
        />
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={labelDisagree}
            onChange={(e) => setLabelDisagree(e.target.value)}
            className="w-full p-2 text-sm bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none placeholder:text-slate-500 text-center"
            maxLength={30}
          />
          <input
            type="text"
            value={labelAgree}
            onChange={(e) => setLabelAgree(e.target.value)}
            className="w-full p-2 text-sm bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none placeholder:text-slate-500 text-center"
            maxLength={30}
          />
        </div>
        <div className="flex justify-between items-center">
          <button
            type="button"
            className="text-xs text-slate-400 border border-slate-700 py-1 px-3 rounded-full hover:bg-slate-800 hover:text-white transition-colors"
          >
            Choose a template...
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed self-end"
            disabled={isLoading || content.trim().length === 0}
          >
            {isLoading ? 'Sharing...' : 'Share Thought'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PostForm;
