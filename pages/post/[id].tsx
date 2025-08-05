import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/auth';
import { Post, Comment } from '../../lib/types';
import PostCard from '../../components/PostCard';
import CommentList from '../../components/CommentList';

const PostPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  
  const fetchPostAndComments = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    // Note: This still uses select('*'). We can refine this later if needed,
    // but the main lists are fixed which solves the build error.
    const { data: postData } = await supabase.from('posts').select('*').eq('id', id).single();
    
    if (postData) {
      setPost(postData as Post); // Asserting the type here
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
  }, [authLoading, fetchPostAndComments]); // This now correctly includes the dependency

  if (loading) return <p className="text-center">Loading post...</p>;
  if (!post) return <p className="text-center">Post not found.</p>;

  return (
    <div className="w-full flex flex-col gap-6">
      <PostCard post={post} />
      {isOwner && (
        <div className="border-t-2 border-dashed border-slate-800 pt-6">
          <h3 className="text-xl font-bold text-white mb-4">Private Comments ({comments.length})</h3>
          <CommentList comments={comments} />
        </div>
      )}
    </div>
  );
};

export default PostPage;