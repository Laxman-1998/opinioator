export type Post = {
  id: number;
  created_at: string;
  content: string;
  agree_count: number;
  disagree_count: number;
  label_agree: string;
  label_disagree: string;
  user_id: string; // Make sure this line exists from our previous step
};

// Add this new type
export type Comment = {
  id: number;
  created_at: string;
  content: string;
  post_id: number;
  user_id: string;
};
