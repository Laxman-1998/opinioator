import { Comment } from '../lib/types';
import AnonymousCircle from './AnonymousCircle'; // Adjust import path if needed

type CommentListProps = {
  comments: Comment[];
  onReplyClick?: (commentId: number) => void;
};

const CommentList = ({ comments, onReplyClick }: CommentListProps) => {
  const parentComments = comments.filter(comment => !comment.parent_id);
  const repliesByParentId = comments.reduce<Record<number, Comment[]>>((acc, comment) => {
    if (comment.parent_id) {
      if (!acc[comment.parent_id]) acc[comment.parent_id] = [];
      acc[comment.parent_id].push(comment);
    }
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      {parentComments.map((comment) => (
        <div key={comment.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
          <div className="mb-1">
            <AnonymousCircle anonymousName={comment.anonymous_name || ''} />
          </div>
          <p className="text-slate-200 mt-2">{comment.content}</p>
          <button
            className="mt-2 text-xs text-blue-400 hover:underline"
            onClick={() => onReplyClick && onReplyClick(comment.id)}
          >
            Reply
          </button>
          {repliesByParentId[comment.id] && (
            <div className="ml-6 mt-4 flex flex-col gap-3 border-l border-slate-700 pl-4">
              {repliesByParentId[comment.id].map((reply) => (
                <div key={reply.id} className="bg-slate-700/50 p-3 rounded-md border border-slate-600">
                  <div className="mb-1">
                    <AnonymousCircle anonymousName={reply.anonymous_name || ''} />
                  </div>
                  <p className="text-slate-300 mt-1">{reply.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentList;
