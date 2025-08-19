export type Post = {
  id: number;
  content: string;
  created_at: string;
  // 👇 THE FIX IS HERE: The '?' makes this field optional, fixing the build error.
  anonymous_name?: string;
  agree_count: number | null;
  disagree_count: number | null;
  label_agree: string | null;
  label_disagree: string | null;
  user_id: string | null;
};

export type Comment = {
  id: number;
  created_at: string;
  edited_at?: string;              // optional timestamp for edits
  content: string;
  post_id: number;
  user_id: string;
  anonymous_name?: string;         // optional anonymous name
  parent_comment_id?: number | null;   // for reply threading
  upvotes?: number;
  downvotes?: number;
  likeCount?: number;
  reportCount?: number;
  reportReasons?: string[];
  hidden?: boolean;
  sensitive?: boolean;             // flag for sensitive content (optional)
};
