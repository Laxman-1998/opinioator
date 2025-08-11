export type Post = {
  id: number;
  content: string;
  created_at: string;
  anonymous_name: string; // The field is now correctly required
  agree_count: number | null;
  disagree_count: number | null;
  label_agree: string | null;
  label_disagree: string | null;
  user_id: string | null;
  country?: string | null; // Added optional country field
};

export type Comment = {
  id: number;
  created_at: string;
  content: string;
  post_id: number;
  user_id: string;
};