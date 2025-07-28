import { useState } from 'react';
import toast from 'react-hot-toast';
const CommentForm = ({ postId, onCommentSuccess }: { postId: number; onCommentSuccess: () => void; }) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (content.trim().length === 0) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, post_id: postId }),
      });
      if (!response.ok) throw new Error('Failed to post comment');
      toast.success('Comment posted!');
      setContent('');
      onCommentSuccess();
    } catch (error) {
      toast.error('Error posting comment.');
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
