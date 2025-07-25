// components/PostCard.tsx

import { useState, useEffect } from 'react';
import Slider from 'rc-slider';

// 1. Import the new Database types from the auto-generated file
import type { Database } from '../lib/database.types';

// 2. Define our Post type using the official 'Row' type from Supabase
type Post = Database['public']['Tables']['posts']['Row'];

type PostCardProps = {
  post: Post;
};

const PostCard = ({ post }: PostCardProps) => {
  const [currentPost, setCurrentPost] = useState(post);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState(50);

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

    // 3. SAFELY update the local state, handling potential nulls
    setCurrentPost(prevPost => ({
      ...prevPost,
      [`${voteType}_count`]: (prevPost[`${voteType}_count`] ?? 0) + 1
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

  // 4. SAFELY calculate votes, providing 0 as a fallback for null
  const agreeCount = currentPost.agree_count ?? 0;
  const disagreeCount = currentPost.disagree_count ?? 0;
  const totalVotes = agreeCount + disagreeCount;
  const agreePercentage = totalVotes === 0 ? 50 : Math.round((agreeCount / totalVotes) * 100);

  return (
    <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800">
      <p className="text-slate-200 text-lg">{currentPost.content}</p>

      <div className="mt-6 pt-4 border-t border-slate-800">
        {userVote ? (
          <div>
            <div className="flex justify-between text-sm font-bold mb-1">
              <span className="text-red-400">{currentPost.label_disagree}</span>
              <span className="text-green-400">{currentPost.label_agree}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
              <div  
                className="bg-gradient-to-r from-red-500 via-purple-500 to-green-500 h-2.5 rounded-full"  
                style={{ width: `${agreePercentage}%` }}
              ></div>
            </div>
            <p className="text-center text-xs text-slate-400 mt-2">{agreePercentage}% Agreed ({totalVotes} total votes)</p>
          </div>
        ) : (
          <div>
            <div className="flex justify-between text-sm font-bold mb-1">
              <span className="text-red-400">{currentPost.label_disagree}</span>
              <span className="text-green-400">{currentPost.label_agree}</span>
            </div>
            <Slider
              min={0}
              max={100}
              value={sliderValue}
              onChange={(value) => setSliderValue(Array.isArray(value) ? value[0] : value)}
              onAfterChange={handleSliderRelease}
              trackStyle={{ backgroundColor: '#3b82f6', height: 10 }}
              handleStyle={{ borderColor: '#3b82f6', backgroundColor: 'white', height: 20, width: 20, marginTop: -5 }}
              railStyle={{ backgroundColor: '#374151', height: 10 }}
            />
            <p className="text-center text-xs text-slate-500 mt-2">Drag the slider to cast your vote</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;