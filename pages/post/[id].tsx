// pages/post/[id].tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/auth';
import { Post, Comment } from '../../lib/types';
import PostCard from '../../components/PostCard';
import CommentList from '../../components/CommentList';
import CommentForm from '../../components/CommentForm';
import Link from 'next/link';

const PostPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0); // ✅ unified count
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [hasCommented, setHasCommented] = useState(false);

  const fetchPost = async () => {
    if (!id) return;

    const { data: postData } = await supabase
      .from('posts')
      .select(
        '*, comments(count)' // fetch count directly
      )
      .eq('id', Number(id))
      .single();

    if (postData) {
      setPost(postData);
      const owner = !!(user && postData.user_id === user.id);
      setIsOwner(owner);

      // extract comments count from relation
      const count = postData.comments?.[0]?.count || 0;
      setCommentCount(count);

      // check if current user has commented (if not owner)
      if (user && !owner) {
        const { data: existing } = await supabase
          .from('comments')
          .select('id')
          .eq('post_id', Number(id))
          .eq('user_id', user.id)
          .maybeSingle();
        setHasCommented(!!existing);
      }
    }
  };

  const fetchComments = async () => {
    if (!id) return;
    const { data: commentsData } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', Number(id))
      .order('created_at', { ascending: true });
    setComments(commentsData || []);
  };

  const initLoad = async () => {
    setLoading(true);
    await fetchPost();
    // load full comments only if allowed
    if (user && (isOwner || hasCommented)) {
      await fetchComments();
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading) {
      initLoad();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, authLoading, hasCommented]);

  const handleCommentSuccess = async () => {
    setHasCommented(true);
    await fetchComments();
    await fetchPost(); // updates count
  };

  if (loading) return <p className="text-center">Loading post...</p>;
  if (!post) return <p className="text-center">Post not found.</p>;

  return (
    <div className="w-full flex flex-col gap-6">
      <PostCard post={{ ...post, comments: [{ count: commentCount }] }} />

      {/* Owner / Already commented */}
      {(isOwner || hasCommented) && (
        <div className="border-t border-slate-800 pt-6">
          <h3 className="text-xl font-bold text-white mb-4">
            Private Comments ({commentCount})
          </h3>
          <CommentList comments={comments} />
          <CommentForm
            postId={post.id}
            onCommentSuccess={handleCommentSuccess}
          />
        </div>
      )}

      {/* First-time visitor */}
      {!isOwner && user && !hasCommented && (
        <>
          {commentCount > 0 ? (
            <div className="border-t border-indigo-500/60 pt-6 px-6 bg-gradient-to-r from-indigo-900/70 via-indigo-800/70 to-indigo-900/70 rounded-lg shadow-lg animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-blue-400 text-2xl">🔒</span>
                <h4 className="text-lg font-semibold text-white">
                  Contribute to see what others have said
                </h4>
              </div>
              <p className="text-slate-300 mb-5">
                This conversation already has {commentCount} comment{commentCount !== 1 && 's'}.
                Share your thoughts privately with the author to unlock and read them all.
              </p>
              <CommentForm
                postId={post.id}
                onCommentSuccess={handleCommentSuccess}
              />
            </div>
          ) : (
            <div className="border-t border-indigo-500/60 pt-6 px-6 bg-gradient-to-r from-indigo-900/70 via-indigo-800/70 to-indigo-900/70 rounded-lg shadow-lg animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-blue-400 text-2xl">💬</span>
                <h4 className="text-lg font-semibold text-white">
                  Be the first to share your thoughts
                </h4>
              </div>
              <p className="text-slate-300 mb-5">
                This post hasn’t received any comments yet. Your insight could start a private, meaningful conversation with the author.
              </p>
              <CommentForm
                postId={post.id}
                onCommentSuccess={handleCommentSuccess}
              />
            </div>
          )}
        </>
      )}

      {/* Not logged in */}
      {!isOwner && !user && (
        <div className="text-center mt-6 pt-6 border-t border-slate-800">
          <p className="text-slate-400">
            <Link href="/login">
              <span className="text-blue-400 hover:underline">Log in</span>
            </Link>{' '}
            to leave a private comment.
          </p>
        </div>
      )}
    </div>
  );
};

export default PostPage;
