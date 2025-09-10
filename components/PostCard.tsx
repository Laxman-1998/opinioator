import { useState, useEffect } from 'react';
import { Post } from '../lib/types';
import Link from 'next/link';

// Utility to get colored circle with initial
const animalInitialColors: Record<string, string> = {
  P: '#ef4444', // red
  C: '#3b82f6', // blue
  N: '#10b981', // green
  M: '#f59e0b', // amber
  // Add more as needed
};

const getAnimalInitialAndColor = (name: string) => {
  if (!name) return { initial: '?', color: '#9ca3af' };
  const initial = name.charAt(0).toUpperCase();
  const color = animalInitialColors[initial] || '#6366f1'; // default indigo
  return { initial, color };
};

// Updated type with commentCount for private comments badge
type PostCardProps = {
  post: Post;
  isLink?: boolean;
  commentCount?: number;
};

const PostCard = ({ post, isLink = true, commentCount }: PostCardProps) => {
  const [currentPost, setCurrentPost] = useState(post);
  const [userVote, setUserVote] = useState<string | null>(null);

  useEffect(() => {
    const vote = localStorage.getItem(`voted_on_post_${post.id}`);
    if (vote) {
      setUserVote(vote);
    }
  }, [post.id]);

  const handleVote = async (voteType: 'agree' | 'disagree') => {
    if (userVote) return;
    localStorage.setItem(`voted_on_post_${post.id}`, voteType);
    setUserVote(voteType);
    setCurrentPost(prevPost => ({
      ...prevPost,
      agree_count: (prevPost.agree_count ?? 0) + (voteType === 'agree' ? 1 : 0),
      disagree_count: (prevPost.disagree_count ?? 0) + (voteType === 'disagree' ? 1 : 0),
    }));
    await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id, voteType }),
    });
  };

  const agreeCount = currentPost.agree_count ?? 0;
  const disagreeCount = currentPost.disagree_count ?? 0;
  const totalVotes = agreeCount + disagreeCount;
  const agreePercentage = totalVotes === 0 ? 50 : Math.round((agreeCount / totalVotes) * 100);

  const { initial, color } = getAnimalInitialAndColor(currentPost.anonymous_name || '');

  const CardContent = (
    <div
      className={`bg-slate-900/50 p-5 rounded-lg border border-slate-800 transition-colors ${
        isLink ? 'cursor-pointer hover:border-blue-500' : ''
      }`}
    >
      {/* Anonymous name display */}
      {currentPost.anonymous_name && (
        <p className="text-slate-400 text-sm italic mb-2">{currentPost.anonymous_name}</p>
      )}

      {/* Post content */}
      <p className="text-slate-200 text-lg">{currentPost.content}</p>

      {/* Private Comment badge with colored circle icon */}
      <div className="flex items-center justify-end mt-3">
        <span
          className="flex items-center justify-center rounded-full text-xs font-semibold shadow"
          style={{
            minWidth: '40px',
            height: '24px',
            backgroundColor: '#4f46e5',
            color: '#dbd4f7',
            gap: '6px',
            padding: '0 8px',
          }}
        >
          <span
            className="flex items-center justify-center rounded-full w-6 h-6 font-bold"
            style={{ backgroundColor: color }}
          >
            {initial}
          </span>
          {typeof commentCount === 'number'
            ? commentCount === 0
              ? 'No private comments'
              : `Private Comments: ${commentCount}`
            : null}
        </span>
      </div>

      {/* Voting segmented UI */}
      <div className="mt-6 pt-4 border-t border-slate-800 flex justify-center gap-6">
        {userVote ? (
          <>
            <div className="flex flex-col items-center">
              <span className="text-red-400 font-bold">{currentPost.label_disagree ?? 'Disagree'}</span>
              <span>{disagreeCount}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-green-400 font-bold">{currentPost.label_agree ?? 'Agree'}</span>
              <span>{agreeCount}</span>
            </div>
          </>
        ) : (
          <>
            <button
              className="px-4 py-2 text-white rounded-full bg-green-600 hover:bg-green-700"
              onClick={(e) => {
                e.stopPropagation();
                handleVote('agree');
              }}
            >
              Agree
            </button>
            <button
              className="px-4 py-2 text-white rounded-full bg-red-600 hover:bg-red-700"
              onClick={(e) => {
                e.stopPropagation();
                handleVote('disagree');
              }}
            >
              Disagree
            </button>
          </>
        )}
      </div>

      {userVote && (
        <p className="text-center text-xs text-slate-400 mt-2">
          {agreePercentage}% Agreed ({totalVotes} total votes)
        </p>
      )}
    </div>
  );

  return isLink ? <Link href={`/post/${post.id}`}>{CardContent}</Link> : CardContent;
};

export default PostCard;
