import { motion } from 'framer-motion';
import { Post } from '../lib/types';

const DashboardPostCard = ({ post, onClick }: { post: Post; onClick: () => void }) => {
  const agreeCount = post.agree_count ?? 0;
  const disagreeCount = post.disagree_count ?? 0;
  const totalVotes = agreeCount + disagreeCount;
  const sentiment = totalVotes === 0 ? 0.5 : agreeCount / totalVotes;
  const hue = sentiment * 120; // 0 is red, 120 is green

  return (
    <motion.div
      className="relative bg-slate-900/50 border border-slate-800 rounded-xl p-6 cursor-pointer group"
      onClick={onClick}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      {/* Comet Tail Effect */}
      <div 
        className="absolute top-1/2 left-0 w-full h-24 blur-3xl -translate-y-1/2 opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10"
        style={{ background: `linear-gradient(to right, hsl(${hue}, 70%, 50%), transparent)` }}
      />
      <p className="text-white font-semibold text-lg mb-4 line-clamp-4">{post.content}</p>
      <div className="flex justify-between items-end mt-auto">
        <div className="text-xs text-slate-400">
          <p>{totalVotes} votes</p>
          <p>{new Date(post.created_at).toLocaleDateString()}</p>
        </div>
        <p className="text-lg font-bold" style={{ color: `hsl(${hue}, 70%, 60%)` }}>
          {totalVotes > 0 ? `${Math.round(sentiment * 100)}%` : '--%'}
        </p>
      </div>
    </motion.div>
  );
};

export default DashboardPostCard;