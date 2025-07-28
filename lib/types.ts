export type Post = {
  id: number;
  created_at: string;
  content: string;
  agree_count: number | null;
  disagree_count: number | null;
  label_agree: string | null;
  label_disagree: string | null;
  user_id: string | null;
};

export type Comment = {
  id: number;
  created_at: string;
  content: string;
  post_id: number;
  user_id: string;
};