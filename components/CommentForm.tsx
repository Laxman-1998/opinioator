import { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient'; // We need this to get the user's session

type CommentFormProps = {
  postId: number;
  onCommentSuccess: () => void;
};

const CommentForm = ({ postId, onCommentSuccess }: CommentFormProps) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (content.trim().length === 0) return;
    setIsLoading(true);

    try {
      // --- NEW, CRUCIAL PART ---
      // 1. Get the current user's session, which contains the access token (the "passport").
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("You must be logged in to comment.");
      }

      // 2. Make the API call, but now we manually add the Authorization header.
      const response = await fetch('/api/comment', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // This is the "passport" that proves who we are to the backend API.
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ content, post_id: postId }),
      });
      // --- END OF NEW PART ---

      if (!response.ok) {
        // We can get more details from the response if it fails
        const errorBody = await response.json();
        throw new Error(errorBody.error || 'Failed to post comment');
      }
      
      toast.success('Comment posted!');
      setContent('');
      console.log('Comment submitted, calling onCommentSuccess');
      onCommentSuccess();
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full mt-4">
      <div className="flex flex-col gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-20 p-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Share your perspective privately..."
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors disabled:bg-slate-500 self-end text-sm"
          disabled={isLoading}
        >
          {isLoading ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;