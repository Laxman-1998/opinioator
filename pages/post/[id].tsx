import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
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
  const [commentSubmitted, setCommentSubmitted] = useState(false);

  const fetchPostAndComments = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data: postData } = await supabase.from('posts').select('*').eq('id', id).single();
    if (postData) {
      setPost(postData as Post);
      if (user && postData.user_id === user.id) {
        setIsOwner(true);
        const { data: commentsData } = await supabase.from('comments').select('*').eq('post_id', id).order('created_at');
        if (commentsData) setComments(commentsData);
      } else {
        setIsOwner(false);
      }
    }
    setLoading(false);
  }, [id, user]);

  useEffect(() => {
    if (!authLoading) {
      fetchPostAndComments();
    }
  }, [authLoading, fetchPostAndComments]);

  if (loading) return <p className="text-center">Loading post...</p>;
  if (!post) return <p className="text-center">Post not found.</p>;

  return (
    <div className="w-full flex flex-col gap-6">
      <PostCard post={post} />
      
      <div className="border-t-2 border-dashed border-slate-800 pt-6">
        {isOwner ? (
          // If you are the owner, show the private comments
          <>
            <h3 className="text-xl font-bold text-white mb-4">Private Comments ({comments.length})</h3>
            <CommentList comments={comments} />
          </>
        ) : user ? (
          // If you are logged in but NOT the owner, show the comment form
          commentSubmitted ? (
            <div className="text-center p-8 bg-green-900/50 rounded-lg border border-green-700">
              <p>Your private comment has been sent to the author.</p>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-white mb-4">Leave a Private Comment</h3>
              <p className="text-slate-400 mb-4 text-sm">Your comment will be sent directly and privately to the author of this post.</p>
              <CommentForm postId={post.id} onCommentSuccess={() => setCommentSubmitted(true)} />
            </>
          )
        ) : (
          // If not logged in, show a prompt to log in
          <div className="text-center">
            <p className="text-slate-400">
              <Link href="/login"><span className="text-blue-400 hover:underline">Log in</span></Link>
              {' '}to leave a private comment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostPage;