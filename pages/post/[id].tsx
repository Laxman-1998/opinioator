// pages/post/[id].tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/auth';
import { Post, Comment } from '../../lib/types';
import PostCard from '../../components/PostCard';
import CommentList from '../../components/CommentList';
import CommentForm from '../../components/CommentForm';
import FirstToCommentBanner from '../../components/FirstToCommentBanner';

const PostPage = ({ refreshPosts }: { refreshPosts?: () => void }) => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [hasCommented, setHasCommented] = useState(false);

  // Fetch post + comment count + ownership / commented status
  const fetchPost = async () => {
    if (!id) return;

    const { data: postData } = await supabase
      .from('posts')
      .select('*, comments(count)')
      .eq('id', Number(id))
      .single();

    if (postData) {
      setPost(postData);

      const owner = !!(user && postData.user_id === user.id);
      setIsOwner(owner);

      const count = postData.comments?.[0]?.count || 0;
      setCommentCount(count);

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

  // Fetch all private comments
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

  // On successful comment post
  const handleCommentSuccess = async () => {
    setHasCommented(true);
    setCommentCount((prev) => prev + 1); // instant UI update
    await fetchComments();
    await fetchPost(); // refresh from DB

    if (refreshPosts) {
      refreshPosts(); // tell feed to update counts
    }
  };

  if (loading) return <p className="text-center">Loading post...</p>;
  if (!post) return <p className="text-center">Post not found.</p>;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Post body */}
      <PostCard post={{ ...post, comments: [{ count: commentCount }] }} />

      {/* Owner or already commented — show private comments */}
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

      {/* Logged in, not owner, not commented yet → show banner */}
      {!isOwner && user && !hasCommented && (
        <FirstToCommentBanner
          commentCount={commentCount}
          postId={post.id}
          onCommentSuccess={handleCommentSuccess}
        />
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
