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

  // Fetch post & comments (conditional) and update states
  const fetchPostAndComments = async () => {
    if (!id) return;
    setLoading(true);

    // Fetch post
    const { data: postData } = await supabase.from('posts').select('*').eq('id', id).single();
    setPost(postData);

    // Determine owner status
    const owner = user && postData && postData.user_id === user.id;
    setIsOwner(!!owner);

    if (!postData) {
      setLoading(false);
      return;
    }

    let userHasCommented = false;
    let commentsData: Comment[] = [];

    if (owner) {
      // Owner sees all comments
      const { data } = await supabase
        .from('comments')
        .select('id, created_at, content, anonymous_name, post_id, user_id')
        .eq('post_id', id)
        .order('created_at');
      commentsData = data || [];
      setComments(commentsData);
      setHasCommented(true); // owner always considered having access to comments
    } else if (user) {
      // Check if user has commented
      const { data: existing } = await supabase
        .from('comments')
        .select('id')
        .eq('post_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      userHasCommented = !!existing;
      setHasCommented(userHasCommented);

      if (userHasCommented) {
        const { data } = await supabase
          .from('comments')
          .select('id, created_at, content, anonymous_name, post_id, user_id')
          .eq('post_id', id)
          .order('created_at');
        commentsData = data || [];
        setComments(commentsData);
      } else {
        setComments([]); // no comments until user comments
      }
    } else {
      setComments([]); // not logged in, no comments
      setHasCommented(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading) {
      fetchPostAndComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, authLoading, hasCommented]); // will refetch if hasCommented changes

  // Banner for zero comments
  const zeroCommentBanner = (
    <div className="p-5 mb-4 rounded-lg bg-gradient-to-r from-indigo-900 via-slate-900 to-fuchsia-900 shadow-lg border border-indigo-400 text-center">
      <h2
        className="text-2xl font-extrabold text-indigo-200 mb-2"
        style={{ fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.07em' }}
      >
        🌌 Be the First to Start a Private Space Conversation
      </h2>
      <p className="text-indigo-100">No one has commented privately yet. Start the cosmic conversation!</p>
    </div>
  );

  // Banner when comments exist but user hasn't contributed yet
  const contributeBanner = (
    <div className="p-5 mb-4 rounded-lg bg-gradient-to-r from-fuchsia-800 via-indigo-800 to-indigo-900 shadow-lg border border-indigo-400 text-center">
      <h2
        className="text-xl font-bold text-fuchsia-200 mb-2"
        style={{ fontFamily: 'Orbitron, sans-serif' }}
      >
        🚀 Contribute to Unlock {comments.length} Private Comments
      </h2>
      <p className="text-indigo-100">Share your insight privately to reveal what others have said to the author.</p>
    </div>
  );

  if (loading) return <p className="text-center">Loading post...</p>;
  if (!post) return <p className="text-center">Post not found.</p>;

  return (
    <div className="w-full flex flex-col gap-6">
      <PostCard post={post} />

      {/* AUTHOR VIEW: always show comments */}
      {isOwner ? (
        <div className="border-t-2 border-dashed border-slate-800 pt-6">
          <h3 className="text-xl font-bold text-white mb-4">Private Comments ({comments.length})</h3>
          <CommentList comments={comments} />
          <CommentForm postId={post.id} onCommentSuccess={fetchPostAndComments} />
        </div>
      ) : user ? (
        // Non-owner logged-in user
        <div className="border-t-2 border-dashed border-slate-800 pt-6">
          {hasCommented ? (
            <>
              <h3 className="text-xl font-bold text-white mb-4">Private Comments ({comments.length})</h3>
              <CommentList comments={comments} />
              <CommentForm postId={post.id} onCommentSuccess={fetchPostAndComments} />
            </>
          ) : (
            <>
              {/* Show correct banner */}
              {comments.length === 0 ? zeroCommentBanner : contributeBanner}
              <CommentForm postId={post.id} onCommentSuccess={fetchPostAndComments} />
            </>
          )}
        </div>
      ) : (
        // Not logged in
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
