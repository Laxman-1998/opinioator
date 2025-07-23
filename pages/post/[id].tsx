import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import PostCard from '../../components/PostCard'; // Import our new PostCard
import { Post } from '../../lib/types';

const PostPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      const { data } = await supabase.from('posts').select('*').eq('id', id).single();
      setPost(data);
      setLoading(false);
    };
    fetchPost();
  }, [id]);

  if (loading) return <p className="text-center">Loading post...</p>;
  if (!post) return <p className="text-center">Post not found.</p>;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* We now render the PostCard component and pass the post data to it */}
      <PostCard post={post} />

      <div className="bg-blue-900/30 text-blue-200 text-sm p-3 rounded-lg text-center">
        This is your private page. Bookmark the URL to check back on the results and comments.
      </div>
    </div>
  );
};

export default PostPage;