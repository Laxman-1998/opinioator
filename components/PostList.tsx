// components/PostList.tsx
import PostCard from './PostCard';
import { Post } from '../lib/types';

type PostWithCount = Post & {
  comments?: { count: number }[];
};

type Props = {
  posts: PostWithCount[];
};

const PostList = ({ posts }: Props) => {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} isLink={true} />
      ))}
    </div>
  );
};

export default PostList;
