export type Post = {
  id: number;
  content: string;
  user_id: string | null;
  created_at: string;
  agree_count: number | null;
  disagree_count: number | null;
  label_agree: string | null;
  label_disagree: string | null;
  anonymous_name: string; // ✅ NEW FIELD
};

export type Comment = {
  id: number;
  created_at: string;
  content: string;
  post_id: number;
  user_id: string;
};