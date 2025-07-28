import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/auth';
import { Post, Comment } from '../../lib/types';
import PostCard from '../../components/PostCard';
import CommentList from '../../components/CommentList';
import CommentForm from '../../components/CommentForm';

const PostPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  const fetchPostAndComments = async () => {
    if (!id) return;
    const { data: postData } = await supabase.from('posts').select('*').eq('id', id).single();
    if (postData) {
      setPost(postData);
      if (user && postData.user_id === user.id) {
        setIsOwner(true);
        const { data: commentsData } = await supabase.from('comments').select('*').eq('post_id', id).order('created_at');
        if (commentsData) setComments(commentsData);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading) fetchPostAndComments();
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
          <h3 className="text-xl font-bold text-white mb-4">Leave a Private Comment</h3>
          <CommentForm postId={post.id} onCommentSuccess={() => {
            const formContainer = document.getElementById('comment-form-container');
            if (formContainer) {
              formContainer.innerHTML = `<div class="text-center p-8 bg-green-900/50 rounded-lg border border-green-700"><p>Your private comment has been sent to the author.</p></div>`;
            }
          }} />
        </div>
      ) : (
        <div className="text-center mt-6 pt-6 border-t-2 border-dashed border-slate-800">
          <p className="text-slate-400">You must be logged in to leave a comment.</p>
        </div>
      )}
    </div>
  );
};

export default PostPage;
