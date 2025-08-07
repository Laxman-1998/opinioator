import { useState, useEffect } from 'react';
import Slider from 'rc-slider';
import { Post } from '../lib/types';
import Link from 'next/link';

type PostCardProps = {
  post: Post;
  isLink?: boolean;
};

const PostCard = ({ post, isLink = true }: PostCardProps) => {
  const [agreeCount, setAgreeCount] = useState(post.agree_count ?? 0);
  const [disagreeCount, setDisagreeCount] = useState(post.disagree_count ?? 0);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState(50);

  useEffect(() => {
    setAgreeCount(post.agree_count ?? 0);
    setDisagreeCount(post.disagree_count ?? 0);
    setUserVote(localStorage.getItem(`voted_on_post_${post.id}`));
  }, [post]);

  const handleVote = async (voteType: 'agree' | 'disagree') => {
    if (userVote) return;
    localStorage.setItem(`voted_on_post_${post.id}`, voteType);
    setUserVote(voteType);
    if (voteType === 'agree') {
      setAgreeCount(c => c + 1);
    } else {
      setDisagreeCount(c => c + 1);
    }
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
  
  const totalVotes = agreeCount + disagreeCount;
  const agreePercentage = totalVotes === 0 ? 50 : Math.round((agreeCount / totalVotes) * 100);

  const CardContent = (
    <div className={`bg-slate-900/50 p-5 rounded-lg border border-slate-800 transition-colors ${isLink ? 'cursor-pointer hover:border-blue-500' : ''}`}>
      {post.anonymous_name && (
        <p className="text-slate-400 text-sm italic mb-2">
          {/* 👇 THE FIX IS HERE: We remove the extra star from this line */}
          {post.anonymous_name}
        </p>
      )}

      <p className="text-slate-200 text-lg">{post.content}</p>
      
      <div className="mt-6 pt-4 border-t border-slate-800">
        {userVote ? (
            <div>
              <div className="flex justify-between text-sm font-bold mb-1">
                <span className="text-red-400">{post.label_disagree ?? 'Disagree'}</span>
                <span className="text-green-400">{post.label_agree ?? 'Agree'}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-red-500 via-purple-500 to-green-500 h-2.5 rounded-full" style={{ width: `${agreePercentage}%` }} />
              </div>
              <p className="text-center text-xs text-slate-400 mt-2">{agreePercentage}% Agreed ({totalVotes} total votes)</p>
            </div>
        ) : (
            <div onClick={(e) => isLink && e.stopPropagation()}>
              <div className="flex justify-between text-sm font-bold mb-1">
                <span className="text-red-400">{post.label_disagree ?? 'Disagree'}</span>
                <span className="text-green-400">{post.label_agree ?? 'Agree'}</span>
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

  return isLink ? (
    <Link href={`/post/${post.id}`} key={post.id}>
      <a>{CardContent}</a>
    </Link>
  ) : (
    CardContent
  );
};

export default PostCard;