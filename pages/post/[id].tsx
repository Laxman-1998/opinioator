// pages/post/[id].tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/auth';
import { Post, Comment } from '../../lib/types';
import PostCard from '../../components/PostCard';
import CommentList from '../../components/CommentList';
import CommentForm from '../../components/CommentForm';
import ReportModal from '../../components/ReportModal'; // Import the modal
import Link from 'next/link';
import toast from 'react-hot-toast';

const PostPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [hasCommented, setHasCommented] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  // Modal state for reporting
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<number | null>(null);

  const fetchPostAndComments = async () => {
    if (!id) return;
    setLoading(true);
    const postIdNum = Number(id);
    const { data: postData } = await supabase.from('posts').select('*').eq('id', postIdNum).single();
    setPost(postData);
    const owner = user && postData && postData.user_id === user.id;
    setIsOwner(!!owner);
    if (!postData) {
      setLoading(false);
      return;
    }
    const { data: allComments } = await supabase
      .from('comments')
      .select('id, created_at, content, anonymous_name, post_id, user_id, upvotes, downvotes, likeCount, reportCount, edited_at')
      .eq('post_id', postIdNum)
      .order('created_at');
    setComments(allComments || []);
    if (owner) {
      setHasCommented(true);
    } else if (user) {
      const didComment = (allComments || []).some(
        (comment) => comment.user_id === user.id
      );
      setHasCommented(didComment);
    } else {
      setHasCommented(false);
    }
    setLoading(false);
  };

  // Open report modal
  const handleReport = (commentId: number) => {
    setReportingCommentId(commentId);
    setReportModalOpen(true);
  };

  const onReported = () => {
    toast.success('Thank you for reporting. Our team will review the comment.');
    setReportModalOpen(false);
    setReportingCommentId(null);
    setRefreshCount(c => c + 1);
  };

  // Voting and liking handlers with loading and toast feedback
  const handleUpvote = async (commentId: number) => {
    toast.loading('Upvoting comment...');
    try {
      await supabase.rpc('increment_comment_upvote', { comment_id: commentId });
      toast.dismiss();
      toast.success('Upvoted!');
      setRefreshCount(c => c + 1);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to upvote comment');
    }
  };

  const handleDownvote = async (commentId: number) => {
    toast.loading('Downvoting comment...');
    try {
      await supabase.rpc('increment_comment_downvote', { comment_id: commentId });
      toast.dismiss();
      toast.success('Downvoted!');
      setRefreshCount(c => c + 1);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to downvote comment');
    }
  };

  const handleLike = async (commentId: number) => {
    toast.loading('Liking comment...');
    try {
      await supabase.rpc('increment_comment_like', { comment_id: commentId });
      toast.dismiss();
      toast.success('Liked!');
      setRefreshCount(c => c + 1);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to like comment');
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchPostAndComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, authLoading, refreshCount]);

  if (loading)
    return (
      <div className="text-center py-10">
        <p className="mt-2 text-gray-600">Loading post...</p>
      </div>
    );

  if (!post) return <p className="text-center">Post not found.</p>;

  return (
    <div className="w-full flex flex-col gap-6">
      <PostCard post={post} commentCount={comments.length} />
      {isOwner ? (
        <div className="border-t-2 border-dashed border-slate-800 pt-6">
          <h3 className="text-xl font-bold text-white mb-4">
            Private Comments ({comments.length})
          </h3>
          <CommentList
            comments={comments}
            onReport={handleReport}
            onUpvote={handleUpvote}
            onDownvote={handleDownvote}
            onLike={handleLike}
          />
          <CommentForm
            postId={post.id}
            onCommentSuccess={() => setRefreshCount((c) => c + 1)}
          />
        </div>
      ) : user ? (
        <div className="border-t-2 border-dashed border-slate-800 pt-6">
          {hasCommented ? (
            <>
              <h3 className="text-xl font-bold text-white mb-4">
                Private Comments ({comments.length})
              </h3>
              <CommentList
                comments={comments}
                onReport={handleReport}
                onUpvote={handleUpvote}
                onDownvote={handleDownvote}
                onLike={handleLike}
              />
              <CommentForm
                postId={post.id}
                onCommentSuccess={() => setRefreshCount((c) => c + 1)}
              />
            </>
          ) : (
            <>
              {comments.length === 0 ? (
                <p className="p-4 rounded-lg bg-gradient-to-r from-indigo-900 via-slate-900 to-fuchsia-900 shadow-lg border border-indigo-400 text-center italic text-indigo-200 font-semibold mb-4">
                  ✨ Be the first to add a private comment!
                </p>
              ) : (
                <p className="p-4 rounded-lg bg-gradient-to-r from-indigo-900 via-slate-900 to-fuchsia-900 shadow-lg border border-indigo-400 text-center italic text-indigo-200 font-semibold mb-4">
                  🔒 Private Comments ({comments.length}) — To view, add your own comment first.
                </p>
              )}
              <CommentForm
                postId={post.id}
                onCommentSuccess={() => setRefreshCount((c) => c + 1)}
              />
            </>
          )}
        </div>
      ) : (
        <div className="text-center mt-6 pt-6 border-t-2 border-dashed border-slate-800">
          <p className="text-slate-400">
            <Link href="/login">
              <span className="text-blue-400 hover:underline">Log in</span>
            </Link>{' '}
            to leave a private comment.
          </p>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        commentId={reportingCommentId}
        onReported={onReported}
      />
    </div>
  );
};

export default PostPage;
