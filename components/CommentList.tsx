import { Comment } from '../lib/types';

const CommentList = ({ comments }: { comments: Comment[] }) => (
  <div className="flex flex-col gap-4">
    {comments.map((comment) => (
      <div key={comment.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <p className="text-sm text-slate-400 font-bold">{comment.anonymous_name} said:</p>
        <p className="text-slate-200 mt-2">{comment.content}</p>
      </div>
    ))}
  </div>
);

export default CommentList;
