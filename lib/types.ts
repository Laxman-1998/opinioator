// This defines the complete shape of a single post object
export type Post = {
  id: number;
  created_at: string;
  content: string;
  agree_count: number;
  disagree_count: number;
  label_agree: string;
  label_disagree: string;
};