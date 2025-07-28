import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import { Post } from '../lib/types';

// This component receives a 'data' prop from React Flow containing our post
const MindMapNode = ({ data }: { data: { post: Post, onClick: () => void } }) => {
  const { post, onClick } = data;
  const agreeCount = post.agree_count ?? 0;
  const disagreeCount = post.disagree_count ?? 0;
  const totalVotes = agreeCount + disagreeCount;
  // Calculate a color gradient from red -> purple -> green
  const sentiment = totalVotes === 0 ? 0.5 : agreeCount / totalVotes;
  const hue = sentiment * 120; // 0 is red, 120 is green

  return (
    <motion.div
      onClick={onClick}
      className="w-24 h-24 rounded-full cursor-pointer flex items-center justify-center text-center p-2 shadow-lg"
      style={{
        backgroundColor: `hsl(${hue}, 50%, 20%)`,
        boxShadow: `0 0 15px 3px hsl(${hue}, 70%, 50%)`,
      }}
      whileHover={{ scale: 1.1 }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-white text-xs font-semibold line-clamp-3 overflow-hidden">
        {post.content}
      </p>
      {/* Handles for connecting lines (for future use) */}
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0" />
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0" />
    </motion.div>
  );
};

export default memo(MindMapNode);