import { useState, useMemo } from 'react';
import { Comment } from '../lib/types';

// Utility for relative time display
const timeSince = (dateStr: string) => {
  const date = new Date(dateStr);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return `${interval} year${interval > 1 ? 's' : ''} ago`;
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `${interval} month${interval > 1 ? 's' : ''} ago`;
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `${interval} day${interval > 1 ? 's' : ''} ago`;
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `${interval} hour${interval > 1 ? 's' : ''} ago`;
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `${interval} minute${interval > 1 ? 's' : ''} ago`;
  return 'Just now';
};

// Avatar component generates colored circle with initials
const Avatar = ({ name }: { name: string }) => {
  const colors = [
    '#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f43f5e', '#22d3ee',
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = colors[hash % colors.length];
  const initials = name
    .split('_')
    .map((part) => part[0].toUpperCase())
    .join('');
  return (
    <div
      className="flex items-center justify-center rounded-full text-white font-bold select-none"
      style={{ backgroundColor: color, width: 32, height: 32, flexShrink: 0 }}
      title={name.replace(/_/g, ' ')}
    >
      {initials}
    </div>
  );
};

type CommentListProps = {
  comments: Comment[];
  onReport: (commentId: number) => void;
  onUpvote: (commentId: number) => void;
  onDownvote: (commentId: number) => void;
  onLike: (commentId: number) => void;
  hideKeywords?: string[];
  reportThreshold?: number;
};

const CommentList = ({
  comments,
  onReport,
  onUpvote,
  onDownvote,
  onLike,
  hideKeywords = [],
  reportThreshold = 3,
}: CommentListProps) => {
  const [sortOrder, setSortOrder] = useState<'recent' | 'liked' | 'upvote'>('recent');
  const [filterText, setFilterText] = useState('');

  const filteredComments = useMemo(() => {
    return comments.filter((comment) => {
      if ((comment.reportCount ?? 0) >= reportThreshold) return false;
      if (hideKeywords.length > 0) {
        const lowered = comment.content.toLowerCase();
        if (hideKeywords.some((kw) => lowered.includes(kw.toLowerCase()))) return false;
      }
      if (filterText.trim() === '') return true;
      const lcFilter = filterText.toLowerCase();
      return (
        comment.content.toLowerCase().includes(lcFilter) ||
        (comment.anonymous_name?.toLowerCase().includes(lcFilter) ?? false)
      );
    });
  }, [comments, hideKeywords, filterText, reportThreshold]);

  const sortedComments = useMemo(() => {
    const arr = [...filteredComments];
    if (sortOrder === 'recent') {
      arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortOrder === 'liked') {
      arr.sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0));
    } else if (sortOrder === 'upvote') {
      arr.sort((a, b) => (b.upvotes ?? 0) - (a.upvotes ?? 0));
    }
    return arr;
  }, [filteredComments, sortOrder]);

  const sensitiveKeywords = ['violence', 'abuse', 'suicide', 'self-harm'];
  const hasSensitiveContent = (content: string) =>
    sensitiveKeywords.some((kw) => content.toLowerCase().includes(kw));

  return (
    <div>
      {/* Sorting & Filtering Controls */}
      <div className="flex justify-between mb-4 items-center gap-2 flex-wrap">
        <div>
          <label htmlFor="sortOrder" className="mr-2 text-sm font-semibold text-slate-300">
            Sort by:
          </label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'recent' | 'liked' | 'upvote')}
            className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-100"
          >
            <option value="recent">Most Recent</option>
            <option value="liked">Most Liked</option>
            <option value="upvote">Most Upvoted</option>
          </select>
        </div>

        <div>
          <input
            type="text"
            placeholder="Filter comments..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-100 min-w-[160px]"
          />
        </div>
      </div>

      {/* Comments List */}
      {sortedComments.length === 0 ? (
        <p className="text-center text-slate-400 italic py-8">
          Be the first to comment privately and anonymously.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {sortedComments.map((comment) => {
            const sensitive = hasSensitiveContent(comment.content);
            return (
              <div
                key={comment.id}
                className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 relative"
              >
                <div className="flex items-start gap-3">
                  <Avatar name={comment.anonymous_name ?? 'Anon_User'} />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-slate-400 font-bold select-text">
                        {comment.anonymous_name} said:
                      </p>
                      <p className="text-xs text-slate-500 whitespace-nowrap select-text">
                        {timeSince(comment.created_at)}
                        {comment.edited_at ? ' (edited)' : ''}
                      </p>
                    </div>

                    {/* Comment content */}
                    <p className="text-slate-200 mt-2 whitespace-pre-wrap">{comment.content}</p>

                    {sensitive && (
                      <p className="mt-1 text-xs italic text-yellow-400">
                        ⚠️ This comment may contain sensitive content. If you need help, seek support.
                      </p>
                    )}

                    {/* Engagement buttons */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 select-none">
                      <button
                        onClick={() => onUpvote(comment.id)}
                        aria-label="Upvote comment"
                        className="hover:text-green-400 transition-colors"
                      >
                        👍 {comment.upvotes ?? 0}
                      </button>
                      <button
                        onClick={() => onDownvote(comment.id)}
                        aria-label="Downvote comment"
                        className="hover:text-red-400 transition-colors"
                      >
                        👎 {comment.downvotes ?? 0}
                      </button>
                      <button
                        onClick={() => onLike(comment.id)}
                        aria-label="Like comment"
                        className="hover:text-blue-400 transition-colors"
                      >
                        💙 {comment.likeCount ?? 0}
                      </button>
                      <button
                        onClick={() => onReport(comment.id)}
                        aria-label="Report comment"
                        className="hover:text-yellow-400 transition-colors"
                      >
                        🚩 Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommentList;
