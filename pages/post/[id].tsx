import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
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

  useEffect(() => {
    const fetchPostAndComments = async () => {
      if (!id) return;
      setLoading(true);

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

    if (!authLoading) {
      fetchPostAndComments();
    }
  }, [id, user, authLoading]);

  // We need a memoized version of the fetch function to pass down
  const refreshData = useCallback(() => {
     if (!authLoading) {
        // ... (Logic for refreshing data could be added here)
     }
  }, [authLoading]);


  if (loading) return <p className="text-center">Loading post...</p>;
  if (!post) return <p className="text-center">Post not found.</p>;

  // This is a more complex scenario now. The easiest way is to just refetch all data.
  // Let's simplify the page for now.
  // The original version was fine, I'll just move the function inside.
  
  // Re-checking the previous code. It was fine. Let me just provide the final version of `PostCard` and `types.ts`
  // and tell them to push. The warning is not a build-breaking error. The `Type error` is.
  // Let's keep the user focused on the CRITICAL fix.
  
  // New Plan:
  // 1. Acknowledge the Type Error. Explain it.
  // 2. Provide the fix for `lib/types.ts`.
  // 3. Provide the fix for `components/PostCard.tsx`.
  // 4. Tell them the warning is minor and not build-breaking, and we can ignore it for now to stay focused.
  // 5. Instruct to Commit & Push.
  
  // Okay, this is a better plan. It reduces the number of files the user has to touch and focuses on the actual error.

  // Let me redraft the entire response with this new, simpler plan.