// components/CommentForm.tsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import ReactMarkdown from 'react-markdown';

type CommentFormProps = {
  postId: number;
  onCommentSuccess: () => void;
  parentCommentId?: number | null; // for replies
  onCancelReply?: () => void; // to cancel reply UI
};

const MAX_COMMENT_LENGTH = 1500;
const sensitiveKeywords = ['violence', 'abuse', 'suicide', 'self-harm'];

const CommentForm = ({
  postId,
  onCommentSuccess,
  parentCommentId = null,
  onCancelReply,
}: CommentFormProps) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [safetyWarning, setSafetyWarning] = useState<string | null>(null);
  // Removed showPreview and related code as requested

  useEffect(() => {
    setCharCount(content.length);
    const lowered = content.toLowerCase();
    const hasSensitive = sensitiveKeywords.some((kw) => lowered.includes(kw));
    setSafetyWarning(
      hasSensitive ? '⚠️ Your comment may contain sensitive content. Please be mindful.' : null
    );
  }, [content]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (content.trim().length === 0) {
      toast.error('Comment cannot be empty.');
      return;
    }
    if (content.length > MAX_COMMENT_LENGTH) {
      toast.error(`Comment cannot exceed ${MAX_COMMENT_LENGTH} characters.`);
      return;
    }
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('You must be logged in to comment.');

      const generateAnonymousName = () => {
        const adjectives = [
          'Galactic', 'Radiant', 'Nebulous', 'Stellar', 'Cosmic', 'Lunar', 'Solar',
        ];
        const nouns = [
          'Photon', 'Cluster', 'Nebula', 'Comet', 'Meteor', 'Quasar', 'Pulsar',
        ];
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const number = Math.floor(Math.random() * 100);
        return `${adjective}_${noun}_${number}`;
      };

      const generatedName = generateAnonymousName();
      const insertPayload: any = {
        content,
        post_id: Number(postId),
        user_id: session.user.id,
        anonymous_name: generatedName,
      };
      if (parentCommentId) {
        insertPayload.parent_comment_id = parentCommentId;
      }

      const { error } = await supabase.from('comments').insert([insertPayload]);
      if (error) throw error;

      toast.success('Comment posted!');
      setContent('');
      if (onCancelReply) {
        onCancelReply();
      }
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
          maxLength={MAX_COMMENT_LENGTH}
          className="w-full h-32 p-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
          placeholder={parentCommentId ? 'Write a reply...' : 'Share your perspective privately...'}
          disabled={isLoading}
          aria-describedby="comment-length-info"
        />
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span id="comment-length-info">
            {charCount} / {MAX_COMMENT_LENGTH} characters
          </span>
          {safetyWarning && (
            <span className="text-yellow-400 italic">{safetyWarning}</span>
          )}
        </div>
        <div className="flex gap-4 items-center">
          {/* Preview button removed as requested */}
          {parentCommentId && onCancelReply && (
            <button
              type="button"
              onClick={onCancelReply}
              className="text-red-400 hover:underline text-xs"
              disabled={isLoading}
            >
              Cancel Reply
            </button>
          )}
        </div>
        <button
          type="submit"
          className={`bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors self-end text-sm mt-2 ${
            content.trim().length === 0 || content.length > MAX_COMMENT_LENGTH || isLoading
              ? 'bg-gray-500 cursor-not-allowed'
              : 'hover:bg-slate-700 cursor-pointer'
          }`}
          disabled={content.trim().length === 0 || content.length > MAX_COMMENT_LENGTH || isLoading}
        >
          {isLoading ? (parentCommentId ? 'Posting reply...' : 'Posting...') : parentCommentId ? 'Post Reply' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
