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
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [hasCommented, setHasCommented] = useState(false);

  const fetchPostAndComments = async (force = false) => {
    if (!id) return;
    setLoading(true);

    // Fetch the post
    const { data: postData } = await supabase
      .from('posts')
      .select('*')
      .eq('id', Number(id))
      .single();

    if (postData) {
      setPost(postData);

      // ✅ always boolean now
      const owner = !!(user && postData.user_id === user.id);
      setIsOwner(owner);

      // For non-owner, check if they have commented
      if (user && !owner) {
        const { data: existing } = await supabase
          .from('comments')
          .select('id')
          .eq('post_id', Number(id))
          .eq('user_id', user.id)
          .maybeSingle();

        setHasCommented(!!existing);
      }

      // Fetch comments if owner, has commented, or forced
      if (force || (user && (owner || hasCommented))) {
        const { data: commentsData } = await supabase
          .from('comments')
          .select('*')
          .eq('post_id', Number(id))
          .order('created_at', { ascending: true });

        setComments(commentsData || []);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading) {
      fetchPostAndComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, authLoading, hasCommented]);

  if (loading) return <p className="text-center">Loading post...</p>;
  if (!post) return <p className="text-center">Post not found.</p>;

  return (
    <div className="w-full flex flex-col gap-6">
      <PostCard post={post} />

      {/* Post owner view */}
      {isOwner && (
        <div className="border-t border-slate-800 pt-6">
          <h3 className="text-xl font-bold text-white mb-4">
            Private Comments ({comments.length})
          </h3>
          <CommentList comments={comments} />
          <CommentForm
            postId={post.id}
            onCommentSuccess={() => fetchPostAndComments(true)}
          />
        </div>
      )}

      {/* Participant (already commented) */}
      {!isOwner && hasCommented && (
        <div className="border-t border-slate-800 pt-6">
          <h3 className="text-xl font-bold text-white mb-4">
            Private Comments ({comments.length})
          </h3>
          <CommentList comments={comments} />
          <CommentForm
            postId={post.id}
            onCommentSuccess={() => fetchPostAndComments(true)}
          />
        </div>
      )}

      {/* First-time visitor */}
      {!isOwner && user && !hasCommented && (
        <>
          {comments.length > 0 ? (
            <div className="border-t border-slate-800 pt-6 px-6 bg-slate-900/70 rounded-lg shadow-md animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-blue-400 text-2xl">🔒</span>
                <h4 className="text-lg font-semibold text-white">
                  Contribute to see what others have said
                </h4>
              </div>
              <p className="text-slate-400 mb-5">
                Leave your own private comment for the author. Once you do, you'll unlock and be
                able to read {comments.length} other {comments.length === 1 ? 'comment' : 'comments'}.
              </p>
              <CommentForm
                postId={post.id}
                onCommentSuccess={() => {
                  setHasCommented(true);
                  fetchPostAndComments(true);
                }}
              />
            </div>
          ) : (
            <div className="border-t border-slate-800 pt-6 px-6 bg-slate-900/70 rounded-lg shadow-md animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-blue-400 text-2xl">💬</span>
                <h4 className="text-lg font-semibold text-white">
                  Be the first to comment
                </h4>
              </div>
              <p className="text-slate-400 mb-5">
                This post doesn’t have any comments yet. Share your thoughts privately with the author.
              </p>
              <CommentForm
                postId={post.id}
                onCommentSuccess={() => {
                  setHasCommented(true);
                  fetchPostAndComments(true);
                }}
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
