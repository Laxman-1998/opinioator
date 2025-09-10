import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

type CommentFormProps = {
  postId: number;
  parentId?: number | null;  // new optional prop for replies
  onCommentSuccess: () => void;
};

const SENSITIVE_KEYWORDS = ['violence', 'self-harm', 'suicide', 'kill', 'harm', 'abuse', 'rape'];
const MAX_CHAR_LIMIT = 500;

const CommentForm = ({ postId, parentId = null, onCommentSuccess }: CommentFormProps) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const lowerContent = content.toLowerCase();
    const found = SENSITIVE_KEYWORDS.some(keyword => lowerContent.includes(keyword));
    setShowWarning(found);
  }, [content]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (content.trim().length === 0) return;
    if (content.length > MAX_CHAR_LIMIT) {
      toast.error(`Comment cannot exceed ${MAX_CHAR_LIMIT} characters.`);
      return;
    }
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to comment.");
      }
      const generateAnonymousName = () => {
        const adjectives = ['Galactic', 'Radiant', 'Nebulous', 'Stellar', 'Cosmic', 'Lunar', 'Solar'];
        const nouns = ['Photon', 'Cluster', 'Nebula', 'Comet', 'Meteor', 'Quasar', 'Pulsar'];
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const number = Math.floor(Math.random() * 100);
        return `${adjective}_${noun}_${number}`;
      };
      const generatedName = generateAnonymousName();

      const insertData: Record<string, any> = {
        content,
        post_id: Number(postId),
        user_id: session.user.id,
        anonymous_name: generatedName,
      };
      if (parentId) {
        insertData.parent_id = parentId;
      }

      const { error } = await supabase.from('comments').insert([insertData]);
      if (error) {
        throw error;
      }
      toast.success('Comment posted!');
      setContent('');
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
          className={`w-full h-20 p-3 bg-slate-800/50 border rounded-lg focus:ring-2 focus:outline-none
            border-slate-700 focus:ring-blue-500 resize-none`}
          placeholder={parentId ? "Write a reply..." : "Share your perspective privately..."}
          maxLength={MAX_CHAR_LIMIT}
          disabled={isLoading}
        />
        <div className="flex justify-between items-center">
          <small className={`text-sm ${content.length > MAX_CHAR_LIMIT ? 'text-red-500' : 'text-slate-400'}`}>
            {content.length} / {MAX_CHAR_LIMIT} characters
          </small>
          {showWarning && (
            <small className="text-red-500 text-sm font-semibold">
              Warning: Your comment contains sensitive content.
            </small>
          )}
        </div>
        <button
          type="submit"
          className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors disabled:bg-slate-500 self-end text-sm"
          disabled={isLoading}
        >
          {isLoading ? 'Posting...' : parentId ? 'Post Reply' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
