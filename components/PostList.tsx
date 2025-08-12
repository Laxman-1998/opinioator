// components/PostList.tsx

import PostCard from './PostCard';
// 1. Import the new Database types
import type { Database } from '../lib/database.types';

// 2. Define our Post type using the official 'Row' type from Supabase
type Post = Database['public']['Tables']['posts']['Row'];

const PostList = ({ posts }: { posts: Post[] }) => {
  return (
    <div className="w-full flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList;