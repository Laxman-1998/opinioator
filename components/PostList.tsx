import { Post } from '../lib/types';
import PostCard from './PostCard';

type PostListProps = {
  posts: Post[];
};

const PostList = ({ posts }: PostListProps) => {
  if (!posts || posts.length === 0) {
    return <p className="text-center text-slate-400">No opinions have been shared yet.</p>;
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList;