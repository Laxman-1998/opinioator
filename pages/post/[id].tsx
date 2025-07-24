// pages/post/[id].tsx

import { GetServerSideProps } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '../../lib/database.types';

// Your existing components
import PostCard from '../../components/PostCard';
import CommentForm from '../../components/CommentForm';

// This function runs on the server to get data before the page loads
export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createServerSupabaseClient(context);
  const { id } = context.params!;

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id as string)
    .single();

  if (!post) {
    return { notFound: true }; // Redirect to a 404 page if post doesn't exist
  }

  return {
    props: {
      post,
    },
  };
};

// Your Page Component
export default function PostPage({ post }: { post: Database['public']['Tables']['posts']['Row'] }) {
  return (
    <div className="w-full flex flex-col items-center gap-6 p-4">
      {/* We continue to use your PostCard component */}
      <PostCard post={post} />

      {/* And we add the new CommentForm component */}
      <CommentForm postId={post.id.toString()} />

      <div className="bg-blue-900/30 text-blue-200 text-sm p-3 rounded-lg text-center max-w-xl">
        This is your private page. Bookmark the URL to check back on the results and comments.
      </div>
    </div>
  );
}