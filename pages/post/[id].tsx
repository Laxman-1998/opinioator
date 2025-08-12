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
  const [hasCommented, setHasCommented] = useState(false); // ✅ NEW

  const fetchPostAndComments = async () => {
    if (!id) return;

    setLoading(true);

    // Fetch the post
    const { data: postData } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (postData) {
      setPost(postData);

      // ✅ Determine ownership up front
      if (user && postData.user_id === user.id) {
        setIsOwner(true);
      }

      // ✅ Check if logged-in user has commented before (and is not the owner)
      if (user && postData.user_id !== user.id) {
        const { data: existing } = await supabase
          .from('comments')
          .select('id')
          .eq('post_id', id)
          .eq('user_id', user.id)
          .maybeSingle();

        setHasCommented(!!existing);
      }

      // ✅ Only fetch all comments if owner or has already commented
      if (user && (postData.user_id === user.id)) {
        const { data: commentsData } = await supabase
          .from('comments')
          .select('*')
          .eq('post_id', id)
          .order('created_at', { ascending: true });

        if (commentsData) setComments(commentsData);
      } 
      else if (user && hasCommented) {
        const { data: commentsData } = await supabase
          .from('comments')
          .select('*')
          .eq('post_id', id)
          .order('created_at', { ascending: true });

        if (commentsData) setComments(commentsData);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading) {
      fetchPostAndComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, authLoading]);

  if (loading) return <p className="text-center">Loading post...</p>;
  if (!post) return <p className="text-center">Post not found.</p>;

  return (
    <div className="w-full flex flex-col gap-6">
      <PostCard post={post} />

      {/* ✅ SHOW for Author */}
      {isOwner && (
        <div className="border-t-2 border-dashed border-slate-800 pt-6">
          <h3 className="text-xl font-bold text-white mb-4">
            Private Comments ({comments.length})
          </h3>
          <CommentList comments={comments} />
          <CommentForm postId={post.id} onCommentSuccess={fetchPostAndComments} />
        </div>
      )}

      {/* ✅ SHOW for Participant (has commented) */}
      {!isOwner && hasCommented && (
        <div className="border-t-2 border-dashed border-slate-800 pt-6">
          <h3 className="text-xl font-bold text-white mb-4">
            Private Comments ({comments.length})
          </h3>
          <CommentList comments={comments} />
          <CommentForm postId={post.id} onCommentSuccess={fetchPostAndComments} />
        </div>
      )}

      {/* ✅ SHOW for First-time visitor */}
      {!isOwner && user && !hasCommented && (
        <div className="border-t-2 border-dashed border-slate-800 pt-6 p-6 bg-slate-900/50 rounded-lg">
          <p className="mb-4 text-slate-400">
            Contribute a comment to see what others have said.
          </p>
          <CommentForm
            postId={post.id}
            onCommentSuccess={() => {
              setHasCommented(true);
              fetchPostAndComments();
            }}
          />
        </div>
      )}

      {/* Not logged in */}
      {!isOwner && !user && (
        <div className="text-center mt-6 pt-6 border-t-2 border-dashed border-slate-800">
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
