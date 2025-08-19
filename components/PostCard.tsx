// components/PostCard.tsx
import { useState, useEffect } from 'react';
import Slider from 'rc-slider';
import { Post } from '../lib/types';
import Link from 'next/link';

// Avatar utility. You can move this to a separate Avatar.tsx if reusing.
const Avatar = ({ name }: { name: string }) => {
  const colors = [
    '#f87171', // red-400
    '#60a5fa', // blue-400
    '#34d399', // green-400
    '#fbbf24', // yellow-400
    '#a78bfa', // purple-400
    '#f43f5e', // pink-500
    '#22d3ee', // cyan-400
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = colors[hash % colors.length];
  const initials = name
    .split('_')
    .map((part) => part[0].toUpperCase())
    .join('');
  return (
    <div
      className="flex items-center justify-center rounded-full text-white font-bold select-none mr-2"
      style={{ backgroundColor: color, width: 32, height: 32, flexShrink: 0 }}
      title={name.replace(/_/g, ' ')}
    >
      {initials}
    </div>
  );
};

// Updated type: now accepts an optional commentCount prop for badge
type PostCardProps = {
  post: Post;
  isLink?: boolean;
  commentCount?: number;
};

const PostCard = ({ post, isLink = true, commentCount }: PostCardProps) => {
  const [currentPost, setCurrentPost] = useState(post);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState(50);

  useEffect(() => {
    const vote = localStorage.getItem(`voted_on_post_${post.id}`);
    if (vote) setUserVote(vote);
  }, [post.id]);

  const handleVote = async (voteType: 'agree' | 'disagree') => {
    if (userVote) return;
    localStorage.setItem(`voted_on_post_${post.id}`, voteType);
    setUserVote(voteType);
    setCurrentPost((prevPost) => ({
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

  const handleSliderRelease = (value: number | number[]) => {
    if (typeof value !== 'number' || userVote) return;
    const voteType = value >= 50 ? 'agree' : 'disagree';
    handleVote(voteType);
  };

  const agreeCount = currentPost.agree_count ?? 0;
  const disagreeCount = currentPost.disagree_count ?? 0;
  const totalVotes = agreeCount + disagreeCount;
  const agreePercentage =
    totalVotes === 0 ? 50 : Math.round((agreeCount / totalVotes) * 100);

  // ========
  // Card JSX
  // ========
  const CardContent = (
    <div
      className={`bg-slate-900/50 p-5 rounded-lg border border-slate-800 transition-colors ${
        isLink ? 'cursor-pointer hover:border-blue-500' : ''
      }`}
    >
      {/* Avatar + Anonymous name */}
      {currentPost.anonymous_name && (
        <div className="flex items-center mb-2">
          <Avatar name={currentPost.anonymous_name} />
          <p className="text-slate-400 text-sm italic">{currentPost.anonymous_name}</p>
        </div>
      )}

      {/* Post content */}
      <p className="text-slate-200 text-lg">{currentPost.content}</p>

      {/* Private Comment badge at the bottom right */}
      <div className="flex items-center justify-end mt-3">
        <span className="px-3 py-1 bg-indigo-800/70 rounded-full text-xs text-indigo-100 font-semibold shadow">
          {typeof commentCount === 'number'
            ? commentCount === 0
              ? 'No private comments'
              : `Private Comments: ${commentCount}`
            : null}
        </span>
      </div>

      {/* Voting and slider */}
      <div className="mt-6 pt-4 border-t border-slate-800">
        {userVote ? (
          <div>
            <div className="flex justify-between text-sm font-bold mb-1">
              <span className="text-red-400">
                {currentPost.label_disagree ?? 'Disagree'}
              </span>
              <span className="text-green-400">
                {currentPost.label_agree ?? 'Agree'}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-red-500 via-purple-500 to-green-500 h-2.5 rounded-full"
                style={{ width: `${agreePercentage}%` }}
              />
            </div>
            <p className="text-center text-xs text-slate-400 mt-2">
              {agreePercentage}% Agreed ({totalVotes} total votes)
            </p>
          </div>
        ) : (
          <div onClick={(e) => isLink && e.stopPropagation()}>
            <div className="flex justify-between text-sm font-bold mb-1">
              <span className="text-red-400">{currentPost.label_disagree ?? 'Disagree'}</span>
              <span className="text-green-400">{currentPost.label_agree ?? 'Agree'}</span>
            </div>
            <Slider
              min={0}
              max={100}
              value={sliderValue}
              onChange={(value) => setSliderValue(Array.isArray(value) ? value[0] : value)}
              onAfterChange={handleSliderRelease}
              trackStyle={{ backgroundColor: '#3b82f6', height: 10 }}
              handleStyle={{
                borderColor: '#3b82f6',
                backgroundColor: 'white',
                height: 20,
                width: 20,
                marginTop: -5,
              }}
              railStyle={{ backgroundColor: '#374151', height: 10 }}
            />
            <p className="text-center text-xs text-slate-500 mt-2">
              Drag the slider to cast your vote
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return isLink ? (
    <Link href={`/post/${post.id}`} key={post.id}>
      {CardContent}
    </Link>
  ) : (
    CardContent
  );
};

export default PostCard;
