import { motion } from 'framer-motion';
import { Post } from '../lib/types';

const DashboardPostCard = ({ post, onClick, index }: { post: Post; onClick: () => void; index: number }) => {
  const agreeCount = post.agree_count ?? 0;
  const disagreeCount = post.disagree_count ?? 0;
  const totalVotes = agreeCount + disagreeCount;
  const sentiment = totalVotes === 0 ? 0.5 : agreeCount / totalVotes;

  return (
    <motion.div
      className="relative bg-slate-900/50 border border-slate-800 rounded-xl p-6 cursor-pointer group backdrop-blur-sm transition-all duration-200"
      onClick={onClick}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20, delay: index * 0.05 }}
      whileHover={{ scale: 1.03, borderColor: '#3b82f6', boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)' }}
    >
      <p className="text-white font-semibold text-lg mb-4 line-clamp-4">{post.content}</p>
      <div className="flex justify-between items-end mt-auto">
        <div className="text-xs text-slate-400">
          <p>{totalVotes} votes</p>
          <p>{new Date(post.created_at).toLocaleDateString()}</p>
        </div>
        <p className="text-lg font-bold" style={{ color: `hsl(${sentiment * 120}, 70%, 60%)` }}>
          {totalVotes > 0 ? `${Math.round(sentiment * 100)}%` : '--%'}
        </p>
      </div>
    </motion.div>
  );
};

export default DashboardPostCard;