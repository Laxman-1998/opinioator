// components/PostList.tsx
import PostCard from './PostCard';
import { Post } from '../lib/types';

type PostWithCount = Post & {
  comments?: { count: number }[];
};

type PostListProps = {
  posts: PostWithCount[];
  refreshPosts?: () => void;
};

export default function PostList({ posts, refreshPosts }: PostListProps) {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          isLink={true}
          refreshPosts={refreshPosts}
        />
      ))}
    </div>
  );
}
