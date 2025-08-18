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

  const fetchPostAndComments = async () => {
    if (!id) return;

    console.log('Router query id:', id);
    console.log('Type of id:', typeof id);
    console.log('fetchPostAndComments called');
    console.log('Current user ID:', user?.id);

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
      .select('id, created_at, content, anonymous_name, post_id, user_id')
      .eq('post_id', postIdNum)
      .order('created_at');
    setComments(allComments || []);
    console.log('All comment user IDs:', (allComments || []).map(c => c.user_id));
    console.log('Raw allComments:', allComments);

    if (owner) {
      setHasCommented(true);
    } else if (user) {
      const didComment = (allComments || []).some(
        (comment) => comment.user_id === user.id
      );
      setHasCommented(didComment);
      console.log('hasCommented:', didComment);
    } else {
      setHasCommented(false);
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

      {isOwner ? (
        <div className="border-t-2 border-dashed border-slate-800 pt-6">
          <h3 className="text-xl font-bold text-white mb-4">Private Comments ({comments.length})</h3>
          <CommentList comments={comments} />
          <CommentForm postId={post.id} onCommentSuccess={fetchPostAndComments} />
        </div>
      ) : user ? (
        <div className="border-t-2 border-dashed border-slate-800 pt-6">
          {hasCommented ? (
            <>
              <h3 className="text-xl font-bold text-white mb-4">Private Comments ({comments.length})</h3>
              <CommentList comments={comments} />
              <CommentForm postId={post.id} onCommentSuccess={fetchPostAndComments} />
            </>
          ) : (
            <>
              {/* Simple note instead of banners */}
              <p className="italic text-slate-400 mb-4">
                No private comments yet. Be the first to share your perspective.
              </p>
              <CommentForm postId={post.id} onCommentSuccess={fetchPostAndComments} />
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
    </div>
  );
};

export default PostPage;
