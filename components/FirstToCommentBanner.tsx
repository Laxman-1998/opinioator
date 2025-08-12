import CommentForm from './CommentForm';

type FirstToCommentBannerProps = {
  commentCount: number;
  postId: number;
  onCommentSuccess: () => void;
};

const AnimatedIcon = ({ symbol, label }: { symbol: string; label: string }) => (
  <span
    role="img"
    aria-label={label}
    className="text-blue-400 text-2xl animate-pulse"
  >
    {symbol}
  </span>
);

const FirstToCommentBanner = ({
  commentCount,
  postId,
  onCommentSuccess,
}: FirstToCommentBannerProps) => {
  return (
    <section
      className="border-t border-indigo-500/60 pt-6 px-6 bg-gradient-to-r from-indigo-900/70 via-indigo-800/70 to-indigo-900/70 rounded-lg shadow-lg animate-fade-in"
      aria-live="polite"
    >
      {commentCount > 0 ? (
        <>
          <div className="flex items-center gap-3 mb-3">
            <AnimatedIcon symbol="🔒" label="Locked comments" />
            <h4 className="text-lg font-semibold text-white">
              Contribute to see what others have said
            </h4>
          </div>
          <p className="text-slate-300 mb-5">
            This conversation already has {commentCount} comment
            {commentCount !== 1 && 's'}. Share your thoughts privately with the
            author to unlock and read them all.
          </p>
          <CommentForm postId={postId} onCommentSuccess={onCommentSuccess} />
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-3">
            <AnimatedIcon symbol="💬" label="Chat bubble" />
            <h4 className="text-lg font-semibold text-white">
              Be the first to share your thoughts
            </h4>
          </div>
          <p className="text-slate-300 mb-5">
            This post hasn’t received any comments yet. Your insight could start
            a private, meaningful conversation with the author.
          </p>
          <CommentForm postId={postId} onCommentSuccess={onCommentSuccess} />
        </>
      )}
    </section>
  );
};

export default FirstToCommentBanner;
