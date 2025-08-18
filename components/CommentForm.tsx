// components/CommentForm.tsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to comment.");
      }

      // Simple anonymous name generator (can replace with your own logic)
      const generateAnonymousName = () => {
        const adjectives = ['Galactic', 'Radiant', 'Nebulous', 'Stellar', 'Cosmic', 'Lunar', 'Solar'];
        const nouns = ['Photon', 'Cluster', 'Nebula', 'Comet', 'Meteor', 'Quasar', 'Pulsar'];
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const number = Math.floor(Math.random() * 100);
        return `${adjective}_${noun}_${number}`;
      };

      const generatedName = generateAnonymousName();

      const { error } = await supabase
        .from('comments')
        .insert([
          {
            content,
            post_id: Number(postId),
            user_id: session.user.id,
            anonymous_name: generatedName,
          },
        ]);

      if (error) {
        throw error;
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
          id="comment-content"
          name="comment-content"
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
